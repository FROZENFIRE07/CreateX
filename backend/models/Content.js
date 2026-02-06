/**
 * Content Model
 * Extensible content schema supporting text, image, and video types
 * 
 * Design Decision: Abstract content type allows future extension
 * to images (Stable Diffusion) or video (NeRF) without core rewrites.
 */

const mongoose = require('mongoose');

// Repurposed content variant schema
const variantSchema = new mongoose.Schema({
    platform: {
        type: String,
        enum: ['twitter', 'linkedin', 'email', 'instagram', 'blog'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    metadata: {
        charCount: Number,
        hashtags: [String],
        formatting: String
    },
    consistencyScore: {
        type: Number,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'flagged', 'published'],
        default: 'pending'
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

// Main content schema - extensible for future media types
const contentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Extensible type system - currently text, future: image, video
    type: {
        type: String,
        enum: ['text', 'image', 'video'],
        default: 'text'
    },
    // Original content data
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    data: {
        type: String, // For text; future: URL for media
        required: true
    },
    // Extracted metadata for RAG
    metadata: {
        themes: [String],
        keywords: [String],
        sentiment: String,
        wordCount: Number
    },
    // Vector embedding reference (Pinecone ID)
    vectorId: String,
    // Repurposed variants from COPE pipeline
    variants: [variantSchema],
    // Orchestration status
    orchestrationStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    orchestrationLog: [{
        agent: String,
        action: String,
        timestamp: { type: Date, default: Date.now },
        details: mongoose.Schema.Types.Mixed
    }],
    // KPIs for this content
    kpis: {
        hitRate: Number, // % variants passing review
        automationRate: Number, // % autonomous (no human intervention)
        avgConsistencyScore: Number,
        processingTime: Number // in seconds
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
contentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Content', contentSchema);
