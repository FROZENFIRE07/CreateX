/**
 * Graph Memory - Neo4j Integration
 * Identity graph for brand DNA, beliefs, stances, and past work
 * 
 * Only the Manager Agent accesses this directly.
 * Workers receive curated context, never query directly.
 */

const neo4j = require('neo4j-driver');

let driver = null;

/**
 * Initialize Neo4j connection
 */
async function connect() {
    if (driver) return driver;

    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD;

    if (!uri || !password) {
        console.warn('[GraphMemory] Neo4j credentials not configured. Graph memory disabled.');
        return null;
    }

    try {
        driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
        await driver.verifyConnectivity();
        console.log('[GraphMemory] Connected to Neo4j');
        return driver;
    } catch (error) {
        console.error('[GraphMemory] Connection failed:', error.message);
        return null;
    }
}

/**
 * Close Neo4j connection
 */
async function disconnect() {
    if (driver) {
        await driver.close();
        driver = null;
    }
}

/**
 * Query brand identity from graph
 * Returns beliefs, stances, tone descriptors, and past successful content
 */
async function queryBrandIdentity(brandName) {
    if (!driver) {
        await connect();
        if (!driver) return null;
    }

    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (b:Brand {name: $brandName})
            OPTIONAL MATCH (b)-[:HAS_BELIEF]->(belief:Belief)
            OPTIONAL MATCH (b)-[:HAS_STANCE]->(stance:Stance)
            OPTIONAL MATCH (b)-[:HAS_TONE]->(tone:Tone)
            OPTIONAL MATCH (b)-[:AUTHORED]->(work:PastWork)
            RETURN b, 
                   collect(DISTINCT belief.text) as beliefs,
                   collect(DISTINCT stance.text) as stances,
                   collect(DISTINCT tone.descriptor) as tones,
                   collect(DISTINCT work{.title, .platform, .score})[0..5] as pastWorks
        `, { brandName });

        if (result.records.length === 0) {
            return null;
        }

        const record = result.records[0];
        return {
            brand: record.get('b')?.properties || { name: brandName },
            beliefs: record.get('beliefs') || [],
            stances: record.get('stances') || [],
            tones: record.get('tones') || [],
            pastWorks: record.get('pastWorks') || []
        };
    } finally {
        await session.close();
    }
}

/**
 * Query past work by topic for RAG-style context
 */
async function queryPastWorkByTopic(topic, limit = 5) {
    if (!driver) {
        await connect();
        if (!driver) return [];
    }

    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (w:PastWork)-[:ABOUT]->(t:Topic)
            WHERE t.name CONTAINS $topic OR w.content CONTAINS $topic
            RETURN w{.title, .platform, .content, .score}
            ORDER BY w.score DESC
            LIMIT $limit
        `, { topic, limit: neo4j.int(limit) });

        return result.records.map(r => r.get('w'));
    } finally {
        await session.close();
    }
}

/**
 * Check for contradictions between draft and brand beliefs
 */
async function checkCoherence(brandName, draftContent) {
    if (!driver) {
        await connect();
        if (!driver) return { coherent: true, issues: [] };
    }

    const session = driver.session();
    try {
        // Get forbidden phrases and contradictory stances
        const result = await session.run(`
            MATCH (b:Brand {name: $brandName})
            OPTIONAL MATCH (b)-[:AVOIDS]->(avoid:ForbiddenPhrase)
            OPTIONAL MATCH (b)-[:OPPOSES]->(oppose:Stance)
            RETURN collect(DISTINCT avoid.phrase) as forbidden,
                   collect(DISTINCT oppose.text) as opposedStances
        `, { brandName });

        const record = result.records[0];
        const forbidden = record?.get('forbidden') || [];
        const opposedStances = record?.get('opposedStances') || [];

        const issues = [];
        const lowerContent = draftContent.toLowerCase();

        // Check for forbidden phrases
        for (const phrase of forbidden) {
            if (lowerContent.includes(phrase.toLowerCase())) {
                issues.push(`Contains forbidden phrase: "${phrase}"`);
            }
        }

        // Simple keyword check for opposed stances
        for (const stance of opposedStances) {
            const keywords = stance.toLowerCase().split(' ').filter(w => w.length > 4);
            if (keywords.some(kw => lowerContent.includes(kw))) {
                issues.push(`May conflict with brand stance: "${stance}"`);
            }
        }

        return {
            coherent: issues.length === 0,
            issues
        };
    } finally {
        await session.close();
    }
}

/**
 * Upsert a brand node with properties
 */
async function upsertBrand(brandName, properties = {}) {
    if (!driver) {
        await connect();
        if (!driver) return null;
    }

    const session = driver.session();
    try {
        const result = await session.run(`
            MERGE (b:Brand {name: $brandName})
            SET b += $properties
            RETURN b
        `, { brandName, properties });

        return result.records[0]?.get('b')?.properties;
    } finally {
        await session.close();
    }
}

/**
 * Add a belief to a brand
 */
async function addBelief(brandName, beliefText) {
    if (!driver) {
        await connect();
        if (!driver) return null;
    }

    const session = driver.session();
    try {
        await session.run(`
            MERGE (b:Brand {name: $brandName})
            MERGE (belief:Belief {text: $beliefText})
            MERGE (b)-[:HAS_BELIEF]->(belief)
        `, { brandName, beliefText });
        return true;
    } finally {
        await session.close();
    }
}

/**
 * Record past work for future context
 */
async function recordPastWork(brandName, work) {
    if (!driver) {
        await connect();
        if (!driver) return null;
    }

    const session = driver.session();
    try {
        await session.run(`
            MERGE (b:Brand {name: $brandName})
            CREATE (w:PastWork {
                title: $title,
                platform: $platform,
                content: $content,
                score: $score,
                createdAt: datetime()
            })
            MERGE (b)-[:AUTHORED]->(w)
            WITH w
            UNWIND $topics as topicName
            MERGE (t:Topic {name: topicName})
            MERGE (w)-[:ABOUT]->(t)
        `, {
            brandName,
            title: work.title,
            platform: work.platform,
            content: work.content?.substring(0, 500) || '',
            score: work.score || 0,
            topics: work.topics || []
        });
        return true;
    } finally {
        await session.close();
    }
}

/**
 * Seed initial brand DNA from MongoDB document
 */
async function seedFromBrandDNA(brandDNA) {
    if (!brandDNA || !driver) return;

    const brandName = brandDNA.companyName || 'Unknown Brand';

    await upsertBrand(brandName, {
        industry: brandDNA.industry,
        description: brandDNA.description
    });

    // Add beliefs from DNA
    if (brandDNA.beliefs?.length > 0) {
        for (const belief of brandDNA.beliefs) {
            await addBelief(brandName, belief);
        }
    }

    // Add tone descriptors
    if (brandDNA.guidelines?.voice) {
        const session = driver.session();
        try {
            await session.run(`
                MERGE (b:Brand {name: $brandName})
                MERGE (t:Tone {descriptor: $voice})
                MERGE (b)-[:HAS_TONE]->(t)
            `, { brandName, voice: brandDNA.guidelines.voice });
        } finally {
            await session.close();
        }
    }

    console.log(`[GraphMemory] Seeded brand: ${brandName}`);
}

module.exports = {
    connect,
    disconnect,
    queryBrandIdentity,
    queryPastWorkByTopic,
    checkCoherence,
    upsertBrand,
    addBelief,
    recordPastWork,
    seedFromBrandDNA
};
