/**
 * Deterministic Verifiers
 * Code-based verification (no LLM) for content quality gates
 * 
 * These are the first line of defense before any LLM review.
 * If verifiers fail, reflection loop is triggered.
 */

/**
 * Platform-specific character limits
 */
const PLATFORM_LIMITS = {
    twitter: { min: 50, max: 280 },
    linkedin: { min: 100, max: 3000 },
    email: { min: 200, max: 5000 },
    instagram: { min: 50, max: 2200 },
    blog: { min: 500, max: 10000 }
};

/**
 * Check content length is within platform limits
 */
function checkLength(content, platform) {
    const limits = PLATFORM_LIMITS[platform] || { min: 50, max: 5000 };
    const length = content?.length || 0;

    return {
        passed: length >= limits.min && length <= limits.max,
        actual: length,
        expected: limits,
        message: length < limits.min
            ? `Content too short: ${length} chars (min: ${limits.min})`
            : length > limits.max
                ? `Content too long: ${length} chars (max: ${limits.max})`
                : 'Length OK'
    };
}

/**
 * Check required keywords are present
 */
function checkKeywords(content, requiredKeywords = []) {
    if (requiredKeywords.length === 0) {
        return { passed: true, missing: [], message: 'No required keywords' };
    }

    const lowerContent = (content || '').toLowerCase();
    const missing = requiredKeywords.filter(kw =>
        !lowerContent.includes(kw.toLowerCase())
    );

    return {
        passed: missing.length === 0,
        missing,
        message: missing.length > 0
            ? `Missing keywords: ${missing.join(', ')}`
            : 'All keywords present'
    };
}

/**
 * Check for forbidden phrases
 */
function checkForbiddenPhrases(content, forbidden = []) {
    if (forbidden.length === 0) {
        return { passed: true, found: [], message: 'No forbidden phrases defined' };
    }

    const lowerContent = (content || '').toLowerCase();
    const found = forbidden.filter(phrase =>
        lowerContent.includes(phrase.toLowerCase())
    );

    return {
        passed: found.length === 0,
        found,
        message: found.length > 0
            ? `Found forbidden phrases: ${found.join(', ')}`
            : 'No forbidden phrases found'
    };
}

/**
 * Check if string is valid JSON
 */
function checkJSON(str) {
    try {
        JSON.parse(str);
        return { passed: true, message: 'Valid JSON' };
    } catch (error) {
        return {
            passed: false,
            message: `Invalid JSON: ${error.message}`
        };
    }
}

/**
 * Check content doesn't start with markdown code blocks (malformed LLM output)
 */
function checkNoCodeBlocks(content) {
    const hasCodeBlocks = content?.trim().startsWith('```');

    return {
        passed: !hasCodeBlocks,
        message: hasCodeBlocks
            ? 'Content starts with code block - likely malformed LLM output'
            : 'No code blocks detected'
    };
}

/**
 * Check minimum review score threshold
 */
function checkScoreThreshold(score, threshold = 80) {
    return {
        passed: score >= threshold,
        actual: score,
        threshold,
        message: score >= threshold
            ? `Score ${score}% meets ${threshold}% threshold`
            : `Score ${score}% below ${threshold}% threshold`
    };
}

/**
 * Check content has required structure for platform
 */
function checkPlatformStructure(content, platform) {
    const checks = {
        twitter: () => {
            // Twitter posts shouldn't have headers
            const hasHeaders = /^#+\s/m.test(content);
            return {
                passed: !hasHeaders,
                message: hasHeaders ? 'Twitter posts should not have headers' : 'Structure OK'
            };
        },
        linkedin: () => {
            // LinkedIn should have some structure (paragraphs or emoji bullets)
            const hasStructure = content.includes('\n\n') || /[🔹🔸•◦▪️]/m.test(content);
            return {
                passed: hasStructure,
                message: hasStructure ? 'Has paragraph structure' : 'Consider adding paragraph breaks'
            };
        },
        email: () => {
            // Email should have subject-like opening or greeting
            const hasGreeting = /^(Subject:|Dear|Hi|Hello|Hey)/mi.test(content);
            return {
                passed: hasGreeting,
                message: hasGreeting ? 'Has proper email opening' : 'Missing subject line or greeting'
            };
        },
        blog: () => {
            // Blog should have headers
            const hasHeaders = /^#+\s/m.test(content) || /<h[1-6]>/i.test(content);
            return {
                passed: hasHeaders,
                message: hasHeaders ? 'Has header structure' : 'Blog posts should have headers'
            };
        },
        instagram: () => {
            // Instagram should have emojis
            const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(content);
            return {
                passed: true, // Soft check
                message: hasEmojis ? 'Has emojis' : 'Consider adding emojis for engagement'
            };
        }
    };

    const checker = checks[platform];
    if (!checker) {
        return { passed: true, message: 'No structure check for platform' };
    }

    return checker();
}

/**
 * Run all verifiers on a variant
 * Returns aggregated result with all check details
 */
function verifyAll(variant, options = {}) {
    const {
        requiredKeywords = [],
        forbiddenPhrases = [],
        scoreThreshold = 80
    } = options;

    const content = variant.content || '';
    const platform = variant.platform || 'unknown';
    const score = variant.consistencyScore || 0;

    const results = {
        length: checkLength(content, platform),
        keywords: checkKeywords(content, requiredKeywords),
        forbidden: checkForbiddenPhrases(content, forbiddenPhrases),
        codeBlocks: checkNoCodeBlocks(content),
        score: checkScoreThreshold(score, scoreThreshold),
        structure: checkPlatformStructure(content, platform)
    };

    // Determine overall pass/fail
    // Critical failures: length, codeBlocks, score
    // Non-critical: keywords, structure (warnings only)
    const criticalPassed = results.length.passed &&
        results.codeBlocks.passed &&
        results.forbidden.passed;

    const scorePassed = results.score.passed;

    return {
        passed: criticalPassed && scorePassed,
        criticalPassed,
        scorePassed,
        results,
        summary: Object.entries(results)
            .filter(([, r]) => !r.passed)
            .map(([name, r]) => `${name}: ${r.message}`)
            .join('; ') || 'All checks passed'
    };
}

module.exports = {
    checkLength,
    checkKeywords,
    checkForbiddenPhrases,
    checkJSON,
    checkNoCodeBlocks,
    checkScoreThreshold,
    checkPlatformStructure,
    verifyAll,
    PLATFORM_LIMITS
};
