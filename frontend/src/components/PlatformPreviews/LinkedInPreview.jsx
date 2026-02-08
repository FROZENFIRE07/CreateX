/**
 * LinkedIn Preview Component
 * Renders content as it would appear in a LinkedIn feed post
 */
import React from 'react';

function LinkedInPreview({ content, image, score, authorName = 'Your Brand' }) {
    return (
        <div className="preview-linkedin">
            {/* Header */}
            <div className="linkedin-header">
                <div className="linkedin-avatar">
                    <span>{authorName.charAt(0)}</span>
                </div>
                <div className="linkedin-author">
                    <span className="linkedin-name">{authorName}</span>
                    <span className="linkedin-title">Content Creator • 1st</span>
                    <span className="linkedin-time">Just now • 🌐</span>
                </div>
                <button className="linkedin-more">•••</button>
            </div>

            {/* Content */}
            <div className="linkedin-content">
                {content}
            </div>

            {/* Image */}
            {image && (
                <div className="linkedin-image">
                    <img 
                        src={image} 
                        alt="Post visual"
                        onLoad={() => console.log('[LinkedIn] Image loaded:', image)}
                        onError={(e) => console.error('[LinkedIn] Image failed to load:', image, e)}
                    />
                </div>
            )}

            {/* Engagement Bar */}
            <div className="linkedin-engagement">
                <div className="linkedin-reactions">
                    <span className="reaction">👍</span>
                    <span className="reaction">❤️</span>
                    <span className="reaction">💡</span>
                    <span className="count">42</span>
                </div>
                <span className="linkedin-comments">3 comments</span>
            </div>

            {/* Actions */}
            <div className="linkedin-actions">
                <button><span>👍</span> Like</button>
                <button><span>💬</span> Comment</button>
                <button><span>🔄</span> Repost</button>
                <button><span>📤</span> Send</button>
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

export default LinkedInPreview;
