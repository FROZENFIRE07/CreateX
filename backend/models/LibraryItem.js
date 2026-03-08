/**
 * LibraryItem Model
 * Stores platform-specific content library items (drafts, published, scheduled, archived)
 * Replaces localStorage-only approach with MongoDB persistence
 */

const mongoose = require('mongoose');

const libraryItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    platform: {
        type: String,
        enum: ['twitter', 'linkedin', 'email', 'instagram', 'blog'],
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'scheduled', 'archived'],
        default: 'draft',
        index: true
    },
    metadata: {
        charCount: Number,
        hashtags: [String],
        formatting: String,
        consistencyScore: Number,
        sourceContentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Content'
        }
    }
}, {
    timestamps: true
});

// Compound index for efficient per-user per-platform queries
libraryItemSchema.index({ userId: 1, platform: 1, status: 1 });

module.exports = mongoose.model('LibraryItem', libraryItemSchema);
