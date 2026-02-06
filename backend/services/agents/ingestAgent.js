/**
 * Ingest Agent
 * The Perceiver - Analyzes content and retrieves context via RAG
 * 
 * Addresses the "amnesia" problem from sources:
 * - Extracts themes and keywords for semantic understanding
 * - Queries vector DB for relevant brand/historical context
 * - Enriches input for downstream agents (Chekhov's Gun tracking)
 */

const { ChatGroq } = require('@langchain/groq');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const vectorStore = require('../vectorStore');

class IngestAgent {
    constructor() {
        this.llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.2
        });

        this.analysisPrompt = PromptTemplate.fromTemplate(`
You are the Ingest Agent - a content analyzer for the SACO system.
Analyze the following content and extract structured metadata.

CONTENT TITLE: {title}
CONTENT BODY:
{content}

Extract:
1. Main themes (3-5 key themes)
2. Keywords (5-10 SEO-relevant keywords)
3. Sentiment (positive/negative/neutral)
4. Target audience inference
5. Key messages (2-3 main takeaways)

Output as JSON:
{{
  "themes": ["theme1", "theme2"],
  "keywords": ["keyword1", "keyword2"],
  "sentiment": "positive|negative|neutral",
  "audience": "description of likely audience",
  "keyMessages": ["message1", "message2"],
  "summary": "2-3 sentence summary"
}}

Only output valid JSON.
`);

        this.chain = RunnableSequence.from([
            this.analysisPrompt,
            this.llm,
            new StringOutputParser()
        ]);
    }

    /**
     * Process content: analyze and enrich with context
     * @param {object} content - Content document
     * @param {object} brandDNA - Brand guidelines (optional)
     */
    async process(content, brandDNA = null) {
        const result = {
            themes: [],
            keywords: [],
            sentiment: 'neutral',
            context: [],
            enrichedContent: ''
        };

        try {
            // Step 1: Analyze content with LLM
            const analysisResponse = await this.chain.invoke({
                title: content.title,
                content: content.data
            });

            let analysis;
            try {
                analysis = JSON.parse(analysisResponse);
            } catch {
                // Fallback analysis
                analysis = {
                    themes: ['general'],
                    keywords: content.title.split(' ').slice(0, 5),
                    sentiment: 'neutral',
                    audience: 'general audience',
                    keyMessages: [content.title],
                    summary: content.data.substring(0, 200)
                };
            }

            result.themes = analysis.themes || [];
            result.keywords = analysis.keywords || [];
            result.sentiment = analysis.sentiment || 'neutral';
            result.audience = analysis.audience;
            result.keyMessages = analysis.keyMessages;
            result.summary = analysis.summary;

            // Step 2: Store content embedding in vector DB
            const vectorId = await vectorStore.upsert(content.data, {
                type: 'content',
                title: content.title,
                themes: result.themes.join(', '),
                userId: content.userId?.toString()
            });
            result.vectorId = vectorId;

            // Step 3: RAG - Retrieve relevant context
            // Query for similar past content and brand guidelines
            const contextQuery = `${content.title} ${result.themes.join(' ')}`;
            const contextResults = await vectorStore.query(contextQuery, 3, {
                type: { $in: ['content', 'brand'] }
            });

            result.context = contextResults.map(r => ({
                text: r.text,
                score: r.score,
                type: r.metadata?.type
            }));

            // Step 4: If brand DNA exists, retrieve and include
            if (brandDNA) {
                const brandContext = await vectorStore.query(
                    brandDNA.rawText || brandDNA.guidelines?.voice || '',
                    1
                );
                if (brandContext.length > 0) {
                    result.brandContext = brandContext[0];
                }
            }

            // Step 5: Create enriched content for downstream agents
            result.enrichedContent = `
ORIGINAL CONTENT:
${content.data}

ANALYSIS:
- Themes: ${result.themes.join(', ')}
- Sentiment: ${result.sentiment}
- Key Messages: ${result.keyMessages?.join('; ') || 'N/A'}

RETRIEVED CONTEXT:
${result.context.map(c => c.text).join('\n---\n') || 'No prior context available.'}

BRAND GUIDELINES:
${brandDNA ? brandDNA.rawText || 'Use brand voice' : 'No brand DNA defined - use professional tone.'}
`;

            return result;

        } catch (error) {
            console.error('Ingest Agent error:', error);
            // Return partial results on error
            result.error = error.message;
            result.enrichedContent = content.data;
            return result;
        }
    }
}

module.exports = new IngestAgent();
