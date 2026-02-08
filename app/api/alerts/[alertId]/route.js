import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Alert from '@/models/Alert';
import LostItem from '@/models/LostItem';

export async function GET(req, { params }) {
    try {
        const { alertId } = await params;
        await dbConnect();

        const alert = await Alert.findById(alertId);
        if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });

        const item = await LostItem.findById(alert.lostItemId);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        return NextResponse.json({ alert, item });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
