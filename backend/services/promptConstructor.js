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
 * Visual Style: Semi-abstract by default, ranging from abstract to 
 *               lightly representational based on content intent.
 * 
 * Visual Density: Medium to high. Rich, layered, intentional.
 *                 Complexity allowed when it serves the message.
 * 
 * Tone: ADAPTIVE - derived from content context (calm, energetic, 
 *       bold, reflective, serious, etc.). No single default mood.
 * 
 * Humans: ALLOWED. Faces allowed. Abstract representations, partial
 *         humans, silhouettes, blurred/stylized faces, symbolic 
 *         human presence encouraged when contextually relevant.
 * 
 * Hyperrealism: AVOID. No photo-realistic stock photo aesthetics.
 *               Prefer stylized, illustrative, painterly, conceptual.
 * 
 * Text: STRICTLY FORBIDDEN. No words, letters, numbers, typography.
 * 
 * Symbols: Allowed sparingly. Should not dominate or resemble text.
 *          Must feel intentional and rare.
 * 
 * These are guiding principles, not rigid rules. The ingestor's 
 * context understanding should heavily influence application.
 */

const { ChatGroq } = require('@langchain/groq');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');

class PromptConstructor {
    constructor() {
        this.llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5
        });

        this.promptTemplate = PromptTemplate.fromTemplate(`
You are an image prompt engineer for an AI content system. Your task is to create a detailed image generation prompt that creates CONCRETE, RECOGNIZABLE visuals that reinforce the content's message.

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

RECOGNIZABILITY OVER ABSTRACTION:
- The image MUST answer: "What is happening here?" or "What problem does this represent?"
- Show REAL situations, REAL systems, REAL roles, REAL interactions
- Use recognizable metaphors directly connected to the content
- Pure abstraction is NOT the default — only use when the content explicitly benefits from it
- Semi-abstraction preferred: stylized but LEGIBLE and interpretable at a glance

HUMAN PRESENCE:
- Humans, faces, partial figures are ENCOURAGED when they help anchor meaning
- Use stylized people, silhouettes, or symbolic human forms
- Avoid hyperrealism and stock-photo aesthetics
- Human presence should feel intentional and contextual

VISUAL CLARITY:
- Professional quality but adaptable warmth, tension, or energy based on context
- Subject must remain legible and immediately interpretable
- Complexity serves message clarity, not decoration
- Symbols allowed only when directly connected and easily interpretable

ABSOLUTE PROHIBITIONS:
- NO text, words, letters, numbers, typography whatsoever
- NO brand logos or readable symbols
- NO decorative abstraction that doesn't serve the message
- NO hyperrealistic stock photography

SUCCESS CRITERIA:
The image is successful if it REINFORCES THE MESSAGE, not just looks impressive.

YOUR TASK:
Create a detailed image prompt (3-5 sentences) that:
1. Visually represents the CONCRETE situation, problem, or concept in the content
2. Uses real, recognizable elements connected to the message
3. Incorporates human presence when contextually relevant
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
                preferredStyles: preferredStyles.join(', ') || 'semi-abstract, stylized, illustrative',
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
            'blurry', 'low quality', 'pixelated', 'jpeg artifacts'
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

        return {
            prompt: `Semi-abstract ${style.density} composition representing "${theme}". Rich layered textures with ${style.mood}. Stylized artistic interpretation with medium-high visual complexity. Painterly quality with intentional depth. Modern conceptual aesthetic.`,
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
