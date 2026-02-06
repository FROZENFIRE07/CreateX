/**
 * Content Upload Component
 * Upload new content and trigger orchestration
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PLATFORMS = [
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', desc: '280 char tweets' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', desc: 'Professional posts' },
    { id: 'email', name: 'Email', icon: '📧', desc: 'Newsletter format' },
    { id: 'instagram', name: 'Instagram', icon: '📷', desc: 'Caption style' },
    { id: 'blog', name: 'Blog', icon: '📝', desc: 'Full article' }
];

function ContentUpload() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'linkedin', 'email']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();

    const togglePlatform = (platformId) => {
        setSelectedPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(p => p !== platformId)
                : [...prev, platformId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedPlatforms.length === 0) {
            setError('Select at least one target platform');
            return;
        }

        if (content.length < 50) {
            setError('Content must be at least 50 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Step 1: Create content
            const createRes = await api.post('/content', {
                title,
                data: content,
                type: 'text'
            });

            const contentId = createRes.data.content.id;

            // Step 2: Start orchestration
            await api.post(`/content/${contentId}/orchestrate`, {
                platforms: selectedPlatforms
            });

            setSuccess({
                contentId,
                message: 'Content uploaded and orchestration started!'
            });

            // Redirect to content detail after 2s
            setTimeout(() => {
                navigate(`/content/${contentId}`);
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-4">
                <h1>Upload Content</h1>
                <p className="mt-1">Transform your content for multiple platforms with AI</p>
            </div>

            <div className="card" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">Content Title</label>
                        <input
                            type="text"
                            className="form-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Product Launch Announcement"
                            required
                            maxLength={200}
                        />
                    </div>

                    {/* Content */}
                    <div className="form-group">
                        <label className="form-label">
                            Original Content
                            <span className="text-muted" style={{ fontWeight: 'normal', marginLeft: '0.5rem' }}>
                                ({content.length} characters)
                            </span>
                        </label>
                        <textarea
                            className="form-textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your article, blog post, or any text content here. SACO will transform it for your selected platforms while maintaining your brand voice..."
                            required
                            style={{ minHeight: '200px' }}
                        />
                        <p className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                            Min 50 characters. The more context you provide, the better the transformations.
                        </p>
                    </div>

                    {/* Platform Selection */}
                    <div className="form-group">
                        <label className="form-label">Target Platforms</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                            {PLATFORMS.map(platform => (
                                <button
                                    key={platform.id}
                                    type="button"
                                    onClick={() => togglePlatform(platform.id)}
                                    className={`card ${selectedPlatforms.includes(platform.id) ? 'selected' : ''}`}
                                    style={{
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        border: selectedPlatforms.includes(platform.id)
                                            ? '2px solid var(--color-accent-primary)'
                                            : '1px solid rgba(255,255,255,0.1)',
                                        background: selectedPlatforms.includes(platform.id)
                                            ? 'rgba(99, 102, 241, 0.1)'
                                            : 'var(--color-bg-card)'
                                    }}
                                >
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{platform.icon}</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{platform.name}</div>
                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{platform.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="form-error" style={{ marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1rem'
                        }}>
                            <p className="text-success">{success.message}</p>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                Redirecting to content detail...
                            </p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full"
                        disabled={loading || success}
                    >
                        {loading ? (
                            <>
                                <span className="spinner spinner-sm"></span>
                                Processing...
                            </>
                        ) : (
                            <>
                                🚀 Start Orchestration
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Info Card */}
            <div className="card mt-4" style={{ maxWidth: '800px' }}>
                <h4 className="mb-2">How COPE Pipeline Works</h4>
                <div className="workflow-steps">
                    <div className="workflow-step">
                        <div className="workflow-step-icon">1</div>
                        <div className="workflow-step-content">
                            <div className="workflow-step-title">Ingest</div>
                            <div className="workflow-step-desc">Analyze content, extract themes, retrieve brand context</div>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="workflow-step-icon">2</div>
                        <div className="workflow-step-content">
                            <div className="workflow-step-title">Generate</div>
                            <div className="workflow-step-desc">Create platform-specific variants with brand consistency</div>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="workflow-step-icon">3</div>
                        <div className="workflow-step-content">
                            <div className="workflow-step-title">Review</div>
                            <div className="workflow-step-desc">Score against brand DNA (80% threshold)</div>
                        </div>
                    </div>
                    <div className="workflow-step">
                        <div className="workflow-step-icon">4</div>
                        <div className="workflow-step-content">
                            <div className="workflow-step-title">Publish</div>
                            <div className="workflow-step-desc">Format and prepare for distribution</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContentUpload;
