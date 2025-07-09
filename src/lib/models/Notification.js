// src/lib/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['job_announcement', 'internship_announcement', 'application_update', 'general', 'system'],
        default: 'general',
    },
    recipients: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        }
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel',
    },
    senderModel: {
        type: String,
        enum: ['Admin', 'Student'],
    },
    relatedEntity: {
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        entityType: {
            type: String,
            enum: ['JobPost', 'InternshipPost', 'Application'],
        }
    },
    expiresAt: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { 
    timestamps: true,
    // Automatically remove expired notifications
    expireAfterSeconds: 2592000 // 30 days
});

// Index for better query performance
notificationSchema.index({ 'recipients.user': 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
