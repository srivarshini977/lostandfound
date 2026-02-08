import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { syncUser } from '@/lib/userSync';

export async function POST() {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ message: 'No user logged in' }, { status: 200 });
        }

        const syncedUser = await syncUser(user);
        return NextResponse.json({ success: true, user: syncedUser });
    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
