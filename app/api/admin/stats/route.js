import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';
import Alert from '@/models/Alert';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(req) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const email = user.emailAddresses[0].emailAddress;
        if (email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Global Stats
        const totalItems = await LostItem.countDocuments();
        const resolvedItems = await LostItem.countDocuments({ isResolved: true });
        const totalAlerts = await Alert.countDocuments();
        const activeItems = totalItems - resolvedItems;

        // Recent System Activity
        const recentItems = await LostItem.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
            .then(items => items.map(i => ({ ...i, type: 'ITEM_POSTED', date: i.createdAt })));

        const recentAlerts = await Alert.find()
            .populate('lostItemId', 'itemName')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
            .then(alerts => alerts.map(a => ({ ...a, type: 'ALERT_SENT', date: a.createdAt })));

        const timeline = [...recentItems, ...recentAlerts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 20);

        return NextResponse.json({
            stats: {
                totalItems,
                resolvedItems,
                totalAlerts,
                activeItems
            },
            timeline
        });

    } catch (error) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
