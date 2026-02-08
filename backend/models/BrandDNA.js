/**
 * BrandDNA Model
 * Stores brand guidelines, tone, and voice for consistency enforcement
 * 
 * Used by Reviewer Agent to score content against brand standards.
 * Embeddings stored in Pinecone for semantic similarity matching.
 */

const mongoose = require('mongoose');

const brandDNASchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        default: 'Default Brand'
    },
    // Core brand attributes
    guidelines: {
        tone: {
            type: String, // e.g., "professional", "casual", "inspirational"
            default: 'professional'
        },
        voice: {
            type: String, // e.g., "We are innovative leaders..."
            default: ''
        },
        values: [String], // e.g., ["innovation", "trust", "simplicity"]
        keywords: [String], // Must-use keywords
        avoidWords: [String], // Words to avoid
        targetAudience: String
    },
    // Example content for few-shot learning
    examples: [{
        platform: String,
        content: String,
        notes: String
    }],
    // Visual aesthetics for image generation
    visualAesthetics: {
        primaryColors: [String],  // ["#6366f1", "#10b981"]
        secondaryColors: [String],
        preferredStyles: [String],  // ["abstract", "minimalist", "tech"]
        moodKeywords: [String],  // ["professional", "energetic", "calm"]
        avoidStyles: [String],  // ["photorealistic", "cartoonish"]
        referenceImages: [String]  // URLs to example images
    },
    // Image generation settings
    imageGenerationSettings: {
        enabled: {
            type: Boolean,
            default: false
        },
        defaultAspectRatio: {
            type: String,
            default: "16:9"
        },
        qualityThreshold: {
            type: Number,
            default: 80
        },
        preferredAPI: {
            type: String,
            enum: ['stability-ai', 'dall-e-3', 'replicate', 'auto'],
            default: 'auto'
        }
    },
    // Raw text of all guidelines (for embedding)
    rawText: String,
    // Vector embedding reference (Pinecone ID)
    vectorId: String,
    // Usage stats
    usageCount: {
        type: Number,
        default: 0
    },
    avgScore: {
        type: Number,
        default: 0
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

// Pre-save: compile rawText from guidelines
brandDNASchema.pre('save', function (next) {
    this.updatedAt = new Date();

    // Compile all guidelines into rawText for embedding
    const parts = [
        `Tone: ${this.guidelines.tone}`,
        `Voice: ${this.guidelines.voice}`,
        `Values: ${this.guidelines.values?.join(', ') || ''}`,
        `Keywords: ${this.guidelines.keywords?.join(', ') || ''}`,
        `Avoid: ${this.guidelines.avoidWords?.join(', ') || ''}`,
        `Audience: ${this.guidelines.targetAudience || ''}`
    ];

    // Include visual aesthetics if present
    if (this.visualAesthetics) {
        if (this.visualAesthetics.primaryColors?.length) {
            parts.push(`Brand Colors: ${this.visualAesthetics.primaryColors.join(', ')}`);
        }
        if (this.visualAesthetics.preferredStyles?.length) {
            parts.push(`Visual Style: ${this.visualAesthetics.preferredStyles.join(', ')}`);
        }
        if (this.visualAesthetics.moodKeywords?.length) {
            parts.push(`Visual Mood: ${this.visualAesthetics.moodKeywords.join(', ')}`);
        }
    }

    if (this.examples?.length) {
        parts.push('Examples:');
        this.examples.forEach(ex => {
            parts.push(`[${ex.platform}] ${ex.content}`);
        });
    }

    this.rawText = parts.filter(p => p).join('\n');
    next();
});

module.exports = mongoose.model('BrandDNA', brandDNASchema);
