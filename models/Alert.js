import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
    lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem', required: true },
    finderEmail: { type: String, required: true },
    foundLocation: { type: String, required: true },
    mobile: { type: String }, // New
    department: { type: String }, // New
    foundImageUrl: { type: String }, // New
    message: { type: String },
    status: { type: String, default: 'pending' }, // pending, resolved
    // Email Tracking Fields
    emailStatus: {
        type: String,
        enum: ['pending', 'sent', 'failed', 'delivered'],
        default: 'pending'
    },
    emailId: { type: String }, // Message ID from email service
    retryCount: { type: Number, default: 0 },
    lastRetryAt: { type: Date },
    errorMessage: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Alert || mongoose.model('Alert', AlertSchema);
