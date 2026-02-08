
import LostItem from '@/models/LostItem';
import { sendMatchNotification } from './email-service';

export async function findAndNotifyMatches(newItem, appUrl) {
    if (!newItem.reportType || !newItem.category) return;

    const targetType = newItem.reportType === 'lost' ? 'found' : 'lost';

    // Create a simple keyword list from item name (remove common stop words if needed, but keeping simple)
    const keywords = newItem.itemName.split(' ').filter(w => w.length > 3);
    const regexQuery = keywords.map(w => new RegExp(w, 'i'));

    try {
        // Find potential matches
        // 1. Same Category
        // 2. Opposite Report Type
        // 3. Not Resolved
        // 4. (Name contains keywords OR Location matches)
        const matches = await LostItem.find({
            reportType: targetType,
            category: newItem.category,
            isResolved: false,
            $or: [
                { itemName: { $in: regexQuery } },
                { description: { $in: regexQuery } },
                { lastSeenLocation: { $regex: newItem.lastSeenLocation, $options: 'i' } } // optional: sloppy location match
            ]
        }).limit(3);

        console.log(`[Matching Service] Found ${matches.length} matches for "${newItem.itemName}"`);

        // Notify the OWNER of the existing items
        // Scenario: 
        // 1. I found a "Black Dell Laptop" (Found Item).
        // 2. DB has "Lost Dell Laptop" (Lost Item) by User A.
        // 3. Notify User A: "Hey, someone found a matching item!"

        const notifications = matches.map(async (existingItem) => {
            // If the NEW item is 'found', we notify the EXISTING 'lost' item owner.
            // If the NEW item is 'lost', we notify the USER (who just posted) about EXISTING 'found' items?
            // Actually, usually we want to notify whoever is looking for the item.

            let recipientEmail;
            let emailContextItem;

            if (newItem.reportType === 'found') {
                // New Item is FOUND. Notify the EXISTING LOST item owner.
                recipientEmail = existingItem.ownerEmail;
                emailContextItem = existingItem; // "We found a match for YOUR item"

                return sendMatchNotification({
                    to: recipientEmail,
                    itemName: existingItem.itemName, // The item they lost
                    matchType: 'found_match',
                    matchedItemDetails: newItem, // The new found item
                    appUrl
                });
            } else {
                // New Item is LOST. 
                // We should notify the NEW USER that we found matches in the DB (immediate feedback).
                // We can also notify the owners of the FOUND items? No, finder doesn't care as much.
                // So, notify the NEW User.
                recipientEmail = newItem.ownerEmail;

                return sendMatchNotification({
                    to: recipientEmail,
                    itemName: newItem.itemName,
                    matchType: 'lost_match',
                    matchedItemDetails: existingItem,
                    appUrl
                });
            }
        });

        await Promise.all(notifications);
        return matches.length;

    } catch (error) {
        console.error('[Matching Service] Error:', error);
        return 0;
    }
}
