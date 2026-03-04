/**
 * Content Routes
 * CRUD operations and orchestration trigger for content
 * 
 * Phase 2: Orchestration now routes through Manager Agent
 * to enforce the architectural invariant.
 */

const express = require('express');
const Content = require('../models/Content');
const BrandDNA = require('../models/BrandDNA');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const managerAgent = require('../services/agents/managerAgent');
const managerInteract = require('../services/agents/managerInteract');
const contentHandler = require('../services/contentHandler');
const orchestrationEmitter = require('../services/orchestrationEmitter');

const router = express.Router();


/**
 * GET /api/content/:id/stream
 * Server-Sent Events endpoint for real-time orchestration progress
 * Note: Defined BEFORE authMiddleware because EventSource doesn't support headers
 */
router.options('/:id/stream', (req, res) => res.sendStatus(200)); // Handle CORS preflight
router.get('/:id/stream', async (req, res) => {
    const contentId = String(req.params.id); // Ensure string for consistent event names
    let token = req.query.token;

    // Debug logging for auth issues
    console.log(`[SSE] New connection request for content ${contentId}`);

    if (!token) {
        console.error('[SSE] No token provided');
        return res.status(401).json({ error: 'No token' });
    }

    // Handle Bearer prefix if present
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    /* DISABLED AUTH FOR DEV STABILITY - Logs stream shouldn't be blocked by token issues */
    /*
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Handle both 'id' and 'userId' for backward compatibility
        userId = decoded.userId || decoded.id;
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    */

    // Verify content belongs to user
    const content = await Content.findOne({
        _id: contentId,
        // userId: userId // Allow public view for now
    });

    if (!content) {
        return res.status(404).json({ error: 'Content not found' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // res.setHeader('Access-Control-Allow-Origin', '*'); // Handled by global CORS middleware
    res.flushHeaders();

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: 'connected', contentId })}\n\n`);

    // IMMEDIATE FLUSH: Send buffered history
    const history = orchestrationEmitter.getHistory(contentId);
    if (history.length > 0) {
        history.forEach(event => {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
        });
    }

    // Event handlers
    const onLog = (data) => {
        console.log(`[SSE] Sending log to client: ${data.message}`);
        res.write(`data: ${JSON.stringify({ ...data, type: 'log' })}\n\n`);
    };

    const onStep = (data) => {
        console.log(`[SSE] Sending step to client: ${data.step}`);
        res.write(`data: ${JSON.stringify({ ...data, type: 'step' })}\n\n`);
    };

    const onComplete = (data) => {
        console.log(`[SSE] Sending complete to client`);
        res.write(`data: ${JSON.stringify({ ...data, type: 'complete' })}\n\n`);
        res.end(); // Close connection cleanly
        cleanup();
    };

    const onError = (data) => {
        console.log(`[SSE] Sending error to client: ${data.error}`);
        res.write(`data: ${JSON.stringify({ ...data, type: 'error' })}\n\n`);
        res.end();
        cleanup();
    };

    // Subscribe to events
    console.log(`[SSE] Subscribing to events for contentId: ${contentId}`);
    orchestrationEmitter.on(`log:${contentId}`, onLog);
    orchestrationEmitter.on(`step:${contentId}`, onStep);
    orchestrationEmitter.on(`complete:${contentId}`, onComplete);
    orchestrationEmitter.on(`error:${contentId}`, onError);
    console.log(`[SSE] Active listeners - log: ${orchestrationEmitter.listenerCount(`log:${contentId}`)}, step: ${orchestrationEmitter.listenerCount(`step:${contentId}`)}`);


    // Cleanup on disconnect
    const cleanup = () => {
        orchestrationEmitter.off(`log:${contentId}`, onLog);
        orchestrationEmitter.off(`step:${contentId}`, onStep);
        orchestrationEmitter.off(`complete:${contentId}`, onComplete);
        orchestrationEmitter.off(`error:${contentId}`, onError);
    };

    req.on('close', cleanup);

    // Keep-alive ping every 30s
    const keepAlive = setInterval(() => {
        res.write(': keepalive\n\n');
    }, 30000);

    req.on('close', () => clearInterval(keepAlive));
});

// All OTHER routes require authentication
router.use(authMiddleware);

/**
 * POST /api/content
 * Create new content
 */
router.post('/', async (req, res) => {
    try {
        const { title, data, type = 'text' } = req.body;

        if (!title || !data) {
            return res.status(400).json({ error: 'Title and content data are required' });
        }

        // Validate content
        const validation = contentHandler.validate({ type, data });
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const content = new Content({
            userId: req.userId,
            title,
            data,
            type,
            orchestrationStatus: 'pending'
        });

        await content.save();

        // Update user stats
        await User.findByIdAndUpdate(req.userId, {
            $inc: { 'stats.totalContent': 1 }
        });

        res.status(201).json({
            message: 'Content created successfully',
            content: {
                id: content._id,
                title: content.title,
                type: content.type,
                status: content.orchestrationStatus
            }
        });
    } catch (error) {
        console.error('Content creation error:', error);
        res.status(500).json({ error: 'Failed to create content' });
    }
});

/**
 * GET /api/content
 * List user's content
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, status, search } = req.query;

        const query = { userId: req.userId };
        if (status) query.orchestrationStatus = status;

        // Search across title, keywords, and platform names
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { title: regex },
                { 'metadata.keywords': regex },
                { 'metadata.themes': regex },
                { 'variants.platform': regex },
                { 'orchestrationLog.agent': regex },
            ];
        }

        const contents = await Content.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select('-data'); // Don't send full content in list

        const total = await Content.countDocuments(query);

        res.json({
            contents,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Content list error:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

/**
 * GET /api/content/:id
 * Get single content with full data
 */
router.get('/:id', async (req, res) => {
    try {
        const content = await Content.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        res.json({ content });
    } catch (error) {
        console.error('Content fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});

/**
 * POST /api/content/:id/orchestrate
 * Trigger COPE pipeline for content transformation
 * 
 * Phase 2: Routed through Manager Agent for authority enforcement
 */
router.post('/:id/orchestrate', async (req, res) => {
    try {
        const { platforms = ['twitter', 'linkedin', 'email'] } = req.body;

        // Validate platforms
        const validPlatforms = ['twitter', 'linkedin', 'email', 'instagram', 'blog'];
        const selectedPlatforms = platforms.filter(p => validPlatforms.includes(p));

        if (selectedPlatforms.length === 0) {
            return res.status(400).json({ error: 'At least one valid platform required' });
        }

        // Get content
        const content = await Content.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // Check if already processing
        if (content.orchestrationStatus === 'processing') {
            return res.status(409).json({ error: 'Orchestration already in progress' });
        }

        // Update status to processing
        content.orchestrationStatus = 'processing';
        content.orchestrationLog = [];
        await content.save();

        // Send response first to allow frontend to connect SSE
        res.json({
            message: 'Orchestration started via Manager',
            contentId: content._id,
            platforms: selectedPlatforms,
            status: 'processing'
        });

        // Phase 2: Route through Manager Agent for authority enforcement
        // This ensures the architectural invariant: all generation passes through Manager
        setTimeout(async () => {
            try {
                console.log(`[Orchestrator] Routing through Manager for content: ${content._id}`);
                const platformList = selectedPlatforms.join(', ');
                await managerInteract.interact(
                    content._id,
                    `Execute full orchestration pipeline for platforms: ${platformList}`,
                    req.userId
                );
            } catch (error) {
                console.error(`[Orchestrator] Manager routing failed for ${content._id}:`, error);
                content.orchestrationStatus = 'failed';
                content.orchestrationLog.push({
                    agent: 'system',
                    action: 'error',
                    timestamp: new Date(),
                    details: { error: error.message }
                });
                await content.save();
            }
        }, 500);
    } catch (error) {
        console.error('Orchestration start error:', error);
        res.status(500).json({ error: 'Failed to start orchestration' });
    }
});


/**
 * Background orchestration function
 * Runs the multi-agent pipeline asynchronously
 */
async function orchestrateInBackground(content, brandDNA, platforms, userId) {
    console.log(`[Orchestrator] Starting pipeline for content: ${content._id}`);
    const startTime = Date.now();

    try {
        // Run the manager agent
        const result = await managerAgent.orchestrate(content, brandDNA, platforms);

        // Update content with results
        content.variants = result.variants.map(v => ({
            platform: v.platform,
            content: v.content,
            metadata: v.metadata,
            image: v.image, // Include generated image URL
            consistencyScore: v.consistencyScore,
            status: v.status,
            feedback: v.feedback
        }));

        // Save orchestration logs to database (from result.log)
        content.orchestrationLog = result.log || [];
        content.pipelineTrace = result.pipelineTrace; // End-to-end agent observability
        content.kpis = result.kpis;
        content.orchestrationStatus = result.status === 'completed' ? 'completed' : 'failed';

        await content.save();

        // Update user stats
        const approvedCount = result.variants.filter(v => v.status === 'approved').length;
        await User.findByIdAndUpdate(userId, {
            $inc: {
                'stats.totalRepurposed': result.variants.length,
                'stats.timesSaved': Math.round((Date.now() - startTime) / 60000) // minutes saved estimate
            }
        });

        console.log(`[Orchestrator] Completed for content: ${content._id}, KPIs:`, result.kpis);

    } catch (error) {
        console.error(`[Orchestrator] Failed for content ${content._id}:`, error);

        content.orchestrationStatus = 'failed';
        content.orchestrationLog.push({
            agent: 'system',
            action: 'error',
            timestamp: new Date(),
            details: { error: error.message }
        });

        await content.save();
    }
}

/**
 * GET /api/content/:id/status
 * Poll orchestration status (for frontend polling)
 */
router.get('/:id/status', async (req, res) => {
    try {
        const content = await Content.findOne({
            _id: req.params.id,
            userId: req.userId
        }).select('orchestrationStatus orchestrationLog pipelineTrace kpis variants');

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        res.json({
            status: content.orchestrationStatus,
            log: content.orchestrationLog, // All log entries for complete progress display
            pipelineTrace: content.pipelineTrace, // Full agent trace for observability
            kpis: content.kpis,
            variantsCount: content.variants?.length || 0,
            variants: content.orchestrationStatus === 'completed' ? content.variants : undefined
        });
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Failed to check status' });
    }
});

/**
 * GET /api/content/:id/agent/:agentId
 * Get detailed information about a specific agent's work on this content
 */

// User-friendly step title mapping per agent
const STEP_TITLE_MAP = {
    manager: {
        'planning': 'Creating Execution Plan',
        'querying': 'Querying Memory Systems',
        'delegating': 'Delegating to Worker Agents',
        'monitoring': 'Monitoring Progress',
        'calculating': 'Calculating KPIs',
        'completed': 'Workflow Complete',
    },
    ingest: {
        'analyzing': 'Analyzing Content Structure',
        'extracting': 'Extracting Themes & Keywords',
        'sentiment': 'Determining Sentiment',
        'embedding': 'Generating Embeddings',
        'rag': 'Retrieving Context via RAG',
        'completed': 'Analysis Complete',
    },
    generator: {
        'receiving': 'Receiving Enriched Content',
        'generating': 'Generating Platform Variants',
        'twitter': 'Generating Twitter Variant',
        'linkedin': 'Generating LinkedIn Variant',
        'email': 'Generating Email Variant',
        'brand': 'Applying Brand Voice',
        'grounding': 'Ensuring Fact Grounding',
        'completed': 'Generation Complete',
    },
    reviewer: {
        'receiving': 'Receiving Variant for Review',
        'tone': 'Scoring Tone Match',
        'alignment': 'Scoring Value Alignment',
        'keywords': 'Checking Keyword Usage',
        'prohibited': 'Verifying Prohibited Words',
        'audience': 'Scoring Audience Fit',
        'scoring': 'Calculating Weighted Score',
        'completed': 'Review Complete',
    },
    publisher: {
        'receiving': 'Receiving Approved Variant',
        'formatting': 'Formatting for Platform APIs',
        'twitter': 'Formatting for Twitter API',
        'linkedin': 'Formatting for LinkedIn API',
        'email': 'Formatting for Email API',
        'metadata': 'Generating Metadata',
        'payload': 'Creating API Payloads',
        'completed': 'Publishing Complete',
    },
};

function getFriendlyTitle(agentId, action) {
    const agentMap = STEP_TITLE_MAP[agentId?.toLowerCase()];
    if (agentMap && agentMap[action?.toLowerCase()]) {
        return agentMap[action.toLowerCase()];
    }
    // Fallback: capitalize the raw action
    if (!action) return 'Processing';
    return action.charAt(0).toUpperCase() + action.slice(1);
}

router.get('/:id/agent/:agentId', async (req, res) => {
    try {
        const content = await Content.findOne({
            _id: req.params.id,
            userId: req.userId
        }).select('orchestrationLog pipelineTrace kpis variants');

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        const agentId = req.params.agentId;

        // Filter logs and traces for this specific agent
        const agentLogs = content.orchestrationLog?.filter(log =>
            log.agent?.toLowerCase() === agentId.toLowerCase()
        ) || [];

        const agentTraces = content.pipelineTrace?.filter(trace =>
            trace.agent?.toLowerCase() === agentId.toLowerCase()
        ) || [];

        // Parse agent-specific data into user-friendly format
        const steps = agentLogs.map((log, index) => ({
            title: getFriendlyTitle(agentId, log.action),
            description: log.details?.message || 'Working on task',
            status: log.action === 'completed' ? 'completed' :
                log.action === 'error' ? 'error' : 'active',
            duration: log.details?.duration || null,
            details: log.details?.additionalInfo || null,
            timestamp: log.timestamp
        }));

        // Calculate agent-specific metrics
        const totalTasks = steps.length;
        const tasksCompleted = steps.filter(s => s.status === 'completed').length;
        const successRate = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 100;

        // Calculate processing time
        const startTime = agentLogs[0]?.timestamp ? new Date(agentLogs[0].timestamp) : null;
        const endTime = agentLogs[agentLogs.length - 1]?.timestamp ?
            new Date(agentLogs[agentLogs.length - 1].timestamp) : null;
        const processingTime = startTime && endTime ?
            Math.round((endTime - startTime) / 1000) : 0;

        // Get agent output from traces
        const output = agentTraces.length > 0 ?
            agentTraces[agentTraces.length - 1].passedOn : null;

        res.json({
            agentId,
            steps,
            totalTasks,
            tasksCompleted,
            successRate,
            processingTime,
            output,
            logs: agentLogs,
            traces: agentTraces
        });
    } catch (error) {
        console.error('Agent detail error:', error);
        res.status(500).json({ error: 'Failed to get agent details' });
    }
});

/**
 * DELETE /api/content/:id
 * Delete content
 */
router.delete('/:id', async (req, res) => {
    try {
        const content = await Content.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // Update user stats
        await User.findByIdAndUpdate(req.userId, {
            $inc: { 'stats.totalContent': -1 }
        });

        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        console.error('Content delete error:', error);
        res.status(500).json({ error: 'Failed to delete content' });
    }
});

module.exports = router;

