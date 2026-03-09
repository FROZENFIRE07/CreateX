/**
 * Manager Agent (v2 - Agentic Architecture)
 * 
 * A persistent Manager Agent that plans and executes content repurposing
 * by querying a vector-backed workspace with identity graph integration
 * and delegating to specialized worker AIs, with deterministic verification
 * and real failure recovery.
 * 
 * Core Principles:
 * - Manager is the only decision-maker
 * - Workers are stateless (execute one task and die)
 * - Workers never access memory directly
 * - Failure is enforced by verifiers and reflection
 * - Approval is not guaranteed
 */

const { ChatGroq } = require('@langchain/groq');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');

// Worker agents (stateless)
const ingestAgent = require('./ingestAgent');
const generatorAgent = require('./generatorAgent');
const reviewerAgent = require('./reviewerAgent');
const publisherAgent = require('./publisherAgent');
const imageGeneratorAgent = require('./imageGeneratorAgent');

// State management
const AgentState = require('./agentState');

// Verification and reflection
const verifiers = require('./verifiers');
const reflector = require('./reflector');

// Memory systems
const vectorStore = require('../vectorStore');
const graphMemory = require('../memory/graphMemory');

// Real-time streaming
const orchestrationEmitter = require('../orchestrationEmitter');

/**
 * Emit a natural language log message directly via SSE
 * Simple and direct - no database writes
 */
// Helper for logging
function emit(contentId, message) {
    if (!contentId) {
        console.warn(`[Stream] ⚠️ WARNING: Missing contentId for log: "${message}"`);
        console.trace();
        return;
    }
    // Ensure contentId is always a string
    const idString = String(contentId);
    console.log(`[Stream] Emitting log:${idString} - ${message}`);
    orchestrationEmitter.log(idString, message);
}

class ManagerAgent {
    constructor() {
        // Initialize LLM for planning and reasoning
        this.llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3
        });

        // Planning prompt - generates JSON manifest
        this.planningPrompt = PromptTemplate.fromTemplate(`
You are the Manager Agent in SACO. Your role is to plan content repurposing.

GOAL: {goal}
CONTENT: "{contentTitle}" ({contentType})
TARGET PLATFORMS: {platforms}
BRAND CONTEXT AVAILABLE: {hasBrandContext}

Create a detailed execution plan as JSON:
{{
    "goal": "restated goal",
    "steps": [
        {{"id": 1, "agent": "ingest", "action": "analyze", "platform": null}},
        {{"id": 2, "agent": "generator", "action": "generate", "platform": "twitter"}},
        {{"id": 3, "agent": "reviewer", "action": "review", "platform": "twitter"}},
        ...repeat for each platform...
        {{"id": N, "agent": "publisher", "action": "publish", "platform": "all_approved"}}
    ],
    "successCriteria": "what defines success",
    "maxRetries": 3
}}

Output only valid JSON.
`);

        this.planChain = RunnableSequence.from([
            this.planningPrompt,
            this.llm,
            new StringOutputParser()
        ]);
    }

    /**
     * Main orchestration entry point
     * Implements the agentic control loop
     */
    async orchestrate(content, brandDNA, platforms = ['twitter', 'linkedin', 'email']) {
        console.log('[Manager] Starting agentic orchestration loop');
        // CRITICAL: Convert to string immediately for consistent SSE channel names
        const contentId = String(content._id || content.id);
        console.log(`[Manager] contentId for SSE: ${contentId}`);

        // Emit start event
        emit(contentId, '⚡ Starting orchestration...');

        // Initialize state
        const state = new AgentState({
            goal: `Transform "${content.title}" for multi-platform distribution`,
            content,
            brandDNA,
            platforms,
            status: 'planning',
            contentId  // Store for emitting
        });

        // FORCE contentId ensures it persists even if AgentState constructor is flaky
        state.contentId = contentId;

        console.log(`[Manager] Initialized state with contentId: ${state.contentId} (type: ${typeof state.contentId})`);

        try {
            // Step 0: Query workspace memory (Pinecone + Neo4j)
            await this.queryMemory(state);

            // Step 1: Plan the workflow
            await this.planStep(state);

            // Step 2-N: Execute the plan with verification and reflection
            await this.executeLoop(state);

            // Step N+1: Persist outcomes to memory
            await this.persistOutcomes(state);

            // Return results
            state.status = 'completed';
            const results = this.buildResults(state);

            // Emit completion
            orchestrationEmitter.complete(contentId, results.kpis, results.variants);
            emit(contentId, `🎉 Orchestration complete! Published ${results.kpis.publishedCount} variants.`);

            return results;

        } catch (error) {
            console.error('[Manager] Fatal error:', error);
            state.recordError(error, 'orchestration');
            state.status = 'failed';

            return this.buildResults(state, error);
        }
    }

    /**
     * Query both vector and graph memory for context
     */
    async queryMemory(state) {
        console.log('[Manager] Querying workspace memory...');
        emit(state.contentId, '🧠 Searching workspace memory for relevant context...');
        emit(state.contentId, `Looking for semantic matches to: "${state.content.title}"`);

        const { content, brandDNA } = state;
        const identityContext = {
            vectors: [],
            graph: null,
            brandBeliefs: [],
            pastWorks: []
        };

        try {
            // Vector memory: semantic search for similar content
            const vectorQuery = `${content.title} ${content.data?.substring(0, 200)}`;
            const vectorResults = await vectorStore.query(vectorQuery, 3);
            identityContext.vectors = vectorResults.map(r => ({
                text: r.text,
                score: r.score,
                type: r.metadata?.type
            }));

            // Graph memory: brand identity traversal
            if (brandDNA?.companyName) {
                const graphContext = await graphMemory.queryBrandIdentity(brandDNA.companyName);
                if (graphContext) {
                    identityContext.graph = graphContext;
                    identityContext.brandBeliefs = graphContext.beliefs || [];
                    identityContext.pastWorks = graphContext.pastWorks || [];
                }
            }

            state.identityContext = identityContext;

            // Rich logging of what was found
            if (vectorResults.length > 0) {
                emit(state.contentId, `✅ Found ${vectorResults.length} related pieces of content in vector memory`);
                emit(state.contentId, `  → Best match (score: ${(vectorResults[0].score * 100).toFixed(1)}%): "${vectorResults[0].text?.substring(0, 80)}..."`);
            } else {
                emit(state.contentId, `⚠️ No related content found in vector memory - will use fresh context`);
            }

            if (identityContext.graph) {
                emit(state.contentId, `✅ Brand graph context loaded for ${brandDNA.companyName}`);
            }

            state.addTrace('manager',
                { step: 'queryMemory', content: content.title },
                { vectorsFound: vectorResults.length, graphFound: !!identityContext.graph },
                { contextReady: true }
            );

            console.log(`[Manager] Memory context loaded: ${vectorResults.length} vectors, graph: ${!!identityContext.graph}`);
        } catch (error) {
            console.warn('[Manager] Memory query failed, continuing without context:', error.message);
            state.identityContext = identityContext;
        }
    }

    /**
     * Generate execution plan (JSON manifest)
     */
    async planStep(state) {
        console.log('[Manager] Planning step...');
        emit(state.contentId, '� Analyzing content structure to create execution plan...');
        emit(state.contentId, `Goal: Transform "${state.content.title}" into ${state.platforms.length} platform-specific variants`);
        state.status = 'planning';

        try {
            const response = await this.planChain.invoke({
                goal: state.goal,
                contentTitle: state.content.title,
                contentType: state.content.type || 'text',
                platforms: state.platforms.join(', '),
                hasBrandContext: state.identityContext?.graph ? 'Yes' : 'No'
            });

            // Parse plan
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }

            const plan = JSON.parse(cleanResponse);
            state.plan = plan.steps || this.defaultPlan(state.platforms);
            state.recordDecision('plan', 'created', `${state.plan.length} steps planned`);

            state.addTrace('manager',
                { step: 'plan', goal: state.goal },
                { stepsGenerated: state.plan.length },
                { planReady: true, steps: state.plan.map(s => `${s.agent}:${s.action}`) }
            );

            // Rich planning summary
            const agentCounts = state.plan.reduce((acc, s) => { acc[s.agent] = (acc[s.agent] || 0) + 1; return acc; }, {});
            emit(state.contentId, `✅ Execution plan ready: ${state.plan.length} total steps`);
            emit(state.contentId, `  → Ingest: ${agentCounts.ingest || 0} | Generate: ${agentCounts.generator || 0} | Review: ${agentCounts.reviewer || 0} | Publish: ${agentCounts.publisher || 0}`);
            emit(state.contentId, `  → Target platforms: ${state.platforms.join(', ')}`);

            console.log(`[Manager] Plan generated: ${state.plan.length} steps`);

        } catch (error) {
            console.warn('[Manager] Planning failed, using default plan:', error.message);
            state.plan = this.defaultPlan(state.platforms);
        }
    }

    /**
     * Default fallback plan
     */
    defaultPlan(platforms) {
        const steps = [{ id: 1, agent: 'ingest', action: 'analyze', platform: null }];
        let id = 2;

        for (const platform of platforms) {
            steps.push({ id: id++, agent: 'generator', action: 'generate', platform });
            steps.push({ id: id++, agent: 'reviewer', action: 'review', platform });
        }

        steps.push({ id: id, agent: 'publisher', action: 'publish', platform: 'all_approved' });
        return steps;
    }

    /**
     * Main execution loop with verification and reflection
     */
    async executeLoop(state) {
        console.log('[Manager] Entering execution loop...');
        state.status = 'executing';

        // Execute Ingest
        await this.executeIngest(state);

        // Execute Image Generation (optional, non-blocking)
        // Images are treated as enrichments, not core outputs
        this.executeImageGeneration(state).catch(err => {
            console.log('[Manager] Image generation skipped:', err.message);
        });

        // Execute per-platform: Generate → Review → Verify
        for (const platform of state.platforms) {
            let success = false;

            while (!success && state.canRetry()) {
                // Generate
                const draft = await this.executeGenerator(state, platform);

                // Review
                const review = await this.executeReviewer(state, platform);

                // Verify (deterministic checks)
                const verification = await this.verifyVariant(state, platform);

                if (verification.passed) {
                    success = true;
                    state.recordDecision(`verify:${platform}`, 'passed', verification.summary);
                } else {
                    // Reflection and retry
                    state.status = 'reflecting';
                    console.log(`[Manager] Verification failed for ${platform}: ${verification.summary}`);

                    const reflection = await this.reflectAndRetry(state, platform, verification);

                    if (reflection.action === 'escalate') {
                        console.log(`[Manager] Escalating ${platform}: ${reflection.reason}`);
                        state.recordDecision(`reflect:${platform}`, 'escalated', reflection.reason);
                        break;
                    }

                    state.status = 'executing';
                    // Loop continues with updated strategy
                }
            }
        }

        // Wait for image generation to complete before publishing
        if (state.imageGenerationPromise) {
            try {
                await state.imageGenerationPromise;
            } catch (err) {
                console.log('[Manager] Image generation promise rejected:', err.message);
            }
        }

        // Publish approved variants
        await this.executePublisher(state);
    }

    /**
     * Execute Image Generation (optional enrichment)
     * Non-blocking - failure does not affect text pipeline
     */
    async executeImageGeneration(state) {
        // Check if image generation should be attempted
        const shouldGenerate = imageGeneratorAgent.shouldGenerate(state.content, state.brandDNA);

        if (!shouldGenerate) {
            console.log('[Manager] Image generation disabled, skipping');
            state.imageGeneration = { status: 'skipped', reason: 'disabled' };
            return;
        }

        console.log('[Manager] Starting image generation (non-blocking)...');
        emit(state.contentId, '🎨 Starting autonomous image generation...');
        emit(state.contentId, '  → Deriving visual intent from content context...');

        // Initialize tracking
        state.imageGeneration = {
            status: 'attempted',
            images: [],
            startedAt: Date.now()
        };

        // Store promise so we can await before publishing
        state.imageGenerationPromise = (async () => {
            try {
                // Generate one image for generic use (can expand per-platform later)
                const result = await imageGeneratorAgent.generate(
                    state.content,
                    state.ingest,
                    state.brandDNA,
                    'generic'
                );

                if (result.status === 'generated') {
                    state.imageGeneration.status = 'succeeded';
                    state.imageGeneration.images.push(result);

                    emit(state.contentId, `🎨 ✅ Image generated via ${result.provider}`);
                    emit(state.contentId, `  → Prompt: "${result.prompt.substring(0, 60)}..."`);

                    if (result.fallbackOccurred) {
                        emit(state.contentId, `  → Note: Fallback provider used`);
                    }

                    // Record trace
                    if (result.trace) {
                        state.pipelineTrace.push(result.trace);
                    }

                    state.recordDecision('imageGeneration', 'completed', `Generated via ${result.provider}`);
                } else {
                    state.imageGeneration.status = 'failed';
                    state.imageGeneration.error = result.error;

                    emit(state.contentId, `🎨 ⚠️ Image generation failed: ${result.error}`);
                    state.recordDecision('imageGeneration', 'failed', result.error);
                }

            } catch (error) {
                state.imageGeneration.status = 'failed';
                state.imageGeneration.error = error.message;
                console.log('[Manager] Image generation error:', error.message);
                state.recordDecision('imageGeneration', 'failed', error.message);
            }
        })();
    }

    /**
     * Execute Ingest Agent
     */
    async executeIngest(state) {
        console.log('[Manager] Delegating to Ingest Agent...');
        orchestrationEmitter.step(state.contentId, 'ingest', null, 'running');
        emit(state.contentId, '� Reading and analyzing source content structure...');
        emit(state.contentId, `Content length: ${state.content.data?.length || 0} characters`);
        emit(state.contentId, '🔍 Extracting themes, keywords, sentiment, and target audience...');

        const result = await ingestAgent.process(state.content, state.brandDNA);
        state.ingest = result;

        if (result.trace) {
            state.pipelineTrace.push(result.trace);
        }

        // Rich logging of extraction results
        if (result.themes?.length > 0) {
            emit(state.contentId, `✅ Extracted themes: ${result.themes.slice(0, 4).join(', ')}`);
        }
        if (result.sentiment) {
            emit(state.contentId, `✅ Detected sentiment: ${result.sentiment}`);
        }
        if (result.keyMessages?.length > 0) {
            emit(state.contentId, `✅ Key message: "${result.keyMessages[0].substring(0, 80)}..."`);
        }
        emit(state.contentId, `✅ Content analysis complete - ready for multi-platform generation`);

        state.recordDecision('ingest', 'completed', `Extracted ${result.themes?.length || 0} themes`);
        state.nextStep();
    }

    /**
     * Execute Generator Agent for a platform
     */
    async executeGenerator(state, platform) {
        console.log(`[Manager] Delegating to Generator for ${platform}...`);
        orchestrationEmitter.step(state.contentId, 'generate', platform, 'running');

        // Rich pre-generation thinking
        const platformSpecs = {
            twitter: { chars: 280, style: 'punchy, hashtags' },
            linkedin: { chars: 3000, style: 'professional, thought-leadership' },
            email: { chars: 5000, style: 'newsletter, scannable' },
            instagram: { chars: 2200, style: 'visual, engaging' },
            blog: { chars: 10000, style: 'long-form, SEO' }
        }[platform] || { chars: 1000, style: 'general' };

        emit(state.contentId, `✨ Generating ${platform.toUpperCase()} variant...`);
        emit(state.contentId, `  → Platform constraints: max ${platformSpecs.chars} chars, style: ${platformSpecs.style}`);
        emit(state.contentId, `  → Applying brand voice: ${state.brandDNA?.voice?.personality || 'professional'}`);
        emit(state.contentId, `  → Using themes: ${state.ingest?.themes?.slice(0, 3).join(', ') || 'content-derived'}`);

        // Include reflection strategy if retrying
        const lastError = state.errors.find(e => e.step?.includes(platform));
        const reflectionHint = lastError?.reflectionStrategy || null;

        if (reflectionHint) {
            emit(state.contentId, `  ⚠️ Retry with reflection: ${reflectionHint}`);
        }

        const result = await generatorAgent.generate(
            state.content,
            platform,
            state.ingest,
            state.brandDNA,
            reflectionHint // Pass strategy to generator for retry
        );

        state.drafts[platform] = result;

        if (result.trace) {
            state.pipelineTrace.push(result.trace);
        }

        return result;
    }

    /**
     * Execute Reviewer Agent for a platform
     */
    async executeReviewer(state, platform) {
        console.log(`[Manager] Delegating to Reviewer for ${platform}...`);
        orchestrationEmitter.step(state.contentId, 'review', platform, 'running');

        const draft = state.drafts[platform];
        emit(state.contentId, `🔍 Reviewing ${platform.toUpperCase()} variant for brand alignment...`);
        emit(state.contentId, `  → Checking tone, values, keywords, and audience fit`);
        emit(state.contentId, `  → Content preview: "${draft.content?.substring(0, 60)}..."`);

        const variant = {
            platform,
            content: draft.content,
            metadata: draft.metadata
        };

        const result = await reviewerAgent.review(variant, state.brandDNA);
        state.reviews[platform] = result;

        if (result.trace) {
            state.pipelineTrace.push(result.trace);
        }

        // Rich logging of review results
        emit(state.contentId, `✅ Brand consistency score: ${result.score}%`);
        if (result.passed) {
            emit(state.contentId, `✅ Review PASSED - content aligns with brand voice`);
        } else {
            emit(state.contentId, `⚠️ Review flagged issues: ${result.suggestions?.[0] || 'needs refinement'}`);
        }

        return result;
    }

    /**
     * Run deterministic verifiers on a variant
     */
    async verifyVariant(state, platform) {
        console.log(`[Manager] Running verifiers for ${platform}...`);
        orchestrationEmitter.step(state.contentId, 'verify', platform, 'running');

        const draft = state.drafts[platform];
        const review = state.reviews[platform];

        emit(state.contentId, `✅ Running quality checks for ${platform.toUpperCase()}...`);
        emit(state.contentId, `  → Length verification: ${draft.content?.length || 0} chars`);
        emit(state.contentId, `  → Review score: ${review.score}% (threshold: 80%)`);
        emit(state.contentId, `  → Checking: keywords, forbidden words, content structure`);

        const variant = {
            platform,
            content: draft.content,
            consistencyScore: review.score
        };

        // Get forbidden phrases from brand DNA
        const forbiddenPhrases = state.brandDNA?.guidelines?.avoidWords || [];
        const requiredKeywords = state.brandDNA?.guidelines?.keyTerms || [];

        const verification = verifiers.verifyAll(variant, {
            forbiddenPhrases,
            requiredKeywords,
            scoreThreshold: 80
        });

        // Also check graph coherence if available
        if (state.brandDNA?.companyName && state.identityContext?.graph) {
            graphMemory.checkCoherence(state.brandDNA.companyName, draft.content)
                .then(coherence => {
                    if (!coherence.coherent) {
                        console.log(`[Manager] Graph coherence issues: ${coherence.issues.join(', ')}`);
                    }
                })
                .catch(() => { }); // Non-blocking
        }

        state.addTrace('verifier',
            { platform, contentLength: draft.content?.length, score: review.score },
            { passed: verification.passed, checks: Object.keys(verification.results) },
            { verdict: verification.passed ? 'approved' : 'failed', issues: verification.summary }
        );

        return verification;
    }

    /**
     * Reflect on failure and decide retry strategy
     */
    async reflectAndRetry(state, platform, verification) {
        console.log(`[Manager] Reflecting on failure for ${platform}...`);

        const reflection = await reflector.reflect(verification.summary, {
            platform,
            goal: state.goal,
            history: state.history,
            content: state.drafts[platform]?.content
        });

        state.recordError({
            message: verification.summary,
            reflectionStrategy: reflection.strategy
        }, `verify:${platform}`);

        state.addTrace('reflector',
            { platform, error: verification.summary },
            { canFix: reflection.canFix, strategy: reflection.strategy },
            { action: reflection.canFix ? 'retry' : 'escalate' }
        );

        return reflector.shouldRetry(reflection, state.retryCount, state.maxRetries);
    }

    /**
     * Execute Publisher for approved variants
     */
    async executePublisher(state) {
        console.log('[Manager] Executing Publisher for approved variants...');
        orchestrationEmitter.step(state.contentId, 'publish', null, 'running');

        const approvedCount = state.platforms.filter(p => state.reviews[p]?.passed).length;

        // Determine publication mode from content document
        const pubMode = state.content?.publicationMode || 'mock';
        const isAutoPublish = state.content?.autoPublish || false;

        // Look up per-user Ayrshare API key
        let userApiKey = null;
        if (pubMode === 'live' && isAutoPublish && state.content?.userId) {
            try {
                const User = require('../../models/User');
                const user = await User.findById(state.content.userId);
                userApiKey = user?.getAyrshareKey?.() || null;
            } catch (err) {
                console.warn('[Manager] Could not load user API key:', err.message);
            }
        }

        if (isAutoPublish && pubMode === 'live') {
            emit(state.contentId, `🚀 AUTO-PUBLISH enabled (${pubMode} mode) — publishing ${approvedCount} approved variants...`);
        } else {
            emit(state.contentId, `🚀 Preparing to publish ${approvedCount} approved variants (${pubMode} mode)...`);
        }

        for (const platform of state.platforms) {
            const review = state.reviews[platform];

            if (review?.passed) {
                const draft = state.drafts[platform];

                emit(state.contentId, `  → Formatting ${platform.toUpperCase()} for API submission...`);
                emit(state.contentId, `    Score: ${review.score}% | Length: ${draft.content?.length || 0} chars`);

                const variant = {
                    platform,
                    content: draft.content,
                    metadata: draft.metadata,
                    consistencyScore: review.score,
                    status: 'approved'
                };

                // Attach image if available
                if (state.imageGeneration?.status === 'succeeded' && state.imageGeneration.images?.length > 0) {
                    const image = state.imageGeneration.images[0];
                    variant.image = {
                        url: image.url,
                        prompt: image.prompt,
                        provider: image.provider
                    };
                    emit(state.contentId, `  → Attaching generated image to ${platform}`);
                }

                // Use publication mode: auto-publish uses content mode, manual defaults to mock
                const effectiveMode = isAutoPublish ? pubMode : 'mock';
                const published = await publisherAgent.format(variant, effectiveMode, userApiKey);
                state.published.push(platform);

                // Store publish result on state for buildResults
                if (!state.publishResults) state.publishResults = {};
                state.publishResults[platform] = published.publishStatus || {};

                const postId = published.publishStatus?.postId || published.publishResult?.mockId || 'pending';
                const modeLabel = published.publishStatus?.mode || effectiveMode;
                emit(state.contentId, `  ✅ ${platform.toUpperCase()} published successfully (${modeLabel} | ID: ${postId})`);

                if (published.trace) {
                    state.pipelineTrace.push(published.trace);
                }
            }
        }
    }

    /**
     * Persist outcomes to vector and graph memory
     */
    async persistOutcomes(state) {
        console.log('[Manager] Persisting outcomes to memory...');

        for (const platform of state.published) {
            const draft = state.drafts[platform];
            const review = state.reviews[platform];

            try {
                // Vector store: embed and upsert
                await vectorStore.upsert(draft.content, {
                    type: 'published',
                    platform,
                    title: state.content.title,
                    score: review.score
                });

                // Graph store: record past work
                if (state.brandDNA?.companyName) {
                    await graphMemory.recordPastWork(state.brandDNA.companyName, {
                        title: state.content.title,
                        platform,
                        content: draft.content,
                        score: review.score,
                        topics: state.ingest?.themes || []
                    });
                }
            } catch (error) {
                console.warn(`[Manager] Failed to persist ${platform}:`, error.message);
            }
        }
    }

    /**
     * Build final results object
     */
    buildResults(state, error = null) {
        const kpis = state.getKPIs();

        // Build variants array for compatibility
        // Ensure content is never empty to avoid Mongoose validation errors
        const variants = state.platforms.map(platform => {
            const draft = state.drafts[platform];
            const review = state.reviews[platform];
            const fallbackContent = `[Content generation failed for ${platform}]`;

            const variant = {
                platform,
                content: draft?.content || fallbackContent,
                metadata: draft?.metadata || {},
                consistencyScore: state.reviews[platform]?.score || 0,
                status: state.reviews[platform]?.passed ? 'approved' : 'flagged',
                feedback: state.reviews[platform]?.feedback || ''
            };

            // Attach image if available
            if (state.imageGeneration?.status === 'succeeded' && state.imageGeneration.images?.length > 0) {
                const image = state.imageGeneration.images[0];
                variant.image = {
                    url: image.url,
                    prompt: image.prompt,
                    provider: image.provider
                };
            }

            // Attach publish status if available
            if (state.publishResults?.[platform]) {
                variant.publishStatus = state.publishResults[platform];
            }

            return variant;
        });

        // Manager summary trace
        state.addTrace('manager',
            { goal: state.goal, platforms: state.platforms },
            {
                totalVariants: state.platforms.length,
                approved: state.published.length,
                flagged: state.platforms.length - state.published.length,
                reflectionsTriggered: state.errors.length
            },
            { kpis, published: state.published, status: state.status }
        );

        return {
            variants,
            publishedVariants: state.published.map(p => state.drafts[p]),
            kpis,
            status: state.status,
            log: state.history.map(h => ({
                agent: h.step.split(':')[0],
                action: h.decision,
                timestamp: h.timestamp,
                details: { reasoning: h.reasoning }
            })),
            pipelineTrace: state.pipelineTrace,
            errors: state.errors,
            error: error?.message
        };
    }

    /**
     * Proactive archive scan (stub for scheduler)
     */
    async scanArchives(userId) {
        console.log(`[Manager] Proactive archive scan for user ${userId}`);
        return { scanned: true, foundStale: 0 };
    }
}

module.exports = new ManagerAgent();
