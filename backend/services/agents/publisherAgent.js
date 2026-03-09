/**
 * Publisher Agent
 * The Executor - Formats and delivers approved content
 * 
 * Dual-mode operation:
 * - MOCK (default): Simulates publishing for development/testing
 * - LIVE: Real publishing via Ayrshare API
 * 
 * Mode controlled by:
 * 1. PUBLICATION_MODE env variable (global default)
 * 2. Per-request mode override
 */

const ayrshareClient = require('../ayrshareClient');

class PublisherAgent {
    constructor() {
        // Default mode from env (safe default: mock)
        this.defaultMode = (process.env.PUBLICATION_MODE || 'mock').toLowerCase();

        // Platform formatters
        this.formatters = {
            twitter: this.formatTwitter.bind(this),
            linkedin: this.formatLinkedIn.bind(this),
            email: this.formatEmail.bind(this),
            instagram: this.formatInstagram.bind(this),
            blog: this.formatBlog.bind(this)
        };

        // Ayrshare platform name mapping
        this.ayrshareMap = {
            twitter: 'twitter',
            linkedin: 'linkedin',
            instagram: 'instagram',
        };
    }

    /**
     * Format and prepare variant for publishing
     * @param {object} variant - Reviewed and approved variant
     * @param {string} modeOverride - Optional mode override ('mock' or 'live')
     * @param {string} apiKey - Per-user Ayrshare API key (optional)
     */
    async format(variant, modeOverride = null, apiKey = null) {
        const formatter = this.formatters[variant.platform] || this.formatGeneric.bind(this);
        const formatted = await formatter(variant);

        // Determine publish mode
        const mode = modeOverride || this.defaultMode;

        let publishResult;
        if (mode === 'live' && this.ayrshareMap[variant.platform] && ayrshareClient.isConfigured(apiKey)) {
            publishResult = await this._publishLive(variant.platform, formatted, variant, apiKey);
        } else {
            publishResult = await this.mockPublish(variant.platform, formatted);
            if (mode === 'live' && !ayrshareClient.isConfigured(apiKey)) {
                publishResult.fallbackToMock = true;
                publishResult.message += ' (Fallback: Ayrshare API key not configured)';
            }
        }

        return {
            ...variant,
            formatted,
            publishResult,
            publishedAt: new Date(),
            publishMode: mode,
            publishStatus: {
                published: publishResult.success,
                publishedAt: new Date(),
                postId: publishResult.postId || publishResult.mockId || null,
                postUrl: publishResult.postUrl || null,
                mode: publishResult.fallbackToMock ? 'mock' : mode,
                error: publishResult.error || null,
            },
            // Trace: captures what this agent received, decided, and passed on
            trace: {
                agent: 'publisher',
                received: {
                    platform: variant.platform,
                    reviewStatus: variant.status,
                    consistencyScore: variant.consistencyScore,
                    contentLength: variant.content?.length || 0,
                    requestedMode: mode
                },
                decided: {
                    formatterUsed: variant.platform,
                    formatType: formatted.type,
                    finalCharCount: formatted.charCount,
                    publishAction: variant.status === 'approved' ? 'publish' : 'skip',
                    publishMode: publishResult.fallbackToMock ? 'mock (fallback)' : mode,
                    publishReason: variant.status === 'approved'
                        ? `Score ${variant.consistencyScore}% >= 80% threshold`
                        : `Score ${variant.consistencyScore}% below 80% threshold`
                },
                passedOn: {
                    published: publishResult.success,
                    postId: publishResult.postId || publishResult.mockId,
                    postUrl: publishResult.postUrl || null,
                    timestamp: publishResult.timestamp,
                    mode: publishResult.fallbackToMock ? 'mock' : mode,
                    finalOutput: {
                        type: formatted.type,
                        charCount: formatted.charCount,
                        apiFormatKeys: Object.keys(formatted.apiFormat || {})
                    }
                }
            }
        };
    }

    /**
     * Publish live via Ayrshare API
     */
    async _publishLive(platform, formatted, variant, apiKey = null) {
        console.log(`[Publisher] LIVE publish to ${platform} via Ayrshare`);

        const ayrPlatform = this.ayrshareMap[platform];
        if (!ayrPlatform) {
            // Platform not supported by Ayrshare, fallback to mock
            const mockResult = await this.mockPublish(platform, formatted);
            mockResult.fallbackToMock = true;
            mockResult.message += ` (${platform} not supported by Ayrshare, using mock)`;
            return mockResult;
        }

        try {
            const payload = {
                post: formatted.content || formatted.body || formatted.apiFormat?.text || '',
                platforms: [ayrPlatform],
            };

            // Attach image if available
            if (variant.image?.url) {
                payload.mediaUrls = [variant.image.url];
            }

            const result = await ayrshareClient.publish(payload, apiKey);

            if (result.success) {
                const platformResult = result.platforms.find(p => p.platform === ayrPlatform) || {};
                return {
                    success: true,
                    platform,
                    postId: platformResult.postId || result.id,
                    postUrl: platformResult.postUrl || null,
                    timestamp: new Date().toISOString(),
                    mode: 'live',
                    message: `Published to ${platform} via Ayrshare`
                };
            } else {
                const platformError = result.platforms.find(p => p.platform === ayrPlatform);
                return {
                    success: false,
                    platform,
                    error: platformError?.error || result.error || 'Ayrshare publish failed',
                    timestamp: new Date().toISOString(),
                    mode: 'live',
                    message: `Failed to publish to ${platform}: ${platformError?.error || result.error}`
                };
            }
        } catch (error) {
            console.error(`[Publisher] Ayrshare error for ${platform}:`, error.message);
            return {
                success: false,
                platform,
                error: error.message,
                timestamp: new Date().toISOString(),
                mode: 'live',
                message: `Ayrshare error: ${error.message}`
            };
        }
    }

    /**
     * Twitter formatter - handles threads and hashtags
     */
    formatTwitter(variant) {
        let content = variant.content;
        const hashtags = variant.metadata?.hashtags || [];

        // If content is too long, it should already be a thread format
        if (!content.includes('1/')) {
            // Add hashtags if space allows
            const hashtagStr = hashtags.map(t => `#${t.replace(/^#/, '')}`).join(' ');
            if (content.length + hashtagStr.length + 1 <= 280) {
                content = `${content}\n\n${hashtagStr}`;
            }
        }

        return {
            type: 'tweet',
            content,
            hashtags,
            charCount: content.length,
            isThread: content.includes('/'),
            apiFormat: {
                text: content,
                // reply_settings, etc. would go here
            }
        };
    }

    /**
     * LinkedIn formatter - professional with engagement hooks
     */
    formatLinkedIn(variant) {
        const content = variant.content;
        const hashtags = variant.metadata?.hashtags || [];

        // LinkedIn likes hooks and CTAs
        const formatted = content;

        return {
            type: 'linkedin_post',
            content: formatted,
            hashtags,
            charCount: formatted.length,
            apiFormat: {
                commentary: formatted,
                visibility: 'PUBLIC'
            }
        };
    }

    /**
     * Email formatter - subject line and body structure
     */
    formatEmail(variant) {
        const content = variant.content;
        const hook = variant.metadata?.hook || variant.content.split('\n')[0];

        // Parse subject if included, otherwise use hook
        let subject = hook.substring(0, 60);
        let body = content;

        if (content.toLowerCase().includes('subject:')) {
            const lines = content.split('\n');
            const subjectLine = lines.find(l => l.toLowerCase().startsWith('subject:'));
            if (subjectLine) {
                subject = subjectLine.replace(/^subject:\s*/i, '').substring(0, 60);
                body = lines.filter(l => !l.toLowerCase().startsWith('subject:')).join('\n').trim();
            }
        }

        return {
            type: 'email_newsletter',
            subject,
            body,
            preview: body.substring(0, 100),
            charCount: body.length,
            apiFormat: {
                subject,
                html_body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${body.split('\n\n').map(p => `<p>${p}</p>`).join('')}
        </div>`,
                plain_body: body
            }
        };
    }

    /**
     * Instagram formatter - caption with hashtag block
     */
    formatInstagram(variant) {
        const content = variant.content;
        const hashtags = variant.metadata?.hashtags || [];

        // Instagram: content + line breaks + hashtag block
        const hashtagBlock = hashtags.map(t => `#${t.replace(/^#/, '')}`).join(' ');
        const formatted = content.includes('#')
            ? content
            : `${content}\n\n.\n.\n.\n\n${hashtagBlock}`;

        return {
            type: 'instagram_caption',
            content: formatted,
            hashtags,
            charCount: formatted.length,
            apiFormat: {
                caption: formatted
            }
        };
    }

    /**
     * Blog formatter - SEO-ready with headers
     */
    formatBlog(variant) {
        const content = variant.content;
        const keywords = variant.metadata?.themes || [];

        return {
            type: 'blog_post',
            content,
            charCount: content.length,
            seoMeta: {
                title: variant.metadata?.hook || 'Blog Post',
                description: content.substring(0, 160),
                keywords
            },
            apiFormat: {
                html: content.split('\n\n').map(p => {
                    if (p.startsWith('# ')) return `<h1>${p.substring(2)}</h1>`;
                    if (p.startsWith('## ')) return `<h2>${p.substring(3)}</h2>`;
                    if (p.startsWith('### ')) return `<h3>${p.substring(4)}</h3>`;
                    return `<p>${p}</p>`;
                }).join('\n'),
                markdown: content
            }
        };
    }

    /**
     * Generic formatter fallback
     */
    formatGeneric(variant) {
        return {
            type: 'generic',
            content: variant.content,
            charCount: variant.content.length,
            apiFormat: { text: variant.content }
        };
    }

    /**
     * Mock API publishing - simulates platform delivery
     * In production, integrate actual platform APIs
     */
    async mockPublish(platform, formatted) {
        console.log(`[Publisher] Mock publish to ${platform}:`, formatted.type);

        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 100));

        // Return mock success response
        return {
            success: true,
            platform,
            mockId: `${platform}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            message: `Content ready for ${platform}. (Mock - actual API integration pending)`
        };
    }
}

module.exports = new PublisherAgent();
