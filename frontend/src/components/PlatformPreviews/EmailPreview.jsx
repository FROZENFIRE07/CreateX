/**
 * Email Preview Component
 * Renders content as it would appear in an email client
 * Inbox-like frame with header image and vertical layout
 */
import React from 'react';

function EmailPreview({ content, image, score, authorName = 'Your Brand', subject = 'Your Email' }) {
    return (
        <div className="preview-email">
            {/* Email Client Frame */}
            <div className="email-client">
                {/* Client Header */}
                <div className="email-client-header">
                    <div className="email-client-dots">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green"></span>
                    </div>
                    <span className="email-client-title">Inbox</span>
                </div>

                {/* Email Header */}
                <div className="email-header">
                    <div className="email-field">
                        <span className="email-label">From:</span>
                        <span className="email-value">{authorName} &lt;hello@yourbrand.com&gt;</span>
                    </div>
                    <div className="email-field">
                        <span className="email-label">To:</span>
                        <span className="email-value">subscriber@example.com</span>
                    </div>
                    <div className="email-field">
                        <span className="email-label">Subject:</span>
                        <span className="email-value email-subject">{subject}</span>
                    </div>
                </div>

                {/* Email Body */}
                <div className="email-body">
                    {/* Header Image */}
                    {image && (
                        <div className="email-hero">
                            <img src={image} alt="Email header" />
                        </div>
                    )}

                    {/* Content */}
                    <div className="email-content">
                        {content}
                    </div>

                    {/* CTA Button */}
                    <div className="email-cta">
                        <button className="email-button">Learn More →</button>
                    </div>

                    {/* Footer */}
                    <div className="email-footer">
                        <p>Best regards,</p>
                        <p><strong>{authorName}</strong></p>
                        <div className="email-unsubscribe">
                            <a href="#">Unsubscribe</a> · <a href="#">Preferences</a>
                        </div>
                    </div>
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

export default EmailPreview;
