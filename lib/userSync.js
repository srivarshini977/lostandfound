import User from '@/models/User';
import dbConnect from '@/lib/db';

/**
 * Ensures the Clerk user exists in MongoDB.
 * @param {Object} user - The Clerk user object (from currentUser())
 */
export async function syncUser(clerkUser) {
    if (!clerkUser) return null;

    await dbConnect();

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
    const avatarUrl = clerkUser.imageUrl;

    try {
        const user = await User.findOneAndUpdate(
            { clerkId: clerkUser.id },
            {
                email,
                fullName,
                avatarUrl,
                updatedAt: new Date(),
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return user;
    } catch (error) {
        console.error('Error syncing user:', error);
        return null;
    }
}
