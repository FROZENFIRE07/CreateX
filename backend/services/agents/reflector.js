/**
 * Reflector Agent
 * Analyzes failures and proposes fix strategies for self-correction
 * 
 * When verifiers fail, this module reflects on "why" and suggests
 * concrete changes for the next retry attempt.
 */

const { ChatGroq } = require('@langchain/groq');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');

// Low temperature for analytical reasoning
const llm = new ChatGroq({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2
});

const reflectionPrompt = PromptTemplate.fromTemplate(`
You are a content quality analyst. A content generation task has failed verification.

FAILURE DETAILS:
{error}

ORIGINAL TASK:
Platform: {platform}
Goal: {goal}

PREVIOUS ATTEMPTS (if any):
{history}

THE FAILED CONTENT:
{content}

Analyze WHY this failed and provide a concrete strategy to fix it.

Respond in JSON format:
{{
    "rootCause": "Brief explanation of why it failed",
    "canFix": true/false,
    "strategy": "Specific instructions for the next attempt",
    "focusAreas": ["list", "of", "things", "to", "change"],
    "avoidPatterns": ["patterns", "that", "caused", "failure"]
}}

Only set canFix to false if the task is fundamentally impossible (e.g., "write 5000 chars for Twitter").
`);

const chain = RunnableSequence.from([
    reflectionPrompt,
    llm,
    new StringOutputParser()
]);

/**
 * Reflect on a failure and propose fix strategy
 */
async function reflect(error, context) {
    const {
        platform = 'unknown',
        goal = 'content repurposing',
        history = [],
        content = ''
    } = context;

    try {
        const response = await chain.invoke({
            error: typeof error === 'string' ? error : JSON.stringify(error),
            platform,
            goal,
            history: history.length > 0
                ? history.map((h, i) => `Attempt ${i + 1}: ${h.decision} - ${h.reasoning}`).join('\n')
                : 'No previous attempts',
            content: content.substring(0, 500) // Limit content length
        });

        // Strip markdown code blocks if present
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const result = JSON.parse(cleanResponse);

        return {
            canFix: result.canFix ?? true,
            rootCause: result.rootCause || 'Unknown',
            strategy: result.strategy || 'Retry with more careful attention to requirements',
            focusAreas: result.focusAreas || [],
            avoidPatterns: result.avoidPatterns || []
        };
    } catch (parseError) {
        console.warn('[Reflector] Failed to parse reflection:', parseError.message);

        // Fallback: simple heuristic-based reflection
        return heuristicReflection(error, context);
    }
}

/**
 * Heuristic-based reflection when LLM fails
 */
function heuristicReflection(error, context) {
    const errorStr = typeof error === 'string' ? error : JSON.stringify(error);

    // Pattern matching for common failures
    if (errorStr.includes('too short')) {
        return {
            canFix: true,
            rootCause: 'Content was below minimum length',
            strategy: 'Generate more detailed content with examples and elaboration',
            focusAreas: ['Add more detail', 'Include examples', 'Expand key points'],
            avoidPatterns: ['Overly brief responses', 'Missing context']
        };
    }

    if (errorStr.includes('too long')) {
        return {
            canFix: true,
            rootCause: 'Content exceeded platform limits',
            strategy: 'Be more concise. Focus on key message only.',
            focusAreas: ['Remove filler words', 'Shorten sentences', 'One main point'],
            avoidPatterns: ['Long introductions', 'Multiple tangents']
        };
    }

    if (errorStr.includes('code block') || errorStr.includes('malformed')) {
        return {
            canFix: true,
            rootCause: 'LLM output was wrapped in code blocks',
            strategy: 'Output clean content directly without JSON or markdown wrappers',
            focusAreas: ['Plain text output', 'No code formatting'],
            avoidPatterns: ['```json', '```', 'JSON wrapping']
        };
    }

    if (errorStr.includes('forbidden')) {
        return {
            canFix: true,
            rootCause: 'Content contained forbidden phrases',
            strategy: 'Avoid the flagged phrases entirely. Use alternative phrasing.',
            focusAreas: ['Review forbidden word list', 'Use synonyms'],
            avoidPatterns: context.forbiddenPhrases || []
        };
    }

    if (errorStr.includes('score') || errorStr.includes('threshold')) {
        return {
            canFix: true,
            rootCause: 'Content did not meet brand consistency threshold',
            strategy: 'Align more closely with brand voice, tone, and values',
            focusAreas: ['Match brand tone', 'Use brand keywords', 'Reflect brand values'],
            avoidPatterns: ['Generic language', 'Off-brand statements']
        };
    }

    // Default reflection
    return {
        canFix: true,
        rootCause: 'Verification failed',
        strategy: 'Review requirements carefully and generate content that strictly adheres to all constraints.',
        focusAreas: ['Platform requirements', 'Brand guidelines', 'Content quality'],
        avoidPatterns: ['Ignoring constraints', 'Generic content']
    };
}

/**
 * Decide whether to retry or escalate
 */
function shouldRetry(reflection, retryCount, maxRetries = 3) {
    // Don't retry if we've hit max
    if (retryCount >= maxRetries) {
        return {
            action: 'escalate',
            reason: `Max retries (${maxRetries}) exceeded`
        };
    }

    // Don't retry if reflection says it can't be fixed
    if (!reflection.canFix) {
        return {
            action: 'escalate',
            reason: reflection.rootCause
        };
    }

    // Retry with the proposed strategy
    return {
        action: 'retry',
        strategy: reflection.strategy,
        focusAreas: reflection.focusAreas
    };
}

module.exports = {
    reflect,
    heuristicReflection,
    shouldRetry
};
