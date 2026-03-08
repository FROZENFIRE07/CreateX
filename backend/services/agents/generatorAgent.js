/**
 * Generator Agent
 * The Transformer - Creates platform-specific content variants
 * 
 * Implements COPE (Create Once, Publish Everywhere):
 * - Adapts content to platform constraints (Twitter: 280 chars, LinkedIn: 3000)
 * - Incorporates brand DNA via RAG
 * - Grounds generation in facts to avoid hallucination
 */

const { createBedrockLLM } = require('../bedrockClient');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');

// Platform-specific constraints and guidelines
const PLATFORM_SPECS = {
    twitter: {
        maxChars: 280,
        style: 'concise, punchy, use 2-3 hashtags max',
        format: 'short text with hashtags at the end',
        template: `Create a Twitter/X post (max 280 chars):
- Hook in the first sentence
- Core message in 2-3 sentences
- End with 2-3 relevant hashtags
- Make it shareable and thought-provoking
Example: "As teams scale, talent isn't the issue, it's the process. Investing early preserves clarity and supports growth. #AIpowered #ScalingTeams"`
    },
    linkedin: {
        maxChars: 3000,
        style: 'professional thought-leadership with strategic use of emojis',
        format: 'hook + body with bullet points + call-to-action',
        template: `Create a LinkedIn post (max 3000 chars):
- Start with a powerful hook (1-2 sentences)
- Use 1-2 emojis strategically (not excessive)
- Break into digestible sections
- Include "Key takeaways:" section with bullet points (*)
- End with brand voice statement or insight
- Professional but engaging tone
Example structure:
"As teams scale, talent alone is not enough 🚀
High-performing organizations invest in process optimization early.

Key takeaways:
* Scaling exposes process weaknesses, not talent gaps
* Early investment in optimization preserves clarity
* AI-powered systems enable dynamic adaptation

We make complex AI topics accessible, inspiring action through facts, not hype."`
    },
    email: {
        maxChars: 5000,
        style: 'newsletter format with clear structure and scannable sections',
        format: 'subject line + greeting + sections with headers + closing',
        template: `Create an email newsletter (max 5000 chars):
- Start with implied subject line context
- Use clear section breaks with spacing
- Make it scannable with short paragraphs
- Include concrete insights or examples
- Professional yet conversational tone
- End with a subtle call-to-action or insight
Example structure:
"As teams scale, shortcuts stop working.

Communication breaks down, decisions slow, and ownership becomes unclear.

High-performing organizations invest in process early to preserve clarity as complexity grows.

AI-powered systems are changing how teams design, build, and operate digital products.

By embedding intelligent capabilities directly into workflows, organizations can automate routine decisions and adapt systems dynamically."`
    },
    instagram: {
        maxChars: 2200,
        style: 'visual-first caption with storytelling and emojis',
        format: 'engaging story + line break + hashtag block',
        template: `Create an Instagram caption (max 2200 chars):
- Tell a story or share an insight
- Use emojis naturally throughout
- Break into short, readable paragraphs
- Add spacing for visual appeal
- End with 8-15 relevant hashtags grouped together
- Engaging and approachable tone`
    },
    blog: {
        maxChars: 10000,
        style: 'SEO-optimized long-form with clear structure',
        format: 'intro + H2 sections + conclusion',
        template: `Create a blog post (max 10000 chars):
- Start with compelling introduction
- Use clear headers (H2: ##, H3: ###)
- Include bullet points for lists
- Provide depth and examples
- SEO-conscious language
- Professional and authoritative tone`
    }
};

class GeneratorAgent {
    constructor() {
        this.llm = createBedrockLLM({ temperature: 0.5, maxTokens: 4096 });

        // Stricter retry prompt for when initial generation fails JSON parsing
        this.retryPrompt = PromptTemplate.fromTemplate(`
You are a JSON formatting assistant. Convert the following content into valid JSON.

PLATFORM: {platform}
CONTENT TO FORMAT:
{rawContent}

Output ONLY this exact JSON structure, nothing else:
{{"content": "<the content with newlines as \\n>", "hashtags": [], "hook": "<first sentence>", "charCount": <number>}}

RULES:
- Output ONLY valid JSON, no markdown, no code blocks, no explanation
- All newlines MUST be \\n
- All quotes inside content MUST be escaped as \\"
- Keep content under {maxChars} characters
`);

        this.retryChain = RunnableSequence.from([
            this.retryPrompt,
            this.llm,
            new StringOutputParser()
        ]);

        this.generationPrompt = PromptTemplate.fromTemplate(`
You are the Generator Agent - a creative content transformer for SACO.
Transform the enriched content into a {platform}-optimized version following EXACT platform conventions.

PLATFORM: {platform}
MAX CHARACTERS: {maxChars}

PLATFORM-SPECIFIC REQUIREMENTS:
{platformTemplate}

ENRICHED CONTENT:
{enrichedContent}

BRAND DNA:
{brandDNA}

CRITICAL INSTRUCTIONS:
1. Follow the platform template structure EXACTLY as shown in the example
2. For LinkedIn: Include "Key takeaways:" section with bullet points (*)
3. For Email: Use clear paragraph breaks with spacing between sections
4. For Twitter: Keep under 280 chars with hashtags at the end
5. Adapt the CORE MESSAGE while preserving facts - NO hallucination
6. Match the example formatting style precisely
7. Incorporate brand voice naturally

OUTPUT REQUIREMENTS:
- Stay under {maxChars} characters
- Follow platform conventions shown in template
- Use proper line breaks (\\n) for structure
- For multi-paragraph content, separate with \\n\\n

CRITICAL JSON RULES:
- Output ONLY valid JSON, no markdown, no code blocks
- All newlines in content MUST be escaped as \\n
- All quotes in content MUST be escaped as \\"
- Content must be a SINGLE LINE string with escape sequences

Output format:
{{"content": "line1\\nline2\\nline3", "hashtags": ["tag1"], "hook": "first line", "charCount": 123}}
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
     * @param {string} reflectionHint - Optional hint from reflector for retry attempts
     */
    async generate(content, platform, ingestResult, brandDNA = null, reflectionHint = null) {
        const specs = PLATFORM_SPECS[platform] || PLATFORM_SPECS.blog;

        try {
            // Build brand text with reflection hint if retrying
            let brandText = brandDNA?.rawText || 'No brand DNA - use professional, engaging tone.';
            if (reflectionHint) {
                brandText += `\n\nIMPORTANT: Previous attempt failed. ${reflectionHint}`;
            }

            const response = await this.chain.invoke({
                platform,
                maxChars: specs.maxChars,
                platformTemplate: specs.template,
                enrichedContent: ingestResult.enrichedContent || content.data,
                brandDNA: brandText
            });

            let result = this._parseJsonResponse(response);

            // If initial parse failed, retry with a stricter formatting prompt
            if (!result) {
                console.warn('[Generator] Initial JSON parse failed for', platform, '- attempting retry');
                console.warn('[Generator] Raw response (first 300 chars):', response.substring(0, 300));

                // Extract raw content from the broken response for the retry
                const rawContent = this._extractRawContent(response);

                try {
                    const retryResponse = await this.retryChain.invoke({
                        platform,
                        rawContent: rawContent.substring(0, specs.maxChars),
                        maxChars: specs.maxChars
                    });
                    result = this._parseJsonResponse(retryResponse);
                    if (result) {
                        console.log('[Generator] ✅ Retry succeeded for', platform);
                    }
                } catch (retryErr) {
                    console.warn('[Generator] Retry also failed for', platform, retryErr.message);
                }

                // Final fallback: use extracted content directly
                if (!result) {
                    console.warn('[Generator] Using fallback content extraction for', platform);
                    const fallback = rawContent.substring(0, specs.maxChars);
                    result = {
                        content: fallback,
                        hashtags: [],
                        hook: fallback.substring(0, 50),
                        charCount: fallback.length
                    };
                }
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
                },
                // Trace: captures what this agent received, decided, and passed on
                trace: {
                    agent: 'generator',
                    received: {
                        platform,
                        platformSpecs: specs,
                        enrichedContentLength: (ingestResult.enrichedContent || content.data).length,
                        themesFromIngest: ingestResult.themes,
                        hasBrandDNA: !!brandDNA
                    },
                    decided: {
                        targetMaxChars: specs.maxChars,
                        styleApplied: specs.style,
                        formatUsed: specs.format,
                        finalCharCount: result.content.length,
                        wasTruncated: result.truncated || false,
                        hashtagsGenerated: result.hashtags?.length || 0
                    },
                    passedOn: {
                        contentPreview: result.content.substring(0, 150) + (result.content.length > 150 ? '...' : ''),
                        hook: result.hook,
                        charCount: result.charCount || result.content.length
                    }
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
                },
                trace: {
                    agent: 'generator',
                    received: { platform, enrichedContentLength: (ingestResult.enrichedContent || content.data).length },
                    decided: { usedFallback: true, error: error.message },
                    passedOn: { contentPreview: fallbackContent.substring(0, 100), charCount: fallbackContent.length }
                }
            };
        }
    }

    /**
     * Attempt to parse a JSON response from the LLM, with cleanup for common issues.
     * Returns the parsed object or null if parsing fails.
     */
    _parseJsonResponse(response) {
        try {
            let clean = response.trim();

            // Strip markdown code blocks
            if (clean.startsWith('```')) {
                clean = clean
                    .replace(/^```(?:json)?[\r\n]*/i, '')
                    .replace(/[\r\n]*```$/g, '')
                    .trim();
            }

            return JSON.parse(clean);
        } catch {
            // Try to repair truncated JSON (e.g. missing closing quote/braces)
            try {
                let clean = response.trim();
                if (clean.startsWith('```')) {
                    clean = clean
                        .replace(/^```(?:json)?[\r\n]*/i, '')
                        .replace(/[\r\n]*```$/g, '')
                        .trim();
                }

                // If JSON is truncated mid-string, close it
                if (clean.startsWith('{') && !clean.endsWith('}')) {
                    // Find last complete key-value pair
                    const contentMatch = clean.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)/);
                    if (contentMatch) {
                        const extractedContent = contentMatch[1];
                        return {
                            content: extractedContent,
                            hashtags: [],
                            hook: extractedContent.substring(0, 50),
                            charCount: extractedContent.length
                        };
                    }
                }
            } catch {
                // Repair also failed
            }
            return null;
        }
    }

    /**
     * Extract usable raw text content from a broken/truncated LLM response.
     */
    _extractRawContent(response) {
        // Try to pull the content field value
        const contentMatch = response.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)/);
        if (contentMatch && contentMatch[1].length > 20) {
            // Unescape the JSON string escapes
            return contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }

        // Strip JSON wrapper and code blocks, use raw text
        let text = response
            .replace(/^```(?:json)?[\r\n]*/gi, '')
            .replace(/[\r\n]*```$/g, '')
            .replace(/^\s*\{[\s\S]*?"content"\s*:\s*"/i, '')
            .replace(/"[\s\S]*$/i, '')
            .trim();

        return text.length > 20 ? text : 'Content generation in progress.';
    }
}

module.exports = new GeneratorAgent();
