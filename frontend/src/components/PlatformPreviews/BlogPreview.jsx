/**
 * Blog Preview Component
 * Renders content as it would appear in a blog article layout
 * Hero image, title, long-form readable body
 */
import React from 'react';

function BlogPreview({ content, image, score, title = 'Article Title', authorName = 'Author' }) {
    // Extract first paragraph as excerpt
    const paragraphs = content?.split('\n').filter(p => p.trim()) || [];
    const excerpt = paragraphs[0] || '';
    const bodyContent = paragraphs.slice(1).join('\n\n');

    return (
        <div className="preview-blog">
            {/* Hero Image */}
            {image && (
                <div className="blog-hero">
                    <img src={image} alt="Article hero" />
                </div>
            )}

            {/* Article Header */}
            <div className="blog-header">
                <span className="blog-category">INSIGHTS</span>
                <h1 className="blog-title">{title}</h1>
                <div className="blog-meta">
                    <div className="blog-author">
                        <div className="blog-author-avatar">
                            <span>{authorName.charAt(0)}</span>
                        </div>
                        <div className="blog-author-info">
                            <span className="blog-author-name">{authorName}</span>
                            <span className="blog-date">Feb 8, 2026 · 5 min read</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Body */}
            <div className="blog-body">
                {excerpt && (
                    <p className="blog-excerpt">{excerpt}</p>
                )}
                {bodyContent && (
                    <div className="blog-content">
                        {bodyContent}
                    </div>
                )}
            </div>

            {/* Article Footer */}
            <div className="blog-footer">
                <div className="blog-tags">
                    <span className="blog-tag">Leadership</span>
                    <span className="blog-tag">Growth</span>
                    <span className="blog-tag">Strategy</span>
                </div>
                <div className="blog-share">
                    <button>🔗 Share</button>
                    <button>🔖 Save</button>
                </div>
            </div>

            {/* Score Badge */}
            {score && (
                <div className="preview-score">
                    <span className="score-label">Consistency</span>
                    <span className="score-value">{score}%</span>
                </div>
            )}
        </div>
    );
}

export default BlogPreview;
