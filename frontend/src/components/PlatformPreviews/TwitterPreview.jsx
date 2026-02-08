/**
 * Twitter/X Preview Component
 * Renders content as it would appear as a tweet
 */
import React from 'react';

function TwitterPreview({ content, image, score, authorName = 'YourBrand', handle = '@yourbrand' }) {
    const charCount = content?.length || 0;
    const isOverLimit = charCount > 280;

    return (
        <div className="preview-twitter">
            {/* Header */}
            <div className="twitter-header">
                <div className="twitter-avatar">
                    <span>{authorName.charAt(0)}</span>
                </div>
                <div className="twitter-author">
                    <div className="twitter-name-row">
                        <span className="twitter-name">{authorName}</span>
                        <span className="twitter-verified">✓</span>
                    </div>
                    <span className="twitter-handle">{handle}</span>
                </div>
                <button className="twitter-more">•••</button>
            </div>

            {/* Content */}
            <div className={`twitter-content ${isOverLimit ? 'over-limit' : ''}`}>
                {content}
            </div>

            {/* Character Count */}
            {isOverLimit && (
                <div className="twitter-char-warning">
                    ⚠️ {charCount}/280 characters
                </div>
            )}

            {/* Image */}
            {image && (
                <div className="twitter-media">
                    <img src={image} alt="Tweet media" />
                </div>
            )}

            {/* Timestamp */}
            <div className="twitter-timestamp">
                1:30 PM · Feb 8, 2026 · <span className="twitter-views">1.2K</span> Views
            </div>

            {/* Stats */}
            <div className="twitter-stats">
                <span><strong>12</strong> Reposts</span>
                <span><strong>5</strong> Quotes</span>
                <span><strong>89</strong> Likes</span>
                <span><strong>3</strong> Bookmarks</span>
            </div>

            {/* Actions */}
            <div className="twitter-actions">
                <button title="Reply">💬</button>
                <button title="Repost">🔄</button>
                <button title="Like">❤️</button>
                <button title="Views">📊</button>
                <button title="Bookmark">🔖</button>
                <button title="Share">📤</button>
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

export default TwitterPreview;
