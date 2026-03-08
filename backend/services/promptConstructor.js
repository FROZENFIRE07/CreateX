/**
 * Prompt Constructor Service
 * 
 * Derives image prompts from content context using LLM.
 * 
 * Core Principles:
 * - Prompts are derived from ingestor context, never handwritten
 * - All prompts logged verbatim for traceability
 * - Style is adaptive to content, not rigidly fixed
 * 
 * === UPDATED STYLE GUARDRAILS (Decision Layer) ===
 * 
 * Visual Style: Conceptual tech illustration by default. Clean, recognizable
 *               scenes suitable for blog covers and social media posts.
 * 
 * Visual Density: Medium. Clean and professional with purposeful detail.
 *                 Clarity over complexity.
 * 
 * Tone: ADAPTIVE - derived from content context (calm, energetic, 
 *       bold, reflective, serious, etc.). No single default mood.
 * 
 * Humans: ENCOURAGED. Stylized people interacting with technology,
 *         collaborating in workspaces, using devices. Avoid hyperrealism.
 * 
 * Hyperrealism: AVOID. No photo-realistic stock photo aesthetics.
 *               Prefer clean digital illustration, conceptual tech art.
 * 
 * Text: STRICTLY FORBIDDEN. No words, letters, numbers, typography.
 * 
 * Symbols: Allowed sparingly. Should not dominate or resemble text.
 *          Must feel intentional and rare.
 * 
 * These are guiding principles, not rigid rules. The ingestor's 
 * context understanding should heavily influence application.
 */

const { createBedrockLLM } = require('./bedrockClient');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');

class PromptConstructor {
    constructor() {
        this.llm = createBedrockLLM({ temperature: 0.5 });

        this.promptTemplate = PromptTemplate.fromTemplate(`
You are an image prompt engineer for an AI content system. Your task is to create a detailed image generation prompt that produces CLEAR, RECOGNIZABLE conceptual illustrations suitable for blog covers and social media posts.

CONTENT CONTEXT:
Title: {title}
Themes: {themes}
Sentiment: {sentiment}
Emotional Tone: {emotionalTone}
Key Message: {keyMessage}

BRAND VISUAL STYLE (if available):
Colors: {brandColors}
Preferred Styles: {preferredStyles}
Mood Keywords: {moodKeywords}

=== CRITICAL VISUAL PRINCIPLES ===

CLEAR RECOGNIZABLE SCENES:
- The image MUST depict a clear, recognizable scene that a viewer instantly understands
- Show REAL situations: people working, collaborating, using technology, solving problems
- Every image should look like a modern tech blog cover or LinkedIn post visual
- The viewer should immediately know what topic the content is about

PREFERRED VISUAL ELEMENTS:
- People interacting with technology (laptops, phones, dashboards)
- Modern digital workspaces and collaborative environments
- UI screens, digital dashboards, data visualizations as background elements
- Devices like laptops, tablets, and phones in context
- Modern tech environments (offices, co-working spaces, digital landscapes)

PREFERRED STYLE:
- Conceptual tech illustration (like startup marketing visuals)
- Clean digital illustration with flat or semi-flat design
- Stylized but recognizable scenes — not abstract art
- Modern, professional, and visually clean
- Similar to illustrations on tech company websites and SaaS landing pages

HUMAN PRESENCE:
- Stylized people are STRONGLY ENCOURAGED in most images
- Show them working, collaborating, presenting, brainstorming
- Avoid hyperrealism — use clean illustrated style
- Human presence anchors the scene and makes it relatable

ABSOLUTE PROHIBITIONS:
- NO text, words, letters, numbers, typography whatsoever
- NO brand logos or readable symbols
- NO abstract art, random gradients, or symbolic shapes
- NO surreal or dreamlike imagery
- NO purely aesthetic visuals without a clear scene
- NO hyperrealistic stock photography

SUCCESS CRITERIA:
The image should look like it belongs on a modern tech blog, startup website, or professional LinkedIn post. It must clearly represent the content topic.

YOUR TASK:
Create a detailed image prompt (3-5 sentences) that:
1. Depicts a CLEAR, RECOGNIZABLE scene related to the content topic
2. Includes people interacting with technology when relevant
3. Uses clean digital illustration / conceptual tech art style
4. Matches emotional tone: {emotionalTone}
5. Uses brand colors if provided: {brandColors}
6. Is optimized for Stability AI Ultra / SDXL

Output ONLY the prompt text. No explanations, no formatting, no quotes.
`);

        this.chain = RunnableSequence.from([
            this.promptTemplate,
            this.llm,
            new StringOutputParser()
        ]);
    }

    /**
     * Construct image prompt from content context
     * @param {object} context - Enriched content context from ingestor
     * @returns {object} { prompt, negativePrompt, derivedFrom }
     */
    async construct(context) {
        const {
            title = 'Untitled',
            themes = [],
            sentiment = 'neutral',
            emotionalTone = '',
            keyMessage = '',
            brandColors = [],
            preferredStyles = [],
            moodKeywords = []
        } = context;

        // Derive emotional tone from sentiment if not provided
        const derivedTone = emotionalTone || this.deriveEmotionalTone(sentiment, themes);

        console.log('[PromptConstructor] Deriving prompt from context...');
        console.log(`[PromptConstructor] Title: "${title}"`);
        console.log(`[PromptConstructor] Sentiment: ${sentiment}, Tone: ${derivedTone}`);
        console.log(`[PromptConstructor] Themes: ${themes.slice(0, 3).join(', ')}`);

        try {
            const prompt = await this.chain.invoke({
                title,
                themes: themes.join(', ') || 'general creative content',
                sentiment,
                emotionalTone: derivedTone,
                keyMessage: keyMessage.substring(0, 300) || 'Express the core concept visually',
                brandColors: brandColors.join(', ') || 'contextually appropriate colors',
                preferredStyles: preferredStyles.join(', ') || 'conceptual tech illustration, modern marketing illustration, clean digital illustration',
                moodKeywords: moodKeywords.join(', ') || derivedTone
            });

            const cleanPrompt = prompt.trim().replace(/^["']|["']$/g, '');

            console.log(`[PromptConstructor] ✅ Derived prompt: "${cleanPrompt.substring(0, 120)}..."`);

            return {
                prompt: cleanPrompt,
                negativePrompt: this.getAdaptiveNegativePrompt(sentiment),
                derivedFrom: {
                    title,
                    themes: themes.slice(0, 3),
                    sentiment,
                    emotionalTone: derivedTone
                }
            };

        } catch (error) {
            console.error('[PromptConstructor] LLM failed, using fallback:', error.message);
            return this.getFallbackPrompt(context);
        }
    }

    /**
     * Derive emotional tone from sentiment and themes
     */
    deriveEmotionalTone(sentiment, themes) {
        const toneMap = {
            positive: ['optimistic', 'uplifting', 'warm', 'vibrant', 'hopeful'],
            negative: ['contemplative', 'intense', 'dramatic', 'moody', 'serious'],
            neutral: ['balanced', 'thoughtful', 'professional', 'measured', 'clear']
        };

        const base = toneMap[sentiment] || toneMap.neutral;

        // Add contextual tones based on themes
        const themeText = themes.join(' ').toLowerCase();
        const extras = [];

        if (themeText.includes('innovation') || themeText.includes('tech')) extras.push('forward-looking');
        if (themeText.includes('growth') || themeText.includes('success')) extras.push('dynamic');
        if (themeText.includes('challenge') || themeText.includes('problem')) extras.push('determined');
        if (themeText.includes('community') || themeText.includes('team')) extras.push('connected');

        return [...base.slice(0, 2), ...extras.slice(0, 2)].join(', ');
    }

    /**
     * Adaptive negative prompt (maintains core prohibitions while allowing style flexibility)
     */
    getAdaptiveNegativePrompt(sentiment) {
        // Core prohibitions that always apply
        const core = [
            'text', 'words', 'letters', 'typography', 'numbers', 'writing', 'font',
            'logo', 'brand name', 'watermark', 'signature', 'copyright',
            'photorealistic', 'stock photo', 'hyperrealistic', 'photograph',
            'blurry', 'low quality', 'pixelated', 'jpeg artifacts',
            'abstract art', 'surreal', 'dreamlike', 'random gradients', 'paint splatter'
        ];

        // Note: We explicitly do NOT add 'human', 'face', 'person' anymore
        // as these are now allowed when stylized

        return core.join(', ');
    }

    /**
     * Fallback prompt when LLM fails
     */
    getFallbackPrompt(context) {
        const { sentiment = 'neutral', themes = [], title = '' } = context;

        const intensityMap = {
            positive: { density: 'vibrant, energetic', mood: 'warm golden and bright colors' },
            negative: { density: 'deep, layered', mood: 'cool blues and moody shadows' },
            neutral: { density: 'balanced, refined', mood: 'sophisticated neutral tones' }
        };

        const style = intensityMap[sentiment] || intensityMap.neutral;
        const theme = themes[0] || 'conceptual idea';
        const coreIdea = title || theme;

        return {
            prompt: `A clean conceptual illustration showing ${coreIdea} in a modern digital environment. Stylized people interacting with technology, laptops, and digital dashboards. Startup marketing illustration style with ${style.mood}. Minimal clutter, professional social media visual with ${style.density} energy. Clean digital illustration suitable for a tech blog cover.`,
            negativePrompt: this.getAdaptiveNegativePrompt(sentiment),
            derivedFrom: {
                fallback: true,
                theme,
                sentiment
            }
        };
    }
}

module.exports = new PromptConstructor();
