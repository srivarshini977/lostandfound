import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(req) {
    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            return NextResponse.json({ error: 'SMTP_EMAIL or SMTP_PASSWORD is missing in .env.local' }, { status: 500 });
        }

        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Please provide an email query param, e.g. /api/test-email?email=you@example.com' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: `"Test" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: 'Test Email from Campus Lost & Found',
            html: '<h1>It works!</h1><p>Your Google SMTP is correctly configured.</p>',
        });

        return NextResponse.json({ success: true, messageId: info.messageId });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
