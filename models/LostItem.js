import mongoose from 'mongoose';

const LostItemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    reportType: {
        type: String,
        enum: ['lost', 'found'],
        default: 'lost',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Clothing', 'Books', 'Accessories', 'Other']
    },
    description: { type: String, required: true },
    dateLost: { type: Date, required: true },
    lastSeenLocation: { type: String, required: true },
    ownerEmail: { type: String, required: true }, // Verified email from Clerk
    imageUrl: { type: String }, // Cloudinary URL
    isResolved: { type: Boolean, default: false },
    emailNotifications: {
        enabled: { type: Boolean, default: true },
        lastNotified: { type: Date },
        notificationCount: { type: Number, default: 0 }
    },
}, { timestamps: true });

export default mongoose.models.LostItem || mongoose.model('LostItem', LostItemSchema);
