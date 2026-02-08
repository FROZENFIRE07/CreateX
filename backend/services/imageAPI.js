/**
 * Image API Client - Bulletproof Multi-Provider Fallback
 * 
 * GUARANTEE: This module NEVER fails - always returns an image
 * 
 * Fallback Chain:
 * 1. Stability AI (tries all 8 keys)
 * 2. HuggingFace (FREE)
 * 3. Static placeholder
 * 4. Emergency static (sync, cannot fail)
 */

const axios = require('axios');
const { InferenceClient } = require('@huggingface/inference');

class ImageAPIClient {
    constructor() {
        this.failedStabilityKeys = new Set();
    }

    /**
     * Get all configured Stability AI keys
     */
    getStabilityKeys() {
        const keys = [];
        for (let i = 1; i <= 8; i++) {
            const key = process.env[`STABILITY_API_KEY${i}`];
            if (key && key.trim()) {
                keys.push({ index: i, key: key.trim() });
            }
        }
        return keys;
    }

    /**
     * Generate image with automatic fallback chain
     * GUARANTEE: This function NEVER throws - always returns an image
     */
    async generate(prompt, options = {}) {
        const intent = prompt;
        const {
            width = 1024,
            height = 1024,
            negativePrompt = 'text, words, letters, typography, watermark, signature'
        } = options;

        let providersAttempted = [];

        try {
            // === TIER 1: Stability AI (all keys) ===
            const stabilityResult = await this.tryAllStabilityKeys(prompt, { width, height, negativePrompt });

            if (stabilityResult.success) {
                console.log(`[ImageAPI] ✅ Success with stability (key #${stabilityResult.keyIndex})`);
                return {
                    imageUrl: stabilityResult.imageUrl,
                    provider: 'stability',
                    fallbackOccurred: false,
                    providersAttempted: [`stability-key${stabilityResult.keyIndex}`],
                    intent: intent,
                    metadata: stabilityResult.metadata || {}
                };
            }

            providersAttempted = stabilityResult.keysAttempted.map(k => `stability-key${k}`);
            console.log('[ImageAPI] All Stability AI keys failed, trying HuggingFace...');

            // === TIER 2: HuggingFace (FREE) ===
            try {
                const hfResult = await this.callHuggingFace(prompt, { width, height });
                providersAttempted.push('huggingface');

                console.log('[ImageAPI] ✅ Success with HuggingFace');
                return {
                    imageUrl: hfResult.imageUrl,
                    provider: 'huggingface',
                    fallbackOccurred: true,
                    providersAttempted,
                    intent: intent,
                    metadata: hfResult.metadata || {}
                };
            } catch (hfError) {
                console.log(`[ImageAPI] HuggingFace failed: ${hfError.message}`);
                providersAttempted.push('huggingface-failed');
            }

            // === TIER 3: Static placeholder ===
            console.log('[ImageAPI] Using static placeholder');
            const staticResult = await this.callStatic(prompt, { width, height });
            providersAttempted.push('static');

            console.log('[ImageAPI] ✅ Success with static');
            return {
                imageUrl: staticResult.imageUrl,
                provider: 'static',
                fallbackOccurred: true,
                providersAttempted,
                intent: intent,
                metadata: staticResult.metadata || {}
            };

        } catch (unexpectedError) {
            // === TIER 4: Emergency static (CANNOT FAIL) ===
            console.error('[ImageAPI] ⚠️ Unexpected error, using emergency static:', unexpectedError.message);

            return {
                imageUrl: this.getEmergencyStatic(prompt),
                provider: 'emergency-static',
                fallbackOccurred: true,
                providersAttempted: [...providersAttempted, 'emergency-static'],
                intent: intent,
                metadata: { error: unexpectedError.message, isEmergency: true }
            };
        }
    }

    /**
     * Emergency static - pure sync, cannot fail
     */
    getEmergencyStatic(prompt) {
        const hash = this.simpleHash(prompt || 'default');
        const hue = hash % 360;
        const color = this.hslToHex(hue, 60, 45);
        return `https://via.placeholder.com/1024x1024/${color.slice(1)}/ffffff?text=Image`;
    }

    /**
     * Try ALL Stability AI keys before giving up
     */
    async tryAllStabilityKeys(prompt, options) {
        const allKeys = this.getStabilityKeys();
        const keysAttempted = [];

        if (allKeys.length === 0) {
            console.log('[StabilityAI] No keys configured');
            return { success: false, keysAttempted };
        }

        let availableKeys = allKeys.filter(k => !this.failedStabilityKeys.has(k.index));

        if (availableKeys.length === 0) {
            console.log('[StabilityAI] All keys exhausted, resetting...');
            this.failedStabilityKeys.clear();
            availableKeys = [...allKeys];
        }

        console.log(`[StabilityAI] Trying ${availableKeys.length} available keys...`);

        for (const keyInfo of availableKeys) {
            keysAttempted.push(keyInfo.index);
            console.log(`[StabilityAI] Trying key #${keyInfo.index}...`);

            try {
                const result = await this.callStabilitySDXL(prompt, options, keyInfo);
                return {
                    success: true,
                    imageUrl: result.imageUrl,
                    keyIndex: keyInfo.index,
                    metadata: result.metadata,
                    keysAttempted
                };
            } catch (error) {
                const status = error.response?.status;
                const errorData = error.response?.data;
                console.log(`[StabilityAI] Key #${keyInfo.index} failed: ${status || error.message}`);
                if (errorData) {
                    console.log(`[StabilityAI] Error details:`, JSON.stringify(errorData).substring(0, 200));
                }

                if (status === 401 || status === 402 || status === 403) {
                    this.failedStabilityKeys.add(keyInfo.index);
                }
            }
        }

        return { success: false, keysAttempted };
    }

    /**
     * Call Stability AI SDXL 1.0
     */
    async callStabilitySDXL(prompt, options, keyInfo) {
        const { negativePrompt } = options;

        const response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
            {
                text_prompts: [
                    { text: prompt, weight: 1 },
                    { text: negativePrompt, weight: -1 }
                ],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                steps: 30,
                samples: 1
            },
            {
                headers: {
                    'Authorization': `Bearer ${keyInfo.key}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 90000
            }
        );

        if (response.data?.artifacts?.[0]?.base64) {
            return {
                imageUrl: `data:image/png;base64,${response.data.artifacts[0].base64}`,
                metadata: {
                    model: 'sdxl-1.0',
                    keyUsed: keyInfo.index,
                    provider: 'stability',
                    finishReason: response.data.artifacts[0].finishReason
                }
            };
        }

        throw new Error('No image data in response');
    }

    /**
     * Call HuggingFace Inference API (FREE)
     */
    async callHuggingFace(prompt, options) {
        const apiKey = process.env.HUGGINGFACE_API_KEY;

        if (!apiKey) {
            throw new Error('HUGGINGFACE_API_KEY not configured');
        }

        console.log('[HuggingFace] Calling inference API...');

        const client = new InferenceClient(apiKey);

        const image = await client.textToImage({
            provider: 'nscale',
            model: 'stabilityai/stable-diffusion-xl-base-1.0',
            inputs: prompt,
            parameters: { num_inference_steps: 25 }
        });

        const arrayBuffer = await image.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        console.log('[HuggingFace] ✅ Image generated');

        return {
            imageUrl: `data:image/png;base64,${base64}`,
            metadata: { model: 'sdxl-1.0', provider: 'huggingface', via: 'nscale' }
        };
    }

    /**
     * Static placeholder
     */
    async callStatic(prompt, options) {
        console.log('[ImageAPI] Using static placeholder');

        const hash = this.simpleHash(prompt);
        const hue = hash % 360;
        const color = this.hslToHex(hue, 60, 45);

        const { width, height } = options;
        const shortPrompt = encodeURIComponent(prompt.substring(0, 30));

        return {
            imageUrl: `https://via.placeholder.com/${width}x${height}/${color.slice(1)}/ffffff?text=${shortPrompt}`,
            metadata: { model: 'placeholder', isStatic: true, color }
        };
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
}

module.exports = new ImageAPIClient();
