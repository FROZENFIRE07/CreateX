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
    image: {
        url: String,
        prompt: String,
        provider: String
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
    },
    // Manager Agent state tracking fields
    isUserModified: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    generationHistory: [{
        content: String,
        generatedAt: { type: Date, default: Date.now },
        source: { type: String, enum: ['manager', 'orchestration', 'user'], default: 'orchestration' }
    }]
});


// Image schema for AI-generated images
const imageSchema = new mongoose.Schema({
    platform: {
        type: String,
        enum: ['twitter', 'linkedin', 'email', 'instagram', 'blog', 'generic'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    prompt: {
        type: String,  // Full prompt used for generation
        required: true
    },
    negativePrompt: String,
    dimensions: {
        width: Number,
        height: Number,
        aspectRatio: String  // "16:9", "1:1", etc.
    },
    fileSize: Number,  // bytes
    format: String,  // "png", "jpg", "webp"
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
    metadata: {
        apiUsed: String,  // "stability-ai", "dall-e-3", "replicate"
        modelVersion: String,
        generationTime: Number,  // milliseconds
        dominantColors: [String],  // hex codes
        styleUsed: String  // "abstract-minimalist", "tech-gradient"
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    feedback: String  // Reviewer feedback if flagged
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
    // AI-generated images for content
    images: [imageSchema],
    // Image generation toggle
    imageGenerationEnabled: {
        type: Boolean,
        default: false
    },
    // Manager Agent: Project-level state overrides (affect future generations)
    projectStateOverrides: {
        toneOverride: String,      // e.g., "more opinionated", "casual"
        audienceOverride: String,  // e.g., "founders instead of marketers"
        customInstructions: String // free-form project-level guidance
    },
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
    // Pipeline trace: end-to-end observability of what each agent received, decided, and passed on
    pipelineTrace: [{
        agent: String,
        received: mongoose.Schema.Types.Mixed,
        decided: mongoose.Schema.Types.Mixed,
        passedOn: mongoose.Schema.Types.Mixed
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
