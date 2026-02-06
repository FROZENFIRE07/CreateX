/**
 * Manager Agent
 * The Orchestrator - Proactive, goal-driven hierarchical controller
 * 
 * From Sources (Architecture I Table):
 * - Trigger: System Goal (not just user input)
 * - Role: Orchestrator (not just Executor)
 * - Decomposes goals, delegates to workers, iterates on failures
 * 
 * Implements HOTL (Human-on-the-Loop): 80-90% autonomous,
 * flags only exceptions requiring human review.
 */

const { ChatGroq } = require('@langchain/groq');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');

const ingestAgent = require('./ingestAgent');
const generatorAgent = require('./generatorAgent');
const reviewerAgent = require('./reviewerAgent');
const publisherAgent = require('./publisherAgent');

class ManagerAgent {
    constructor() {
        // Initialize LLM - using Groq (free tier)
        this.llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3
        });

        // Manager prompt - goal decomposition
        this.planningPrompt = PromptTemplate.fromTemplate(`
You are the Manager Agent in SACO (Systemic AI Content Orchestrator).
Your role is to decompose content transformation goals into executable steps.

GOAL: {goal}
CONTENT TYPE: {contentType}
TARGET PLATFORMS: {platforms}
BRAND DNA AVAILABLE: {hasBrandDNA}

Decompose this into a step-by-step plan:
1. Ingest: Analyze content, extract themes, retrieve relevant context from memory
2. Generate: Create platform-specific variants with brand consistency
3. Review: Score each variant against brand DNA (threshold: 80%)
4. Publish: Format approved variants for delivery

Output a JSON plan with this structure:
{{
  "goal": "string - restated goal",
  "steps": [
    {{ "agent": "ingest|generator|reviewer|publisher", "action": "string", "params": {{}} }}
  ],
  "successCriteria": "string - what defines success",
  "fallbackStrategy": "string - what to do if a step fails"
}}

Only output valid JSON, no markdown.
`);

        this.chain = RunnableSequence.from([
            this.planningPrompt,
            this.llm,
            new StringOutputParser()
        ]);
    }

    /**
     * Execute the full COPE pipeline
     * @param {object} content - Content document
     * @param {object} brandDNA - Brand guidelines
     * @param {string[]} platforms - Target platforms
     */
    async orchestrate(content, brandDNA, platforms = ['twitter', 'linkedin', 'email']) {
        const startTime = Date.now();
        const log = [];
        const results = {
            variants: [],
            kpis: {},
            status: 'processing',
            log
        };

        try {
            // Step 1: Plan the workflow
            log.push({
                agent: 'manager',
                action: 'planning',
                timestamp: new Date(),
                details: { goal: 'COPE transformation' }
            });

            const planResponse = await this.chain.invoke({
                goal: `Transform "${content.title}" for multi-platform distribution`,
                contentType: content.type,
                platforms: platforms.join(', '),
                hasBrandDNA: brandDNA ? 'Yes' : 'No'
            });

            let plan;
            try {
                plan = JSON.parse(planResponse);
            } catch {
                // Fallback plan if LLM fails to return valid JSON
                plan = {
                    goal: 'COPE transformation',
                    steps: [
                        { agent: 'ingest', action: 'analyze', params: {} },
                        { agent: 'generator', action: 'generate', params: { platforms } },
                        { agent: 'reviewer', action: 'review', params: {} },
                        { agent: 'publisher', action: 'format', params: {} }
                    ]
                };
            }

            log.push({
                agent: 'manager',
                action: 'plan_created',
                timestamp: new Date(),
                details: plan
            });

            // Step 2: Execute Ingest Agent - analyze content and retrieve context
            log.push({
                agent: 'ingest',
                action: 'analyzing',
                timestamp: new Date()
            });

            const ingestResult = await ingestAgent.process(content, brandDNA);

            log.push({
                agent: 'ingest',
                action: 'completed',
                timestamp: new Date(),
                details: { themes: ingestResult.themes, contextRetrieved: ingestResult.context?.length > 0 }
            });

            // Step 3: Generate variants for each platform
            const variants = [];

            for (const platform of platforms) {
                log.push({
                    agent: 'generator',
                    action: `generating_${platform}`,
                    timestamp: new Date()
                });

                const variant = await generatorAgent.generate(
                    content,
                    platform,
                    ingestResult,
                    brandDNA
                );

                variants.push({
                    platform,
                    content: variant.content,
                    metadata: variant.metadata
                });

                log.push({
                    agent: 'generator',
                    action: `${platform}_generated`,
                    timestamp: new Date(),
                    details: { charCount: variant.content.length }
                });
            }

            // Step 4: Review all variants for brand consistency
            const reviewedVariants = [];
            let passedCount = 0;

            for (const variant of variants) {
                log.push({
                    agent: 'reviewer',
                    action: `reviewing_${variant.platform}`,
                    timestamp: new Date()
                });

                const review = await reviewerAgent.review(variant, brandDNA);

                reviewedVariants.push({
                    ...variant,
                    consistencyScore: review.score,
                    status: review.passed ? 'approved' : 'flagged',
                    feedback: review.feedback
                });

                if (review.passed) passedCount++;

                log.push({
                    agent: 'reviewer',
                    action: `${variant.platform}_reviewed`,
                    timestamp: new Date(),
                    details: { score: review.score, passed: review.passed }
                });
            }

            // Step 5: Format and "publish" approved variants
            const publishedVariants = [];

            for (const variant of reviewedVariants) {
                if (variant.status === 'approved') {
                    log.push({
                        agent: 'publisher',
                        action: `formatting_${variant.platform}`,
                        timestamp: new Date()
                    });

                    const published = await publisherAgent.format(variant);
                    publishedVariants.push(published);

                    log.push({
                        agent: 'publisher',
                        action: `${variant.platform}_ready`,
                        timestamp: new Date(),
                        details: { formatted: true }
                    });
                }
            }

            // Calculate KPIs
            const endTime = Date.now();
            results.variants = reviewedVariants;
            results.kpis = {
                hitRate: Math.round((passedCount / variants.length) * 100),
                automationRate: 100, // Fully autonomous in this run
                avgConsistencyScore: Math.round(
                    reviewedVariants.reduce((sum, v) => sum + v.consistencyScore, 0) / reviewedVariants.length
                ),
                processingTime: Math.round((endTime - startTime) / 1000)
            };
            results.status = 'completed';

            log.push({
                agent: 'manager',
                action: 'orchestration_complete',
                timestamp: new Date(),
                details: results.kpis
            });

            return results;

        } catch (error) {
            console.error('Manager Agent error:', error);

            log.push({
                agent: 'manager',
                action: 'error',
                timestamp: new Date(),
                details: { error: error.message }
            });

            results.status = 'failed';
            results.error = error.message;
            return results;
        }
    }

    /**
     * Proactive archive scan (simulated cron)
     * Triggered by backend scheduler to repurpose stale content
     */
    async scanArchives(userId) {
        console.log(`[Manager] Proactive archive scan for user ${userId}`);
        // This would query old content and trigger repurposing
        // Implementing the "dead archives" → "live assets" transformation from sources
        return { scanned: true, foundStale: 0 };
    }
}

module.exports = new ManagerAgent();
