import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';
import Alert from '@/models/Alert';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = user.emailAddresses[0].emailAddress;
        await dbConnect();

        // 1. Fetch Key Metrics
        // Fetch User for Gamification Stats
        const dbUser = await User.findOne({ email });
        const reputationPoints = dbUser?.reputationPoints || 0;
        const badges = dbUser?.badges || [];

        const itemsPosted = await LostItem.countDocuments({ ownerEmail: email });
        const itemsRecovered = await LostItem.countDocuments({ ownerEmail: email, isResolved: true });
        const alertsSent = await Alert.countDocuments({ finderEmail: email });

        // 2. Fetch Recent Activity (Limit 10 combined)
        // A. Items Posted
        const recentItems = await LostItem.find({ ownerEmail: email })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
            .then(items => items.map(i => ({ ...i, type: 'ITEM_POSTED', date: i.createdAt })));

        // B. Alerts Sent (as finder)
        const recentAlertsSent = await Alert.find({ finderEmail: email })
            .populate('lostItemId', 'itemName')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
            .then(alerts => alerts.map(a => ({ ...a, type: 'ALERT_SENT', date: a.createdAt })));

        // C. Alerts Received (as owner) - Need to find alerts for items owned by user
        const userItems = await LostItem.find({ ownerEmail: email }).select('_id');
        const userItemIds = userItems.map(i => i._id);
        const recentAlertsReceived = await Alert.find({ lostItemId: { $in: userItemIds } })
            .populate('lostItemId', 'itemName')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
            .then(alerts => alerts.map(a => ({ ...a, type: 'ALERT_RECEIVED', date: a.createdAt })));


        // Combine and Sort
        const timeline = [...recentItems, ...recentAlertsSent, ...recentAlertsReceived]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        return NextResponse.json({
            stats: {
                itemsPosted,
                itemsRecovered,
                alertsSent,
                reputationPoints,
                badges
            },
            timeline
        });

    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
