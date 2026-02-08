import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Alert from '@/models/Alert';
import LostItem from '@/models/LostItem';
import nodemailer from 'nodemailer'; // Or reuse a service function

export async function POST(req, { params }) {
    try {
        const { alertId } = await params;
        await dbConnect();

        const alert = await Alert.findById(alertId);
        if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });

        const item = await LostItem.findById(alert.lostItemId);
        // Item might not exist if already deleted, but we should handle it gracefully?
        // If unmatching, item should still be there.

        // 1. Update Alert Status
        alert.status = 'rejected';
        await alert.save();

        // 2. Notify Finder
        // user said: "if unmatch then reply to the preson umatch"

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        await transporter.sendMail({
            from: `"Campus Lost & Found" <${process.env.SMTP_EMAIL}>`,
            to: alert.finderEmail,
            subject: `Update: Not a match for "${item ? item.itemName : 'Found Item'}"`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Match Update</h2>
                    <p>The owner has reviewed the details you provided.</p>
                    <p>Unfortunately, they have indicated that <strong>this is not their item</strong>.</p>
                    <p>Thank you for your honesty and effort in trying to return it!</p>
                </div>
            `
        });

        return NextResponse.json({ success: true, message: 'Unmatch confirmed' });

    } catch (error) {
        console.error('Unmatch error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
