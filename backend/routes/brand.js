/**
 * Brand DNA Routes
 * Manage brand guidelines for content consistency
 * 
 * Brand DNA is embedded in vector DB for semantic matching
 * by the Reviewer Agent.
 */

const express = require('express');
const BrandDNA = require('../models/BrandDNA');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const vectorStore = require('../services/vectorStore');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/brand
 * Create or update brand DNA
 * Each user has one brand DNA (upsert behavior)
 */
router.post('/', async (req, res) => {
    try {
        const {
            name,
            guidelines = {},
            examples = []
        } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Brand name is required' });
        }

        // Check for existing brand DNA
        let brandDNA = await BrandDNA.findOne({ userId: req.userId });

        if (brandDNA) {
            // Update existing
            brandDNA.name = name;
            brandDNA.guidelines = {
                ...brandDNA.guidelines,
                ...guidelines
            };
            if (examples.length > 0) {
                brandDNA.examples = examples;
            }
        } else {
            // Create new
            brandDNA = new BrandDNA({
                userId: req.userId,
                name,
                guidelines: {
                    tone: guidelines.tone || 'professional',
                    voice: guidelines.voice || '',
                    values: guidelines.values || [],
                    keywords: guidelines.keywords || [],
                    avoidWords: guidelines.avoidWords || [],
                    targetAudience: guidelines.targetAudience || ''
                },
                examples
            });
        }

        // Save to generate rawText
        await brandDNA.save();

        // Embed in vector DB for RAG
        if (brandDNA.rawText && brandDNA.rawText.length > 10) {
            try {
                const vectorId = await vectorStore.upsert(brandDNA.rawText, {
                    type: 'brand',
                    userId: req.userId.toString(),
                    brandId: brandDNA._id.toString()
                });
                brandDNA.vectorId = vectorId;
                await brandDNA.save();
            } catch (vecError) {
                console.error('Vector embedding failed:', vecError.message);
                // Continue without vector - not critical
            }
        }

        // Link to user
        await User.findByIdAndUpdate(req.userId, {
            brandDNA: brandDNA._id
        });

        res.status(201).json({
            message: brandDNA.isNew ? 'Brand DNA created' : 'Brand DNA updated',
            brandDNA: {
                id: brandDNA._id,
                name: brandDNA.name,
                guidelines: brandDNA.guidelines,
                examples: brandDNA.examples.length,
                hasVector: !!brandDNA.vectorId
            }
        });
    } catch (error) {
        console.error('Brand DNA creation error:', error);
        res.status(500).json({ error: 'Failed to save brand DNA' });
    }
});

/**
 * GET /api/brand
 * Get user's brand DNA
 */
router.get('/', async (req, res) => {
    try {
        const brandDNA = await BrandDNA.findOne({ userId: req.userId });

        if (!brandDNA) {
            return res.json({
                brandDNA: null,
                message: 'No brand DNA configured. Create one for better content consistency.'
            });
        }

        res.json({
            brandDNA: {
                id: brandDNA._id,
                name: brandDNA.name,
                guidelines: brandDNA.guidelines,
                examples: brandDNA.examples,
                usageCount: brandDNA.usageCount,
                avgScore: brandDNA.avgScore,
                createdAt: brandDNA.createdAt,
                updatedAt: brandDNA.updatedAt
            }
        });
    } catch (error) {
        console.error('Brand DNA fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch brand DNA' });
    }
});

/**
 * PUT /api/brand/guidelines
 * Update specific guidelines
 */
router.put('/guidelines', async (req, res) => {
    try {
        const { tone, voice, values, keywords, avoidWords, targetAudience } = req.body;

        const brandDNA = await BrandDNA.findOne({ userId: req.userId });

        if (!brandDNA) {
            return res.status(404).json({ error: 'Brand DNA not found. Create one first.' });
        }

        // Update only provided fields
        if (tone) brandDNA.guidelines.tone = tone;
        if (voice) brandDNA.guidelines.voice = voice;
        if (values) brandDNA.guidelines.values = values;
        if (keywords) brandDNA.guidelines.keywords = keywords;
        if (avoidWords) brandDNA.guidelines.avoidWords = avoidWords;
        if (targetAudience) brandDNA.guidelines.targetAudience = targetAudience;

        await brandDNA.save();

        // Re-embed with updated rawText
        if (brandDNA.rawText) {
            try {
                // Delete old vector if exists
                if (brandDNA.vectorId) {
                    await vectorStore.delete(brandDNA.vectorId);
                }
                // Create new embedding
                const vectorId = await vectorStore.upsert(brandDNA.rawText, {
                    type: 'brand',
                    userId: req.userId.toString(),
                    brandId: brandDNA._id.toString()
                });
                brandDNA.vectorId = vectorId;
                await brandDNA.save();
            } catch (vecError) {
                console.error('Vector update failed:', vecError.message);
            }
        }

        res.json({
            message: 'Guidelines updated',
            guidelines: brandDNA.guidelines
        });
    } catch (error) {
        console.error('Guidelines update error:', error);
        res.status(500).json({ error: 'Failed to update guidelines' });
    }
});

/**
 * POST /api/brand/examples
 * Add example content
 */
router.post('/examples', async (req, res) => {
    try {
        const { platform, content, notes } = req.body;

        if (!platform || !content) {
            return res.status(400).json({ error: 'Platform and content are required' });
        }

        const brandDNA = await BrandDNA.findOne({ userId: req.userId });

        if (!brandDNA) {
            return res.status(404).json({ error: 'Brand DNA not found. Create one first.' });
        }

        brandDNA.examples.push({ platform, content, notes });
        await brandDNA.save();

        res.status(201).json({
            message: 'Example added',
            examplesCount: brandDNA.examples.length
        });
    } catch (error) {
        console.error('Example add error:', error);
        res.status(500).json({ error: 'Failed to add example' });
    }
});

/**
 * DELETE /api/brand
 * Delete brand DNA
 */
router.delete('/', async (req, res) => {
    try {
        const brandDNA = await BrandDNA.findOneAndDelete({ userId: req.userId });

        if (!brandDNA) {
            return res.status(404).json({ error: 'Brand DNA not found' });
        }

        // Delete vector
        if (brandDNA.vectorId) {
            try {
                await vectorStore.delete(brandDNA.vectorId);
            } catch (vecError) {
                console.error('Vector delete failed:', vecError.message);
            }
        }

        // Remove from user
        await User.findByIdAndUpdate(req.userId, {
            $unset: { brandDNA: 1 }
        });

        res.json({ message: 'Brand DNA deleted' });
    } catch (error) {
        console.error('Brand DNA delete error:', error);
        res.status(500).json({ error: 'Failed to delete brand DNA' });
    }
});

module.exports = router;
