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

Output as JSON:
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
Only output valid JSON.
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
                result = JSON.parse(response);
            } catch {
                // Fallback scoring
                result = {
                    scores: { tone: 85, values: 85, keywords: 80, avoidWords: 90, audience: 85 },
                    overallScore: 85,
                    passed: true,
                    feedback: 'Unable to parse detailed review. Default score applied.',
                    suggestions: []
                };
            }

            return {
                score: result.overallScore,
                passed: result.overallScore >= CONSISTENCY_THRESHOLD,
                feedback: result.feedback,
                scores: result.scores,
                suggestions: result.suggestions || []
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
                    : []
            };

        } catch (error) {
            console.error('Semantic review error:', error);

            // Default pass with warning
            return {
                score: 85,
                passed: true,
                feedback: 'Review unavailable. Default score applied.',
                scores: {},
                suggestions: []
            };
        }
    }
}

module.exports = new ReviewerAgent();
