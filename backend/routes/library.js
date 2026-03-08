/**
 * Library Routes
 * CRUD operations for platform-specific content library items
 * Replaces frontend localStorage with MongoDB persistence
 */

const express = require('express');
const LibraryItem = require('../models/LibraryItem');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All library routes require authentication
router.use(authMiddleware);

/**
 * GET /api/library/:platform
 * List library items for a specific platform
 */
router.get('/:platform', async (req, res) => {
    try {
        let { platform } = req.params;
        // Normalize: frontend 'blogs' → DB 'blog'
        if (platform === 'blogs') platform = 'blog';

        const { status, page = 1, limit = 50 } = req.query;

        const validPlatforms = ['twitter', 'linkedin', 'email', 'instagram', 'blog'];
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({ error: 'Invalid platform' });
        }

        const query = { userId: req.userId, platform };
        if (status) query.status = status;

        const items = await LibraryItem.find(query)
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await LibraryItem.countDocuments(query);

        res.json({
            items,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Library list error:', error);
        res.status(500).json({ error: 'Failed to fetch library items' });
    }
});

/**
 * POST /api/library
 * Create a new library item
 */
router.post('/', async (req, res) => {
    try {
        const { platform, title, content, status = 'draft', metadata = {} } = req.body;

        if (!platform || !title || !content) {
            return res.status(400).json({ error: 'Platform, title, and content are required' });
        }

        const validPlatforms = ['twitter', 'linkedin', 'email', 'instagram', 'blog'];
        if (!validPlatforms.includes(platform)) {
            return res.status(400).json({ error: 'Invalid platform' });
        }

        const item = new LibraryItem({
            userId: req.userId,
            platform,
            title,
            content,
            status,
            metadata
        });

        await item.save();
        res.status(201).json({ item });
    } catch (error) {
        console.error('Library create error:', error);
        res.status(500).json({ error: 'Failed to create library item' });
    }
});

/**
 * PUT /api/library/:id
 * Update a library item
 */
router.put('/:id', async (req, res) => {
    try {
        const { title, content, status, metadata } = req.body;

        const item = await LibraryItem.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!item) {
            return res.status(404).json({ error: 'Library item not found' });
        }

        if (title !== undefined) item.title = title;
        if (content !== undefined) item.content = content;
        if (status !== undefined) item.status = status;
        if (metadata !== undefined) item.metadata = { ...item.metadata, ...metadata };

        await item.save();
        res.json({ item });
    } catch (error) {
        console.error('Library update error:', error);
        res.status(500).json({ error: 'Failed to update library item' });
    }
});

/**
 * DELETE /api/library/:id
 * Delete a library item
 */
router.delete('/:id', async (req, res) => {
    try {
        const item = await LibraryItem.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!item) {
            return res.status(404).json({ error: 'Library item not found' });
        }

        res.json({ message: 'Library item deleted successfully' });
    } catch (error) {
        console.error('Library delete error:', error);
        res.status(500).json({ error: 'Failed to delete library item' });
    }
});

module.exports = router;
