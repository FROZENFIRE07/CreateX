/**
 * Ayrshare API Client
 * Handles real social media publishing via Ayrshare API
 * Supports per-user API keys (stored encrypted in User model)
 * Falls back to env AYRSHARE_API_KEY if no per-user key provided
 */

const axios = require('axios');

const AYRSHARE_BASE_URL = 'https://app.ayrshare.com/api';

class AyrshareClient {
    constructor() {
        this.maxRetries = 1;
        this.timeout = 90000; // 90s - Instagram media can take 60s+
    }

    /**
     * Resolve the API key: per-user key takes priority, then env fallback
     */
    _resolveKey(apiKey) {
        return apiKey || process.env.AYRSHARE_API_KEY || '';
    }

    /**
     * Check if publishing is possible (with optional per-user key)
     */
    isConfigured(apiKey) {
        const key = this._resolveKey(apiKey);
        return key && key.length > 0;
    }

    /**
     * Publish content to one or more platforms
     * @param {Object} payload - { post, platforms, mediaUrls }
     * @param {string} apiKey - Per-user API key (optional, falls back to env)
     * @returns {Object} Publish result with per-platform status
     */
    async publish(payload, apiKey) {
        const key = this._resolveKey(apiKey);
        if (!key) {
            throw new Error('No Ayrshare API key available. Add your key in Settings.');
        }

        const body = {
            post: payload.post,
            platforms: payload.platforms || [],
        };

        // Attach media if provided
        if (payload.mediaUrls && payload.mediaUrls.length > 0) {
            body.mediaUrls = payload.mediaUrls;
        }

        return this._executeWithRetry(body, key);
    }

    /**
     * Execute API call with retry on transient errors
     */
    async _executeWithRetry(body, apiKey, attempt = 0) {
        try {
            const response = await axios.post(`${AYRSHARE_BASE_URL}/post`, body, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: this.timeout,
            });

            return this._parseResponse(response.data, body.platforms);
        } catch (error) {
            const status = error.response?.status;

            // Retry on transient errors (429 rate limit, 5xx server error, timeout)
            if (attempt < this.maxRetries && (status === 429 || (status >= 500) || error.code === 'ECONNABORTED')) {
                const delay = status === 429 ? 5000 : 2000;
                console.log(`[AyrshareClient] Transient error (${status || error.code}), retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this._executeWithRetry(body, apiKey, attempt + 1);
            }

            // Non-retryable error
            return {
                success: false,
                error: this._parseError(error),
                platforms: body.platforms.map(p => ({
                    platform: p,
                    status: 'error',
                    error: this._parseError(error),
                })),
            };
        }
    }

    /**
     * Parse successful response into normalized format
     */
    _parseResponse(data, platforms) {
        if (data.status === 'error') {
            return {
                success: false,
                error: data.message || 'Ayrshare API error',
                platforms: platforms.map(p => ({
                    platform: p,
                    status: 'error',
                    error: data.message,
                })),
            };
        }

        // Parse per-platform results
        const results = [];
        for (const platform of platforms) {
            const platformData = data[platform] || data.postIds?.[platform];
            if (platformData && platformData.status !== 'error') {
                results.push({
                    platform,
                    status: 'success',
                    postId: platformData.id || platformData.postId || data.id,
                    postUrl: platformData.postUrl || platformData.url || null,
                });
            } else {
                results.push({
                    platform,
                    status: 'error',
                    error: platformData?.message || 'Unknown error',
                });
            }
        }

        return {
            success: results.every(r => r.status === 'success'),
            id: data.id,
            platforms: results,
        };
    }

    /**
     * Parse error into user-friendly message
     */
    _parseError(error) {
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (error.code === 'ECONNABORTED') {
            return 'Request timed out. Instagram with media can take 60+ seconds.';
        }
        if (error.response?.status === 429) {
            return 'Rate limit exceeded. Please try again in a few minutes.';
        }
        if (error.response?.status === 401) {
            return 'Invalid Ayrshare API key. Check your settings.';
        }
        return error.message || 'Unknown publishing error';
    }

    /**
     * Delete a published post (for rollback)
     * @param {string} postId - The Ayrshare post ID to delete
     * @param {string} apiKey - Per-user API key (optional)
     */
    async deletePost(postId, apiKey) {
        const key = this._resolveKey(apiKey);
        if (!key) {
            throw new Error('No Ayrshare API key available.');
        }

        try {
            const response = await axios.delete(`${AYRSHARE_BASE_URL}/post`, {
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                },
                data: { id: postId },
                timeout: 30000,
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: this._parseError(error) };
        }
    }

    /**
     * Get connected accounts status from Ayrshare
     * @param {string} apiKey - Per-user API key (optional)
     */
    async getUser(apiKey) {
        const key = this._resolveKey(apiKey);
        if (!key) {
            throw new Error('No Ayrshare API key available.');
        }

        try {
            const response = await axios.get(`${AYRSHARE_BASE_URL}/user`, {
                headers: {
                    'Authorization': `Bearer ${key}`,
                },
                timeout: 15000,
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: this._parseError(error) };
        }
    }
}

module.exports = new AyrshareClient();
