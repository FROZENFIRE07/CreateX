/**
 * Bedrock Client Factory
 * Creates LangChain-compatible ChatBedrock instances for agents.
 * Uses Amazon Bedrock (Claude) as the foundation model.
 */

const { ChatBedrockConverse } = require('@langchain/aws');

const BEDROCK_MODEL = process.env.BEDROCK_MODEL || 'anthropic.claude-3-5-haiku-20241022-v1:0';
const BEDROCK_REGION = process.env.AWS_REGION || 'us-east-1';

/**
 * Create a LangChain ChatBedrock instance (drop-in replacement for ChatGroq)
 * @param {Object} options
 * @param {number} options.temperature - Sampling temperature (0-1)
 * @param {number} [options.maxTokens] - Maximum output tokens
 * @returns {ChatBedrockConverse}
 */
function createBedrockLLM({ temperature = 0.3, maxTokens } = {}) {
    const config = {
        model: BEDROCK_MODEL,
        region: BEDROCK_REGION,
        temperature,
    };
    if (maxTokens) {
        config.maxTokens = maxTokens;
    }
    return new ChatBedrockConverse(config);
}

module.exports = { createBedrockLLM };
