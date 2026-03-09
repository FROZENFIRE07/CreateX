/**
 * Publish Routes
 * Endpoints for publishing content to social platforms
 * Supports mock mode (local testing) and live mode (Ayrshare API)
 */

const express = require('express');
const Content = require('../models/Content');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const publisherAgent = require('../services/agents/publisherAgent');
const ayrshareClient = require('../services/ayrshareClient');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/publish/status
 * Get current publish configuration and Ayrshare status (per-user key)
 */
router.get('/status', async (req, res) => {
    try {
        // Get user's own API key
        const user = await User.findById(req.userId);
        const userApiKey = user?.getAyrshareKey?.() || null;
        const configured = ayrshareClient.isConfigured(userApiKey);
        const defaultMode = process.env.PUBLICATION_MODE || 'mock';

        let ayrshareUser = null;
        if (configured) {
            const userResult = await ayrshareClient.getUser(userApiKey);
            if (userResult.success) {
                ayrshareUser = {
                    activeSocialAccounts: userResult.data.activeSocialAccounts || [],
                    displayNames: userResult.data.displayNames || {},
                    email: userResult.data.email || null,
                };
            }
        }

        res.json({
            mode: defaultMode,
            ayrshare_configured: configured,
            ayrshare_user: ayrshareUser,
            supported_platforms: {
                live: ['twitter', 'linkedin', 'instagram'],
                mock_only: ['email', 'blog'],
            },
        });
    } catch (error) {
        console.error('[Publish] Status error:', error);
        res.status(500).json({ error: 'Failed to fetch publish status' });
    }
});

/**
 * POST /api/publish/preview
 * Preview formatted content without publishing
 * Human-in-the-loop: review before confirm
 */
router.post('/preview', async (req, res) => {
    try {
        const { contentId } = req.body;

        if (!contentId) {
            return res.status(400).json({ error: 'contentId is required' });
        }

        const content = await Content.findOne({
            _id: contentId,
            userId: req.userId,
        });

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        if (!content.variants || content.variants.length === 0) {
            return res.status(400).json({ error: 'No variants to preview. Run orchestration first.' });
        }

        // Format each variant without publishing
        const previews = content.variants
            .filter(v => v.status === 'approved')
            .map(v => {
                const formatter = publisherAgent.formatters[v.platform] || publisherAgent.formatGeneric.bind(publisherAgent);
                const formatted = formatter(v);
                return {
                    platform: v.platform,
                    content: v.content,
                    formatted,
                    consistencyScore: v.consistencyScore,
                    image: v.image || null,
                    charCount: v.content?.length || 0,
                };
            });

        res.json({
            contentId: content._id,
            title: content.title,
            mode: content.publicationMode || 'mock',
            previews,
        });
    } catch (error) {
        console.error('[Publish] Preview error:', error);
        res.status(500).json({ error: 'Failed to generate preview' });
    }
});

/**
 * POST /api/publish/confirm
 * Publish content to selected platforms (human confirmed)
 * This is the "human in the loop" path - user has reviewed and confirms
 */
router.post('/confirm', async (req, res) => {
    try {
        const { contentId, platforms, mode } = req.body;

        if (!contentId) {
            return res.status(400).json({ error: 'contentId is required' });
        }

        const content = await Content.findOne({
            _id: contentId,
            userId: req.userId,
        });

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // Get user's Ayrshare API key
        const user = await User.findById(req.userId);
        const userApiKey = user?.getAyrshareKey?.() || null;

        const approvedVariants = content.variants.filter(v => v.status === 'approved');
        if (approvedVariants.length === 0) {
            return res.status(400).json({ error: 'No approved variants to publish' });
        }

        // Filter to requested platforms (or all approved)
        const targetPlatforms = platforms || approvedVariants.map(v => v.platform);
        const variantsToPublish = approvedVariants.filter(v => targetPlatforms.includes(v.platform));

        // Determine mode
        const publishMode = mode || content.publicationMode || 'mock';

        // Publish each variant (pass user's API key)
        const results = [];
        for (const variant of variantsToPublish) {
            const published = await publisherAgent.format(variant, publishMode, userApiKey);
            results.push({
                platform: variant.platform,
                success: published.publishResult?.success || false,
                postId: published.publishStatus?.postId || null,
                postUrl: published.publishStatus?.postUrl || null,
                mode: published.publishStatus?.mode || publishMode,
                error: published.publishStatus?.error || null,
            });

            // Update variant's publish status in the DB
            const variantIdx = content.variants.findIndex(
                v => v.platform === variant.platform && v.status === 'approved'
            );
            if (variantIdx !== -1) {
                content.variants[variantIdx].publishStatus = {
                    published: published.publishResult?.success || false,
                    publishedAt: new Date(),
                    postId: published.publishStatus?.postId || null,
                    postUrl: published.publishStatus?.postUrl || null,
                    mode: published.publishStatus?.mode || publishMode,
                    error: published.publishStatus?.error || null,
                };
                if (published.publishResult?.success) {
                    content.variants[variantIdx].status = 'published';
                }
            }
        }

        // Update publish summary
        const successCount = results.filter(r => r.success).length;
        content.publishSummary = {
            totalVariants: results.length,
            publishedCount: successCount,
            failedCount: results.length - successCount,
            mode: publishMode,
            lastPublishAt: new Date(),
        };

        await content.save();

        res.json({
            contentId: content._id,
            mode: publishMode,
            published: results.filter(r => r.success),
            failed: results.filter(r => !r.success),
            summary: content.publishSummary,
        });
    } catch (error) {
        console.error('[Publish] Confirm error:', error);
        res.status(500).json({ error: 'Failed to publish content' });
    }
});

/**
 * GET /api/publish/status/:contentId
 * Get publish status for a specific content
 */
router.get('/status/:contentId', async (req, res) => {
    try {
        const content = await Content.findOne({
            _id: req.params.contentId,
            userId: req.userId,
        });

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        const variantStatuses = content.variants.map(v => ({
            platform: v.platform,
            status: v.status,
            publishStatus: v.publishStatus || { published: false },
            consistencyScore: v.consistencyScore,
        }));

        res.json({
            contentId: content._id,
            mode: content.publicationMode,
            autoPublish: content.autoPublish,
            publishSummary: content.publishSummary,
            variants: variantStatuses,
        });
    } catch (error) {
        console.error('[Publish] Status fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch publish status' });
    }
});

/**
 * POST /api/publish/retry
 * Retry failed publishes for specific platforms
 */
router.post('/retry', async (req, res) => {
    try {
        const { contentId, platforms } = req.body;

        if (!contentId || !platforms?.length) {
            return res.status(400).json({ error: 'contentId and platforms are required' });
        }

        const content = await Content.findOne({
            _id: contentId,
            userId: req.userId,
        });

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        const results = [];
        for (const platform of platforms) {
            const variant = content.variants.find(
                v => v.platform === platform && v.publishStatus?.error
            );

            if (!variant) continue;

            const mode = content.publicationMode || 'mock';
            const published = await publisherAgent.format(variant, mode);

            results.push({
                platform,
                success: published.publishResult?.success || false,
                postId: published.publishStatus?.postId || null,
                postUrl: published.publishStatus?.postUrl || null,
                mode: published.publishStatus?.mode || mode,
                error: published.publishStatus?.error || null,
            });

            // Update variant
            const idx = content.variants.findIndex(v => v.platform === platform);
            if (idx !== -1) {
                content.variants[idx].publishStatus = {
                    published: published.publishResult?.success || false,
                    publishedAt: new Date(),
                    postId: published.publishStatus?.postId || null,
                    postUrl: published.publishStatus?.postUrl || null,
                    mode: published.publishStatus?.mode || mode,
                    error: published.publishStatus?.error || null,
                    retryCount: (content.variants[idx].publishStatus?.retryCount || 0) + 1,
                };
            }
        }

        await content.save();

        res.json({
            contentId,
            retried: results,
        });
    } catch (error) {
        console.error('[Publish] Retry error:', error);
        res.status(500).json({ error: 'Failed to retry publish' });
    }
});

module.exports = router;
