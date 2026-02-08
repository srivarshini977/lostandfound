import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';
import Alert from '@/models/Alert';
import { sendFoundItemEmail } from '@/lib/email-service';

export async function POST(req) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { lostItemId, foundLocation, message, mobile, department, imageUrl } = await req.json();
        const finderEmail = user.emailAddresses[0].emailAddress;

        if (!lostItemId || !foundLocation) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // 1. Fetch the Lost Item to get owner's email
        const item = await LostItem.findById(lostItemId);
        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        // 2. Create Alert record in DB (Pending Status)
        const newAlert = await Alert.create({
            lostItemId,
            finderEmail,
            foundLocation,
            mobile,
            department,
            foundImageUrl: imageUrl,
            message,
            emailStatus: 'pending' // Initial status
        });

        // 3. Send Email via Email Service
        const appUrl = `http://${req.headers.get('host')}`;

        const emailResult = await sendFoundItemEmail({
            to: item.ownerEmail,
            itemName: item.itemName,
            finderEmail,
            foundLocation,
            message,
            itemId: lostItemId,
            alertId: newAlert._id,
            appUrl
        });

        // 4. Update Alert and Item Status
        newAlert.emailStatus = emailResult.success ? 'sent' : 'failed';
        if (emailResult.emailId) newAlert.emailId = emailResult.emailId;
        if (!emailResult.success) newAlert.errorMessage = emailResult.error;
        await newAlert.save();

        if (emailResult.success) {
            await LostItem.findByIdAndUpdate(lostItemId, {
                $inc: { 'emailNotifications.notificationCount': 1 },
                $set: { 'emailNotifications.lastNotified': new Date() }
            });
        }

        return NextResponse.json({
            success: true,
            alert: newAlert,
            emailSent: emailResult.success
        });

    } catch (error) {
        console.error('Error sending alert:', error);
        return NextResponse.json({ error: 'Failed to process alert' }, { status: 500 });
    }
}
