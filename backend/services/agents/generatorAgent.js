/**
 * Generator Agent
 * The Transformer - Creates platform-specific content variants
 * 
 * Implements COPE (Create Once, Publish Everywhere):
 * - Adapts content to platform constraints (Twitter: 280 chars, LinkedIn: 3000)
 * - Incorporates brand DNA via RAG
 * - Grounds generation in facts to avoid hallucination
 */

const { ChatGroq } = require('@langchain/groq');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');

// Platform-specific constraints and guidelines
const PLATFORM_SPECS = {
    twitter: {
        maxChars: 280,
        style: 'concise, punchy, use hashtags, can be a thread (1/n format)',
        format: 'short text with optional hashtags'
    },
    linkedin: {
        maxChars: 3000,
        style: 'professional, thought-leadership, can use emojis sparingly, hook in first line',
        format: 'longer form with sections, bullet points allowed'
    },
    email: {
        maxChars: 5000,
        style: 'newsletter format, clear subject line implication, scannable, personal tone',
        format: 'subject line suggestion + body with sections'
    },
    instagram: {
        maxChars: 2200,
        style: 'visual-first caption, emotional, storytelling, use emojis and hashtags',
        format: 'caption with hashtag block at end'
    },
    blog: {
        maxChars: 10000,
        style: 'SEO-optimized, comprehensive, uses headers and subheaders',
        format: 'full article with H2/H3 structure'
    }
};

class GeneratorAgent {
    constructor() {
        this.llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7
        });

        this.generationPrompt = PromptTemplate.fromTemplate(`
You are the Generator Agent - a creative content transformer for SACO.
Transform the enriched content into a {platform}-optimized version.

PLATFORM: {platform}
MAX CHARACTERS: {maxChars}
STYLE GUIDE: {style}
FORMAT: {format}

ENRICHED CONTENT:
{enrichedContent}

BRAND DNA:
{brandDNA}

INSTRUCTIONS:
1. Keep the core message intact
2. Adapt tone and length for the platform
3. Follow brand guidelines strictly
4. Do NOT hallucinate facts - only use information from the input
5. Make it engaging and shareable

OUTPUT REQUIREMENTS:
- Stay under {maxChars} characters for the main content
- Include platform-appropriate elements (hashtags, hooks, etc.)
- If Twitter, create a thread if needed (use 1/n format)

Output as JSON:
{{
  "content": "the generated content",
  "hashtags": ["tag1", "tag2"] or [],
  "hook": "first line or subject",
  "charCount": number
}}

Only output valid JSON.
`);

        this.chain = RunnableSequence.from([
            this.generationPrompt,
            this.llm,
            new StringOutputParser()
        ]);
    }

    /**
     * Generate platform-specific content variant
     * @param {object} content - Original content
     * @param {string} platform - Target platform
     * @param {object} ingestResult - Analysis from Ingest Agent
     * @param {object} brandDNA - Brand guidelines
     */
    async generate(content, platform, ingestResult, brandDNA = null) {
        const specs = PLATFORM_SPECS[platform] || PLATFORM_SPECS.blog;

        try {
            const response = await this.chain.invoke({
                platform,
                maxChars: specs.maxChars,
                style: specs.style,
                format: specs.format,
                enrichedContent: ingestResult.enrichedContent || content.data,
                brandDNA: brandDNA?.rawText || 'No brand DNA - use professional, engaging tone.'
            });

            let result;
            try {
                result = JSON.parse(response);
            } catch {
                // If JSON parsing fails, use raw response
                result = {
                    content: response.substring(0, specs.maxChars),
                    hashtags: [],
                    hook: response.substring(0, 50),
                    charCount: response.length
                };
            }

            // Ensure content is within limits
            if (result.content.length > specs.maxChars) {
                result.content = result.content.substring(0, specs.maxChars - 3) + '...';
                result.charCount = result.content.length;
                result.truncated = true;
            }

            return {
                content: result.content,
                metadata: {
                    platform,
                    hashtags: result.hashtags || [],
                    hook: result.hook,
                    charCount: result.charCount || result.content.length,
                    truncated: result.truncated || false,
                    themes: ingestResult.themes
                }
            };

        } catch (error) {
            console.error(`Generator Agent error for ${platform}:`, error);

            // Fallback: simple truncation of original content
            const fallbackContent = content.data.substring(0, specs.maxChars - 50);
            return {
                content: fallbackContent + '...',
                metadata: {
                    platform,
                    hashtags: [],
                    hook: content.title,
                    charCount: fallbackContent.length,
                    error: 'Generation failed, using fallback'
                }
            };
        }
    }
}

module.exports = new GeneratorAgent();
