/**
 * Publisher Agent
 * The Executor - Formats and delivers approved content
 * 
 * From Sources (Architecture I Table):
 * - Capability: Tool Usage (not just generation)
 * - Handles platform-specific formatting
 * - Mocks API publishing (for prototype)
 * - Logs actions for audit trail
 */

class PublisherAgent {
    constructor() {
        // Platform formatters
        this.formatters = {
            twitter: this.formatTwitter.bind(this),
            linkedin: this.formatLinkedIn.bind(this),
            email: this.formatEmail.bind(this),
            instagram: this.formatInstagram.bind(this),
            blog: this.formatBlog.bind(this)
        };
    }

    /**
     * Format and prepare variant for publishing
     * @param {object} variant - Reviewed and approved variant
     */
    async format(variant) {
        const formatter = this.formatters[variant.platform] || this.formatGeneric.bind(this);
        const formatted = await formatter(variant);

        // Mock publish - in production, this would call platform APIs
        const publishResult = await this.mockPublish(variant.platform, formatted);

        return {
            ...variant,
            formatted,
            publishResult,
            publishedAt: new Date()
        };
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
