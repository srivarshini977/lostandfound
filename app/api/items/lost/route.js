import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';
import { syncUser } from '@/lib/userSync';

import User from '@/models/User';

// GET: Retrieve lost items with filters
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const location = searchParams.get('location');
        const ownerEmail = searchParams.get('ownerEmail'); // Filter by owner

        let query = {};

        // If filtering by owner, show all their items (resolved or not)
        if (ownerEmail) {
            query.ownerEmail = ownerEmail;
        } else {
            query.isResolved = false; // Public feed only shows unresolved
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        if (location) {
            query.lastSeenLocation = { $regex: location, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { itemName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const items = await LostItem.find(query).sort({ createdAt: -1 }).lean();

        // Enrich with User Details (Reputation/Badges)
        const emails = [...new Set(items.map(i => i.ownerEmail))];
        const users = await User.find({ email: { $in: emails } }).lean();
        const userMap = {};
        users.forEach(u => userMap[u.email] = u);

        const enrichedItems = items.map(item => ({
            ...item,
            ownerReputation: userMap[item.ownerEmail]?.reputationPoints || 0,
            ownerBadges: userMap[item.ownerEmail]?.badges || []
        }));

        return NextResponse.json(enrichedItems);
    } catch (error) {
        console.error('Error fetching items:', error);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }
}

import { findAndNotifyMatches } from '@/lib/matching-service';

// POST: Create a new lost item
export async function POST(req) {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify .edu email
        const email = user.emailAddresses[0].emailAddress;
        if (!email.endsWith('.edu') && email !== process.env.ADMIN_EMAIL) {
            // Updated to allow admin or edu emails, or loose restriction if desired
            return NextResponse.json({ error: 'Only .edu email addresses are allowed to post.' }, { status: 403 });
        }

        // Sync User to MongoDB
        await syncUser(user);

        await dbConnect();

        const data = await req.json();

        console.log('Received item payload:', { ...data, imageUrl: data.imageUrl ? 'String (length: ' + data.imageUrl.length + ')' : 'undefined' });

        if (!data.itemName || !data.category || !data.description || !data.dateLost || !data.lastSeenLocation) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newItem = await LostItem.create({
            ...data,
            reportType: data.reportType || 'lost', // Default to lost for backward compatibility
            ownerEmail: email,
        });

        // Trigger Smart Matching (Async - don't block response)
        const appUrl = `http://${req.headers.get('host')}`;
        findAndNotifyMatches(newItem, appUrl).catch(err => console.error('Matching Service Error:', err));

        return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
        console.error('Error creating item:', error);
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
    }
}

// PATCH: Mark as resolved
export async function PATCH(req) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await req.json();
        const email = user.emailAddresses[0].emailAddress;

        await dbConnect();
        const item = await LostItem.findOne({ _id: id });

        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        if (item.ownerEmail !== email) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        item.isResolved = true;
        await item.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json({ error: 'Error updating item' }, { status: 500 });
    }
}

// DELETE: Delete an item
export async function DELETE(req) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const email = user.emailAddresses[0].emailAddress;

        await dbConnect();
        const item = await LostItem.findOne({ _id: id });

        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        if (item.ownerEmail !== email) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        await LostItem.deleteOne({ _id: id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json({ error: 'Error deleting item' }, { status: 500 });
    }
}
