/**
 * Instagram Preview Component
 * Renders content as it would appear in an Instagram post
 * Image-first, dominant visual with caption below
 */
import React from 'react';

function InstagramPreview({ content, image, score, authorName = 'yourbrand' }) {
    // Split content into caption and hashtags
    const hashtagMatch = content?.match(/(#\w+\s*)+$/);
    const mainCaption = hashtagMatch
        ? content.slice(0, hashtagMatch.index).trim()
        : content;
    const hashtags = hashtagMatch ? hashtagMatch[0] : '';

    return (
        <div className="preview-instagram">
            {/* Header */}
            <div className="instagram-header">
                <div className="instagram-avatar">
                    <span>{authorName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="instagram-author">
                    <span className="instagram-username">{authorName}</span>
                    <span className="instagram-location">Sponsored</span>
                </div>
                <button className="instagram-more">•••</button>
            </div>

            {/* Image - Dominant */}
            <div className="instagram-image">
                {image ? (
                    <img 
                        src={image} 
                        alt="Post visual"
                        onLoad={() => console.log('[Instagram] Image loaded:', image)}
                        onError={(e) => console.error('[Instagram] Image failed to load:', image, e)}
                    />
                ) : (
                    <div className="instagram-placeholder">
                        <span>📷</span>
                        <p>Image will appear here</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="instagram-actions">
                <div className="instagram-actions-left">
                    <button>❤️</button>
                    <button>💬</button>
                    <button>📤</button>
                </div>
                <button className="instagram-save">🔖</button>
            </div>

            {/* Likes */}
            <div className="instagram-likes">
                <strong>1,234 likes</strong>
            </div>

            {/* Caption */}
            <div className="instagram-caption">
                <span className="instagram-caption-author">{authorName}</span>
                <span className="instagram-caption-text">{mainCaption}</span>
                {hashtags && (
                    <span className="instagram-hashtags">{hashtags}</span>
                )}
            </div>

            {/* View Comments */}
            <div className="instagram-comments-link">
                View all 23 comments
            </div>

            {/* Timestamp */}
            <div className="instagram-timestamp">
                2 HOURS AGO
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

export default InstagramPreview;
