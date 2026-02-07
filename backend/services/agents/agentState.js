/**
 * Agent State
 * Persistent state schema for the Manager Agent
 * 
 * This defines the structured state that flows through the LangGraph
 * orchestration loop. The Manager owns this state and updates it
 * after each delegation/reflection step.
 */

/**
 * @typedef {Object} AgentState
 * @property {string} goal - User's content repurposing request
 * @property {Object} content - Original content to repurpose
 * @property {Object|null} brandDNA - Brand guidelines from MongoDB
 * @property {string[]} platforms - Target platforms for repurposing
 * @property {Object|null} plan - JSON manifest of tasks
 * @property {number} currentStep - Current step index in plan
 * @property {Object|null} identityContext - Merged Pinecone + Neo4j context
 * @property {Object|null} ingest - Ingest worker output
 * @property {Object} drafts - Platform → generated content map
 * @property {Object} reviews - Platform → review results map
 * @property {string[]} published - List of published platforms
 * @property {Object[]} errors - Error history for reflection
 * @property {Object[]} history - Decision history for reflection
 * @property {Object[]} pipelineTrace - End-to-end observability trace
 * @property {string} status - Current status: planning|executing|reflecting|completed|failed
 */

class AgentState {
    constructor(initialData = {}) {
        // Goal and input
        this.goal = initialData.goal || '';
        this.contentId = initialData.contentId || (initialData.content ? (initialData.content._id || initialData.content.id) : null);
        this.content = initialData.content || null;
        this.brandDNA = initialData.brandDNA || null;
        this.platforms = initialData.platforms || ['twitter', 'linkedin', 'email'];

        // Planning
        this.plan = initialData.plan || null;
        this.currentStep = initialData.currentStep || 0;

        // Memory context (populated from Pinecone + Neo4j)
        this.identityContext = initialData.identityContext || null;

        // Worker outputs
        this.ingest = initialData.ingest || null;
        this.drafts = initialData.drafts || {};
        this.reviews = initialData.reviews || {};
        this.published = initialData.published || [];

        // Reflection and error recovery
        this.errors = initialData.errors || [];
        this.history = initialData.history || [];
        this.retryCount = initialData.retryCount || 0;
        this.maxRetries = initialData.maxRetries || 3;

        // Observability
        this.pipelineTrace = initialData.pipelineTrace || [];
        this.status = initialData.status || 'planning';

        // Timestamps
        this.startedAt = initialData.startedAt || new Date();
        this.updatedAt = new Date();
    }

    /**
     * Add an error to history and increment retry count
     */
    recordError(error, step) {
        this.errors.push({
            step,
            error: error.message || error,
            timestamp: new Date(),
            retryCount: this.retryCount
        });
        this.retryCount++;
        this.updatedAt = new Date();
    }

    /**
     * Add a decision to history (for reflection context)
     */
    recordDecision(step, decision, reasoning) {
        this.history.push({
            step,
            decision,
            reasoning,
            timestamp: new Date()
        });
        this.updatedAt = new Date();
    }

    /**
     * Add trace entry for observability
     */
    addTrace(agent, received, decided, passedOn) {
        this.pipelineTrace.push({
            agent,
            received,
            decided,
            passedOn,
            timestamp: new Date()
        });
        this.updatedAt = new Date();
    }

    /**
     * Check if we can retry
     */
    canRetry() {
        return this.retryCount < this.maxRetries;
    }

    /**
     * Get current plan step
     */
    getCurrentTask() {
        if (!this.plan || this.currentStep >= this.plan.length) {
            return null;
        }
        return this.plan[this.currentStep];
    }

    /**
     * Advance to next step
     */
    nextStep() {
        this.currentStep++;
        this.retryCount = 0; // Reset retries for new step
        this.updatedAt = new Date();
    }

    /**
     * Calculate KPIs
     */
    getKPIs() {
        const totalPlatforms = this.platforms.length;
        const approvedCount = Object.values(this.reviews).filter(r => r.passed).length;
        const publishedCount = this.published.length;
        const reflectionCount = this.errors.length;

        return {
            hitRate: totalPlatforms > 0 ? Math.round((approvedCount / totalPlatforms) * 100) : 0,
            automationRate: reflectionCount === 0 ? 100 : Math.round(((totalPlatforms - reflectionCount) / totalPlatforms) * 100),
            publishedCount,
            reflectionCount,
            processingTime: Math.round((Date.now() - this.startedAt.getTime()) / 1000)
        };
    }

    /**
     * Serialize for persistence
     */
    toJSON() {
        return {
            goal: this.goal,
            contentId: this.contentId,
            content: this.content,
            brandDNA: this.brandDNA,
            platforms: this.platforms,
            plan: this.plan,
            currentStep: this.currentStep,
            identityContext: this.identityContext,
            ingest: this.ingest,
            drafts: this.drafts,
            reviews: this.reviews,
            published: this.published,
            errors: this.errors,
            history: this.history,
            retryCount: this.retryCount,
            pipelineTrace: this.pipelineTrace,
            status: this.status,
            startedAt: this.startedAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Restore from persisted state
     */
    static fromJSON(json) {
        return new AgentState({
            ...json,
            startedAt: new Date(json.startedAt),
            updatedAt: new Date(json.updatedAt)
        });
    }
}

module.exports = AgentState;
