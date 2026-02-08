import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import LostItem from '@/models/LostItem';
import Alert from '@/models/Alert';

export async function DELETE(req, { params }) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const item = await LostItem.findById(id);
        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const userEmail = user.emailAddresses[0].emailAddress;

        console.log(`[DELETE OP] User: ${userEmail}, Item Owner: ${item.ownerEmail}, Item ID: ${id}`);

        if (item.ownerEmail !== userEmail) {
            console.error(`[DELETE OP] DENIED: ${userEmail} != ${item.ownerEmail}`);
            return NextResponse.json({ error: 'Forbidden: You are not the owner' }, { status: 403 });
        }

        // Delete the item
        await LostItem.findByIdAndDelete(id);

        // Optional: Clean up associated alerts?
        // await Alert.deleteMany({ lostItemId: id }); 
        // Keeping alerts might be useful for history, but if the item is gone, their ref is broken.
        // For now, let's keep them or delete them based on preference. 
        // The user said "remove product from database", so let's clean up alerts too to avoid orphans.
        await Alert.deleteMany({ lostItemId: id });

        return NextResponse.json({ success: true, message: 'Item deleted successfully' });

    } catch (error) {
        console.error('Delete item error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
