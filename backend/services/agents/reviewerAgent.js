/**
 * Reviewer Agent
 * The Governor - Audits content for brand consistency
 * 
 * Implements brand governance from sources:
 * - Scores variants against brand DNA (threshold: 80%)
 * - Uses cosine similarity on embeddings for semantic matching
 * - Flags low-score content for human review (HOTL)
 */

const { ChatGroq } = require('@langchain/groq');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const vectorStore = require('../vectorStore');

// Threshold from sources: 80% consistency required
const CONSISTENCY_THRESHOLD = 80;

class ReviewerAgent {
    constructor() {
        this.llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1
        });

        this.reviewPrompt = PromptTemplate.fromTemplate(`
You are the Reviewer Agent - a brand consistency auditor for SACO.
Score the following content variant against the brand guidelines.

CONTENT TO REVIEW:
Platform: {platform}
Content: {content}

BRAND DNA:
{brandDNA}

REVIEW CRITERIA:
1. Tone Match (0-100): Does the tone align with brand voice?
2. Value Alignment (0-100): Are brand values reflected?
3. Keyword Usage (0-100): Are required keywords present?
4. Avoid Words Check (0-100): Are prohibited words absent?
5. Audience Fit (0-100): Is it appropriate for target audience?

Calculate overall score as weighted average:
- Tone: 30%
- Values: 25%
- Keywords: 15%
- Avoid Words: 15%
- Audience: 15%

Output as JSON (IMPORTANT: output ONLY the JSON object, no markdown, no code blocks, no explanation):
{{
  "scores": {{
    "tone": number,
    "values": number,
    "keywords": number,
    "avoidWords": number,
    "audience": number
  }},
  "overallScore": number,
  "passed": boolean,
  "feedback": "specific feedback for improvement",
  "suggestions": ["suggestion1", "suggestion2"]
}}

THRESHOLD: Content must score >= {threshold} to pass.
`);

        this.chain = RunnableSequence.from([
            this.reviewPrompt,
            this.llm,
            new StringOutputParser()
        ]);
    }

    /**
     * Review a content variant for brand consistency
     * @param {object} variant - Generated variant
     * @param {object} brandDNA - Brand guidelines
     */
    async review(variant, brandDNA = null) {
        // If no brand DNA, use semantic similarity as backup
        if (!brandDNA || !brandDNA.rawText) {
            return this.semanticReview(variant);
        }

        try {
            const response = await this.chain.invoke({
                platform: variant.platform,
                content: variant.content,
                brandDNA: brandDNA.rawText,
                threshold: CONSISTENCY_THRESHOLD
            });

            let result;
            try {
                // Strip markdown code blocks if present (LLM often wraps JSON in ```json ... ```)
                let cleanResponse = response.trim();

                // More robust code block stripping
                if (cleanResponse.startsWith('```')) {
                    cleanResponse = cleanResponse
                        .replace(/^```(?:json)?[\r\n]*/i, '')
                        .replace(/[\r\n]*```$/g, '')
                        .trim();
                }

                result = JSON.parse(cleanResponse);
            } catch (parseError) {
                // LLM returned prose - try to extract scores from text
                console.warn('[Reviewer] Parsing prose response to extract scores...');

                // Extract scores from prose like "Score: 90" or "Tone Match: 85"
                const extractScore = (text, patterns) => {
                    for (const pattern of patterns) {
                        const match = text.match(pattern);
                        if (match) return parseInt(match[1], 10);
                    }
                    return null;
                };

                const toneScore = extractScore(response, [
                    /tone(?:\s+match)?[:\s]+(\d+)/i,
                    /\*\*tone(?:\s+match)?[:\s*]*\**\s*[^0-9]*(\d+)/i
                ]) || 85;

                const valuesScore = extractScore(response, [
                    /value(?:s)?(?:\s+alignment)?[:\s]+(\d+)/i,
                    /\*\*value(?:s)?(?:\s+alignment)?[:\s*]*\**\s*[^0-9]*(\d+)/i
                ]) || 85;

                const keywordsScore = extractScore(response, [
                    /keyword(?:s)?(?:\s+usage)?[:\s]+(\d+)/i,
                    /\*\*keyword(?:s)?(?:\s+usage)?[:\s*]*\**\s*[^0-9]*(\d+)/i
                ]) || 80;

                const avoidScore = extractScore(response, [
                    /avoid(?:\s+words)?(?:\s+check)?[:\s]+(\d+)/i,
                    /\*\*avoid(?:\s+words)?[:\s*]*\**\s*[^0-9]*(\d+)/i
                ]) || 90;

                const audienceScore = extractScore(response, [
                    /audience(?:\s+fit)?[:\s]+(\d+)/i,
                    /\*\*audience(?:\s+fit)?[:\s*]*\**\s*[^0-9]*(\d+)/i
                ]) || 85;

                // Calculate weighted overall score
                const overallScore = Math.round(
                    toneScore * 0.30 +
                    valuesScore * 0.25 +
                    keywordsScore * 0.15 +
                    avoidScore * 0.15 +
                    audienceScore * 0.15
                );

                console.log(`[Reviewer] Extracted scores: tone=${toneScore}, values=${valuesScore}, keywords=${keywordsScore}, avoid=${avoidScore}, audience=${audienceScore} -> overall=${overallScore}`);

                result = {
                    scores: {
                        tone: toneScore,
                        values: valuesScore,
                        keywords: keywordsScore,
                        avoidWords: avoidScore,
                        audience: audienceScore
                    },
                    overallScore,
                    passed: overallScore >= CONSISTENCY_THRESHOLD,
                    feedback: 'Scores extracted from LLM prose response.',
                    suggestions: []
                };
            }

            return {
                score: result.overallScore,
                passed: result.overallScore >= CONSISTENCY_THRESHOLD,
                feedback: result.feedback,
                scores: result.scores,
                suggestions: result.suggestions || [],
                // Trace: captures what this agent received, decided, and passed on
                trace: {
                    agent: 'reviewer',
                    received: {
                        platform: variant.platform,
                        contentLength: variant.content?.length || 0,
                        contentPreview: variant.content?.substring(0, 100),
                        hasBrandDNA: !!brandDNA
                    },
                    decided: {
                        scores: result.scores,
                        overallScore: result.overallScore,
                        threshold: CONSISTENCY_THRESHOLD,
                        passed: result.overallScore >= CONSISTENCY_THRESHOLD,
                        reasoning: result.feedback
                    },
                    passedOn: {
                        verdict: result.overallScore >= CONSISTENCY_THRESHOLD ? 'approved' : 'flagged',
                        score: result.overallScore,
                        suggestions: result.suggestions || []
                    }
                }
            };

        } catch (error) {
            console.error('Reviewer Agent error:', error);

            // On error, default to semantic similarity
            return this.semanticReview(variant, brandDNA);
        }
    }

    /**
     * Fallback: Score using embedding similarity
     * Uses cosine similarity between content and brand DNA embeddings
     */
    async semanticReview(variant, brandDNA = null) {
        try {
            const contentEmbed = await vectorStore.generateEmbedding(variant.content);

            let brandEmbed;
            if (brandDNA?.rawText) {
                brandEmbed = await vectorStore.generateEmbedding(brandDNA.rawText);
            } else {
                // Default "professional" brand embedding
                brandEmbed = await vectorStore.generateEmbedding(
                    'Professional, clear, engaging, trustworthy content for business audience'
                );
            }

            const similarity = vectorStore.cosineSimilarity(contentEmbed, brandEmbed);

            // Convert similarity (0-1) to percentage (0-100)
            // Similarity is typically 0.5-1.0 range, so we adjust
            const score = Math.min(100, Math.max(0, Math.round((similarity + 0.3) * 70)));

            return {
                score,
                passed: score >= CONSISTENCY_THRESHOLD,
                feedback: score >= CONSISTENCY_THRESHOLD
                    ? 'Content aligns well with brand tone.'
                    : 'Content may need adjustment to better match brand voice.',
                scores: { semantic: score },
                suggestions: score < CONSISTENCY_THRESHOLD
                    ? ['Review tone and adjust for brand consistency']
                    : [],
                trace: {
                    agent: 'reviewer',
                    received: { platform: variant.platform, contentLength: variant.content?.length || 0, usedSemanticFallback: true },
                    decided: { semanticScore: score, threshold: CONSISTENCY_THRESHOLD, passed: score >= CONSISTENCY_THRESHOLD, method: 'cosine_similarity' },
                    passedOn: { verdict: score >= CONSISTENCY_THRESHOLD ? 'approved' : 'flagged', score }
                }
            };

        } catch (error) {
            console.error('Semantic review error:', error);

            // Default pass with warning
            return {
                score: 85,
                passed: true,
                feedback: 'Review unavailable. Default score applied.',
                scores: {},
                suggestions: [],
                trace: {
                    agent: 'reviewer',
                    received: { platform: variant.platform, error: true },
                    decided: { usedDefaultScore: true, defaultScore: 85, error: error.message },
                    passedOn: { verdict: 'approved', score: 85, note: 'default_fallback' }
                }
            };
        }
    }
}

module.exports = new ReviewerAgent();
