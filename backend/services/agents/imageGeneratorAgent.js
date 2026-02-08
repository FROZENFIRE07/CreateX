/**
 * Image Generator Agent - Lean Implementation
 * 
 * Design Principles:
 * - Single responsibility: generate images, nothing else
 * - Optional and side-effect safe
 * - Failure is acceptable, silent failure is not
 * - Records everything for traceability
 * 
 * This agent does NOT:
 * - Score or judge image quality
 * - Retry beyond the fallback chain
 * - Block the text pipeline
 */

const promptConstructor = require('../promptConstructor');
const imageAPI = require('../imageAPI');
const imageStorage = require('../imageStorage');

class ImageGeneratorAgent {
    constructor() {
        this.name = 'ImageGenerator';
    }

    /**
     * Generate image for content
     * 
     * @param {object} content - Original content
     * @param {object} ingestResult - Analysis from Ingest Agent
     * @param {object} brandDNA - Brand guidelines (optional)
     * @param {string} platform - Target platform
     * @returns {object} Result with status, url, prompt, metadata
     */
    async generate(content, ingestResult, brandDNA = null, platform = 'generic') {
        const startTime = Date.now();

        console.log(`[ImageGenerator] Starting for platform: ${platform}`);
        console.log(`[ImageGenerator] Content: "${content.title}"`);

        // Build trace record
        const trace = {
            agent: this.name,
            received: {
                contentTitle: content.title,
                platform,
                hasIngestResult: !!ingestResult,
                hasBrandDNA: !!brandDNA
            },
            decided: {},
            passedOn: {}
        };

        try {
            // Step 1: Build context for prompt construction
            const context = this.buildContext(content, ingestResult, brandDNA);
            trace.decided.contextBuilt = true;

            // Step 2: Derive prompt from context (LLM)
            const { prompt, negativePrompt, derivedFrom } = await promptConstructor.construct(context);
            trace.decided.promptDerived = true;
            trace.decided.promptLength = prompt.length;

            console.log(`[ImageGenerator] Prompt derived: "${prompt.substring(0, 80)}..."`);

            // Step 3: Get platform-specific dimensions
            const dimensions = this.getPlatformDimensions(platform);

            // Step 4: Generate image via API (with fallback chain)
            const apiResult = await imageAPI.generate(prompt, {
                ...dimensions,
                negativePrompt
            });

            console.log(`[ImageGenerator] Image generated via: ${apiResult.provider}`);
            trace.decided.provider = apiResult.provider;
            trace.decided.fallbackOccurred = apiResult.fallbackOccurred;

            // Step 5: Store image (if not static placeholder URL)
            let finalUrl = apiResult.imageUrl;
            let storedLocally = false;

            if (apiResult.imageUrl.startsWith('data:') ||
                (apiResult.provider !== 'static' && !apiResult.imageUrl.startsWith('https://via.placeholder'))) {
                try {
                    console.log('[ImageGenerator] Storing image to disk/cloud...');
                    const stored = await imageStorage.upload(apiResult.imageUrl, {
                        platform,
                        format: 'png'
                    });
                    finalUrl = stored.url;
                    storedLocally = true;
                    console.log(`[ImageGenerator] Image stored successfully: ${finalUrl}`);
                } catch (storageError) {
                    console.error('[ImageGenerator] ❌ Storage failed:', storageError.message);
                    console.error('[ImageGenerator] Stack:', storageError.stack);
                    // Fallback: keep the base64 data URL
                    console.warn('[ImageGenerator] Using base64 data URL as fallback');
                }
            }

            const generationTime = Date.now() - startTime;

            // Build result
            const result = {
                status: 'generated',
                platform,
                url: finalUrl,
                prompt: prompt,  // Log verbatim as required
                negativePrompt,
                dimensions,
                provider: apiResult.provider,
                fallbackOccurred: apiResult.fallbackOccurred,
                providersAttempted: apiResult.providersAttempted,
                storedLocally,
                generationTime,
                derivedFrom,
                metadata: apiResult.metadata,
                trace
            };

            trace.passedOn = {
                status: 'generated',
                url: finalUrl,
                provider: apiResult.provider,
                generationTimeMs: generationTime
            };

            console.log(`[ImageGenerator] ✅ Complete in ${generationTime}ms`);
            return result;

        } catch (error) {
            // This should be rare - even static fallback failed
            console.error(`[ImageGenerator] ❌ Failed:`, error.message);

            trace.decided.error = error.message;
            trace.passedOn = { status: 'failed', error: error.message };

            return {
                status: 'failed',
                platform,
                error: error.message,
                generationTime: Date.now() - startTime,
                trace
            };
        }
    }

    /**
     * Build context for prompt construction
     */
    buildContext(content, ingestResult, brandDNA) {
        return {
            title: content.title,
            themes: ingestResult?.themes || [],
            sentiment: ingestResult?.sentiment || 'neutral',
            keyMessage: ingestResult?.keyMessages?.[0] || content.data?.substring(0, 200) || '',
            brandColors: brandDNA?.visualAesthetics?.primaryColors || [],
            preferredStyles: brandDNA?.visualAesthetics?.preferredStyles || ['abstract', 'minimalist'],
            moodKeywords: brandDNA?.visualAesthetics?.moodKeywords || ['professional', 'modern']
        };
    }

    /**
     * Get platform-specific image dimensions
     */
    getPlatformDimensions(platform) {
        const specs = {
            twitter: { width: 1200, height: 675, aspectRatio: '16:9' },
            linkedin: { width: 1200, height: 627, aspectRatio: '1.91:1' },
            instagram: { width: 1080, height: 1080, aspectRatio: '1:1' },
            email: { width: 600, height: 400, aspectRatio: '3:2' },
            blog: { width: 1920, height: 1080, aspectRatio: '16:9' },
            generic: { width: 1024, height: 576, aspectRatio: '16:9' }
        };

        return specs[platform] || specs.generic;
    }

    /**
     * Check if image generation should be attempted
     * Priority: ENV > content flag > brand setting
     */
    shouldGenerate(content, brandDNA) {
        // 1. Environment variable is the master toggle
        const envSetting = process.env.IMAGE_GENERATION_ENABLED;
        if (envSetting !== undefined) {
            const enabled = envSetting.toLowerCase() === 'true';
            console.log(`[ImageGenerator] ENV toggle: IMAGE_GENERATION_ENABLED=${enabled}`);
            return enabled;
        }

        // 2. Check content-level flag
        if (content.imageGenerationEnabled === true) {
            return true;
        }

        // 3. Check brand-level setting
        if (brandDNA?.imageGenerationSettings?.enabled === true) {
            return true;
        }

        return false;
    }
}

module.exports = new ImageGeneratorAgent();
