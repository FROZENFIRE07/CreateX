/**
 * LLM Client Factory
 * Falls back to Groq (Llama) when Bedrock is unavailable.
 */

const { ChatGroq } = require('@langchain/groq');

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Create a LangChain ChatGroq instance
 * @param {Object} options
 * @param {number} options.temperature - Sampling temperature (0-1)
 * @param {number} [options.maxTokens] - Maximum output tokens
 * @returns {ChatGroq}
 */
function createBedrockLLM({ temperature = 0.3, maxTokens } = {}) {
    const config = {
        apiKey: process.env.GROQ_API_KEY,
        model: GROQ_MODEL,
        temperature,
    };
    if (maxTokens) {
        config.maxTokens = maxTokens;
    }
    return new ChatGroq(config);
}

module.exports = { createBedrockLLM };
