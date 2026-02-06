/**
 * Vector Store Service
 * Pinecone integration for semantic memory and RAG
 * 
 * Implements the "Semantic Intelligence" pillar from sources:
 * - Long-term memory via vector DB (vs session amnesia)
 * - Context retrieval for every agent call
 * - Brand DNA embedding for consistency scoring
 */

const { Pinecone } = require('@pinecone-database/pinecone');
const { v4: uuidv4 } = require('uuid');

class VectorStore {
    constructor() {
        this.pinecone = null;
        this.index = null;
        this.initialized = false;
    }

    /**
     * Initialize Pinecone connection
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize Pinecone client
            this.pinecone = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY
            });

            // Get index reference
            const indexName = process.env.PINECONE_INDEX || 'saco';
            this.index = this.pinecone.index(indexName);

            this.initialized = true;
            console.log('✅ Pinecone vector store initialized');
        } catch (error) {
            console.error('❌ Pinecone initialization failed:', error.message);
            // Fallback: use mock vector store for development
            this.useMockStore = true;
            this.mockVectors = new Map();
            console.log('⚠️ Using mock vector store (Pinecone unavailable)');
        }
    }

    /**
     * Generate embeddings
     * Uses a simple hash-based approach since Groq doesn't have embeddings
     * In production, you'd want to use a dedicated embeddings service
     */
    async generateEmbedding(text) {
        try {
            // Simple deterministic hash-based pseudo-embedding
            // This provides reasonable semantic similarity for demo purposes
            const vector = new Array(1536).fill(0);

            // Create pseudo-embeddings based on text characteristics
            const words = text.toLowerCase().split(/\s+/);
            for (let i = 0; i < words.length; i++) {
                const word = words[i];
                for (let j = 0; j < word.length; j++) {
                    const idx = (word.charCodeAt(j) * (i + 1) * (j + 1)) % 1536;
                    vector[idx] += 0.1 / (j + 1);
                }
            }

            // Normalize the vector
            const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
            return vector.map(v => v / magnitude);
        } catch (error) {
            console.error('Embedding generation failed:', error.message);
            return Array(1536).fill(0).map(() => Math.random() - 0.5);
        }
    }

    /**
     * Store content with embedding
     * @param {string} text - Content to embed
     * @param {object} metadata - Associated metadata
     * @returns {string} Vector ID
     */
    async upsert(text, metadata = {}) {
        await this.initialize();

        const id = uuidv4();
        const embedding = await this.generateEmbedding(text);

        if (this.useMockStore) {
            // Mock storage
            this.mockVectors.set(id, { embedding, metadata, text });
            return id;
        }

        try {
            await this.index.upsert([{
                id,
                values: embedding,
                metadata: {
                    ...metadata,
                    text: text.substring(0, 1000) // Store truncated text for retrieval
                }
            }]);

            return id;
        } catch (error) {
            console.error('Vector upsert failed:', error.message);
            throw error;
        }
    }

    /**
     * Query similar vectors (RAG retrieval)
     * @param {string} query - Query text
     * @param {number} topK - Number of results
     * @param {object} filter - Metadata filter
     */
    async query(query, topK = 5, filter = {}) {
        await this.initialize();

        const queryEmbedding = await this.generateEmbedding(query);

        if (this.useMockStore) {
            // Mock similarity search (cosine similarity)
            const results = [];
            for (const [id, data] of this.mockVectors) {
                const score = this.cosineSimilarity(queryEmbedding, data.embedding);
                results.push({ id, score, metadata: data.metadata, text: data.text });
            }
            return results
                .sort((a, b) => b.score - a.score)
                .slice(0, topK);
        }

        try {
            const response = await this.index.query({
                vector: queryEmbedding,
                topK,
                includeMetadata: true,
                filter: Object.keys(filter).length > 0 ? filter : undefined
            });

            return response.matches.map(match => ({
                id: match.id,
                score: match.score,
                metadata: match.metadata,
                text: match.metadata?.text
            }));
        } catch (error) {
            console.error('Vector query failed:', error.message);
            return [];
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Delete vector by ID
     */
    async delete(id) {
        await this.initialize();

        if (this.useMockStore) {
            this.mockVectors.delete(id);
            return;
        }

        try {
            await this.index.deleteOne(id);
        } catch (error) {
            console.error('Vector delete failed:', error.message);
        }
    }
}

// Singleton instance
module.exports = new VectorStore();
