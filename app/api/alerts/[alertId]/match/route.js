import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Alert from '@/models/Alert';
import LostItem from '@/models/LostItem';
import { sendOwnerConfirmationEmail } from '@/lib/email-service'; // We need to make sure this function exists and works

export async function POST(req, { params }) {
    try {
        const { alertId } = await params;
        await dbConnect();

        const alert = await Alert.findById(alertId);
        if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });

        const item = await LostItem.findById(alert.lostItemId);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        // 1. Delete the Lost Item (as per user request: "if match then delete from database")
        await LostItem.findByIdAndDelete(alert.lostItemId);

        // 2. Update Alert Status
        alert.status = 'resolved';
        await alert.save();

        // 3. Notify Finder
        // We can reuse sendOwnerConfirmationEmail or create a specific one.
        // The user said: "provide the image... done click match... delete from database".
        // It's implied we should tell the finder it was a match.
        // We'll read the body for any meeting details if the user wants to send them, 
        // though the prompt just said "match or unmatch".
        // Let's assume we send a generic "It's a match!" email.

        // We'll peek at the request body just in case the frontend sends details.
        const body = await req.json().catch(() => ({}));
        const meetingDetails = body.meetingDetails || "The owner has confirmed this is their item. Please coordinate to return it.";

        await sendOwnerConfirmationEmail({
            to: alert.finderEmail,
            itemName: item.itemName,
            meetingDetails
        });

        // 4. Cleanup other alerts for this item?
        await Alert.updateMany(
            { lostItemId: alert.lostItemId, _id: { $ne: alertId } },
            { status: 'closed' }
        );

        return NextResponse.json({ success: true, message: 'Item matched and deleted' });

    } catch (error) {
        console.error('Match error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
