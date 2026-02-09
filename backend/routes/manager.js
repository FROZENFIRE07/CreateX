/**
 * Manager Routes
 * 
 * API endpoints for Manager Agent interactions.
 * Main endpoint: POST /api/manager/interact
 * 
 * Phase 2 Enhancements:
 * - Distinct SSE event types (decision, progress, result)
 * - Full confirmation endpoint for forced overwrites
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const managerInteract = require('../services/agents/managerInteract');
const orchestrationEmitter = require('../services/orchestrationEmitter');
const jwt = require('jsonwebtoken');
const Content = require('../models/Content');
const BrandDNA = require('../models/BrandDNA');

/**
 * SSE endpoint for manager interactions
 * Streams manager responses in real-time with semantic event types
 */
router.get('/:contentId/stream', async (req, res) => {
    const contentId = String(req.params.contentId);
    let token = req.query.token;

    console.log(`[Manager SSE] New connection for content ${contentId}`);

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send connection event
    res.write(`data: ${JSON.stringify({ type: 'connected', contentId })}\n\n`);

    // Event handlers - Phase 2: Semantic event types
    const onLog = (data) => {
        res.write(`data: ${JSON.stringify({ type: 'manager_log', ...data })}\n\n`);
    };

    const onDecision = (data) => {
        res.write(`data: ${JSON.stringify({ type: 'manager_decision', ...data })}\n\n`);
    };

    const onProgress = (data) => {
        res.write(`data: ${JSON.stringify({ type: 'execution_progress', ...data })}\n\n`);
    };

    const onResult = (data) => {
        res.write(`data: ${JSON.stringify({ type: 'execution_result', ...data })}\n\n`);
    };

    const onComplete = (data) => {
        res.write(`data: ${JSON.stringify({ type: 'manager_complete', ...data })}\n\n`);
    };

    // Subscribe to all event types
    orchestrationEmitter.on(`log:${contentId}`, onLog);
    orchestrationEmitter.on(`decision:${contentId}`, onDecision);
    orchestrationEmitter.on(`progress:${contentId}`, onProgress);
    orchestrationEmitter.on(`result:${contentId}`, onResult);
    orchestrationEmitter.on(`complete:${contentId}`, onComplete);

    // Cleanup on disconnect
    const cleanup = () => {
        orchestrationEmitter.off(`log:${contentId}`, onLog);
        orchestrationEmitter.off(`decision:${contentId}`, onDecision);
        orchestrationEmitter.off(`progress:${contentId}`, onProgress);
        orchestrationEmitter.off(`result:${contentId}`, onResult);
        orchestrationEmitter.off(`complete:${contentId}`, onComplete);
    };

    req.on('close', cleanup);

    // Keep-alive ping
    const keepAlive = setInterval(() => {
        res.write(': keepalive\n\n');
    }, 30000);

    req.on('close', () => clearInterval(keepAlive));
});

// All other routes require authentication
router.use(authMiddleware);

/**
 * POST /api/manager/interact
 * Main interaction endpoint for Manager Agent
 * 
 * Body: { contentId, message }
 * Returns: { success, intent, result, classification, validation }
 */
router.post('/interact', async (req, res) => {
    try {
        const { contentId, message } = req.body;

        if (!contentId || !message) {
            return res.status(400).json({
                error: 'contentId and message are required'
            });
        }

        console.log(`[Manager] Interact request: "${message}" for content ${contentId}`);

        // Process interaction
        const result = await managerInteract.interact(contentId, message, req.userId);

        res.json(result);

    } catch (error) {
        console.error('[Manager] Interact error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process manager interaction'
        });
    }
});

/**
 * POST /api/manager/confirm
 * Confirm a pending action from the manager, with optional force overwrite
 * 
 * Body: { contentId, confirmed, pendingAction, forceOverwrite }
 */
router.post('/confirm', async (req, res) => {
    try {
        const { contentId, confirmed, pendingAction, forceOverwrite } = req.body;

        if (!confirmed) {
            return res.json({
                success: true,
                cancelled: true,
                message: 'Action cancelled'
            });
        }

        if (!contentId || !pendingAction) {
            return res.status(400).json({
                error: 'contentId and pendingAction are required'
            });
        }

        // Load content for execution
        const content = await Content.findOne({ _id: contentId, userId: req.userId });
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        const brandDNA = await BrandDNA.findOne({ userId: req.userId });

        // Re-execute with force flag if specified
        console.log(`[Manager] Confirmed action: ${pendingAction.intent} (forceOverwrite: ${forceOverwrite})`);

        // For variant modifications with force overwrite
        if (pendingAction.intent === 'REFINE_SPECIFIC' && forceOverwrite) {
            const result = await managerInteract.modifyVariant(
                content,
                pendingAction.targetPlatform,
                pendingAction.extractedInstruction,
                brandDNA,
                true // forceOverwrite
            );
            return res.json({ success: true, result });
        }

        // For full orchestration, re-run via interact
        const result = await managerInteract.interact(contentId, pendingAction.extractedInstruction, req.userId);
        res.json({ success: true, result });

    } catch (error) {
        console.error('[Manager] Confirm error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process confirmation'
        });
    }
});

module.exports = router;

