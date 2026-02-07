/**
 * Orchestration Event Emitter
 * Simple event emitter for real-time streaming via SSE
 * NO DATABASE - just direct event streaming
 */

const EventEmitter = require('events');

class OrchestrationEmitter extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(100);
        this.history = new Map(); // Buffer for late subscribers
    }

    /**
     * Emit a natural language log message
     */
    log(contentId, message) {
        // Ensure contentId is always a string for consistent event names
        const idString = String(contentId);
        
        const payload = {
            type: 'log',
            message,
            timestamp: new Date().toISOString()
        };

        // Store in history
        if (!this.history.has(idString)) {
            this.history.set(idString, []);
        }
        this.history.get(idString).push(payload);

        // Emit to channel
        const eventName = `log:${idString}`;
        console.log(`[OrchEmitter] Emitting to "${eventName}" - listeners: ${this.listenerCount(eventName)}`);
        this.emit(eventName, payload);
    }

    /**
     * Emit a step update
     */
    step(contentId, step, platform = null, status = 'running') {
        const payload = {
            type: 'step',
            step,
            platform,
            status,
            timestamp: new Date().toISOString()
        };

        this.emit(`step:${contentId}`, payload);
    }

    /**
     * Emit completion with results
     */
    complete(contentId, kpis, variants) {
        const payload = {
            type: 'complete',
            kpis,
            variants,
            timestamp: new Date().toISOString()
        };

        this.emit(`complete:${contentId}`, payload);

        // Cleanup history after 5 minutes
        setTimeout(() => {
            this.history.delete(contentId);
        }, 5 * 60 * 1000);
    }

    /**
     * Emit error
     */
    error(contentId, error) {
        const payload = {
            type: 'error',
            error: error.message || error,
            timestamp: new Date().toISOString()
        };

        this.emit(`error:${contentId}`, payload);

        // Cleanup history after 5 minutes
        setTimeout(() => {
            this.history.delete(contentId);
        }, 5 * 60 * 1000);
    }

    /**
     * Get buffered history for a content ID
     */
    getHistory(contentId) {
        return this.history.get(contentId) || [];
    }
}

module.exports = new OrchestrationEmitter();
