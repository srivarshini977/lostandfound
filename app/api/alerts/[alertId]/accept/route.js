import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Alert from '@/models/Alert';
import LostItem from '@/models/LostItem';
import User from '@/models/User';
import { sendOwnerConfirmationEmail } from '@/lib/email-service';

export async function POST(req, { params }) {
    try {
        const { alertId } = params;
        const { meetingDetails } = await req.json();

        await dbConnect();
        const alert = await Alert.findById(alertId);
        if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });

        const item = await LostItem.findById(alert.lostItemId);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        // Update status
        alert.status = 'accepted';
        await alert.save();

        // DESTRUCTIVE: Remove item from database as requested
        await LostItem.findByIdAndDelete(alert.lostItemId);
        // Also clean up other alerts for this item since it's gone?
        // await Alert.deleteMany({ lostItemId: alert.lostItemId, _id: { $ne: alertId } });
        // Keeping this alert record for gamification history (reputation points logic below needs it?)
        // The alert object 'alert' is already in memory, so we can use it.
        // But future queries to this alert might fail if they populate 'lostItemId'.


        // 5. Award Reputation to Finder
        const finder = await User.findOne({ email: alert.finderEmail });
        if (finder) {
            finder.reputationPoints = (finder.reputationPoints || 0) + 10; // +10 points per verified find

            // Check for 'Trusted Finder' badge (Threshold: 50 points)
            if (finder.reputationPoints >= 50 && !finder.badges.includes('Trusted Finder')) {
                finder.badges.push('Trusted Finder');
            }

            await finder.save();
            console.log(`[Gamification] Awarded 10 points to ${alert.finderEmail}. Total: ${finder.reputationPoints}`);
        }

        // Email Finder
        // Direct email without overrides as requested
        const recipientEmail = alert.finderEmail;

        await sendOwnerConfirmationEmail({
            to: recipientEmail,
            itemName: item.itemName,
            meetingDetails
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
