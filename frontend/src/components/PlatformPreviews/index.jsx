/**
 * Platform Previews - Unified Export
 * Maps platform names to their preview components
 */

import LinkedInPreview from './LinkedInPreview';
import TwitterPreview from './TwitterPreview';
import InstagramPreview from './InstagramPreview';
import BlogPreview from './BlogPreview';
import EmailPreview from './EmailPreview';

// Map platform names to components
export const PlatformPreviewMap = {
    linkedin: LinkedInPreview,
    twitter: TwitterPreview,
    instagram: InstagramPreview,
    blog: BlogPreview,
    email: EmailPreview
};

// Get preview component by platform name
export function getPlatformPreview(platform) {
    return PlatformPreviewMap[platform?.toLowerCase()] || null;
}

// Render platform preview with props
export function PlatformPreview({ platform, content, image, score, title, authorName }) {
    const PreviewComponent = getPlatformPreview(platform);

    if (!PreviewComponent) {
        return (
            <div className="preview-generic">
                <div className="preview-generic-header">
                    <span className="preview-platform-icon">📄</span>
                    <span className="preview-platform-name">{platform}</span>
                </div>
                <div className="preview-generic-content">{content}</div>
                {image && <img src={image} alt="Preview" className="preview-generic-image" />}
            </div>
        );
    }

    return (
        <PreviewComponent
            content={content}
            image={image}
            score={score}
            title={title}
            authorName={authorName}
        />
    );
}

export {
    LinkedInPreview,
    TwitterPreview,
    InstagramPreview,
    BlogPreview,
    EmailPreview
};

export default PlatformPreview;
