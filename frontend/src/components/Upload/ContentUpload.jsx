/**
 * Content Upload Component
 * Upload new content and trigger orchestration with inline streaming logs
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PLATFORMS = [
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', desc: '280 char tweets' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', desc: 'Professional posts' },
    { id: 'email', name: 'Email', icon: '📧', desc: 'Newsletter format' },
    { id: 'instagram', name: 'Instagram', icon: '📷', desc: 'Caption style' },
    { id: 'blog', name: 'Blog', icon: '📝', desc: 'Full article' }
];

const AGENT_ICONS = {
    manager: '🎯',
    start: '⚡',
    memory: '🧠',
    plan: '📋',
    ingest: '📥',
    generate: '✨',
    review: '🔍',
    verify: '✅',
    publish: '🚀',
    complete: '🎉',
    error: '❌'
};

function ContentUpload() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'linkedin', 'email']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orchestrating, setOrchestrating] = useState(false);
    const [contentId, setContentId] = useState(null);

    // Streaming logs state
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState(null);
    const [kpis, setKpis] = useState(null);
    const [variants, setVariants] = useState([]);

    const logsEndRef = useRef(null);
    const navigate = useNavigate();

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // SSE for real-time log streaming (direct, no polling)
    useEffect(() => {
        if (!orchestrating || !contentId) return;

        console.log('[Frontend SSE] Connecting to stream for contentId:', contentId);
        const token = localStorage.getItem('saco_token');
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const baseUrl = API_BASE_URL.replace('/api', ''); // Remove /api suffix if present
        
        const eventSource = new EventSource(
            `${baseUrl}/api/content/${contentId}/stream?token=${token}`
        );

        eventSource.onopen = () => {
            console.log('[Frontend SSE] Connection opened successfully');
        };

        // Smart log aggregator - converts technical logs into conversational updates
        const getPhaseFromMessage = (message) => {
            if (message.includes('Starting orchestration') || message.includes('workspace memory')) {
                return { phase: 'init', text: 'Analyzing your content and gathering context from workspace memory...' };
            }
            if (message.includes('Execution plan ready')) {
                return { phase: 'plan', text: 'Created execution plan - ready to transform content for multiple platforms.' };
            }
            if (message.includes('Content analysis complete')) {
                return { phase: 'ingest', text: 'Content analysis complete. Extracted key themes, sentiment, and target audience.' };
            }
            if (message.includes('Generating') && message.includes('variant')) {
                const platform = message.match(/(TWITTER|LINKEDIN|EMAIL|INSTAGRAM)/i)?.[0];
                return { phase: 'generate', text: `Generating ${platform ? platform.toLowerCase() : 'platform'} variant with brand voice...` };
            }
            if (message.includes('Review PASSED')) {
                return { phase: 'review', text: 'Content passes brand consistency checks. Quality verified.' };
            }
            if (message.includes('Preparing to publish')) {
                const count = message.match(/\d+/)?.[0] || '3';
                return { phase: 'publish', text: `Publishing ${count} approved variants to platforms...` };
            }
            if (message.includes('published successfully')) {
                const platform = message.match(/(TWITTER|LINKEDIN|EMAIL)/i)?.[0];
                return { phase: 'published', text: `✓ ${platform} variant published successfully` };
            }
            return null;
        };

        let lastPhase = '';

        eventSource.onmessage = (event) => {
            console.log('[Frontend SSE] Received message:', event.data);
            try {
                const data = JSON.parse(event.data);
                console.log('[Frontend SSE] Parsed data:', data);

                if (data.type === 'connected') {
                    console.log('[Frontend SSE] Connected event received');
                } else if (data.type === 'log') {
                    console.log('[Frontend SSE] Log event:', data.message);
                    
                    // Convert technical log to conversational update
                    const phaseInfo = getPhaseFromMessage(data.message);
                    
                    if (phaseInfo && phaseInfo.phase !== lastPhase) {
                        lastPhase = phaseInfo.phase;
                        setLogs(prev => [...prev, {
                            message: phaseInfo.text,
                            timestamp: data.timestamp
                        }]);
                    }
                } else if (data.type === 'complete') {
                    console.log('[Frontend SSE] Complete event received');
                    setLogs(prev => [...prev, {
                        message: '🎉 All done! Content successfully transformed for all platforms.',
                        timestamp: new Date().toISOString()
                    }]);
                    setStatus('completed');
                    setOrchestrating(false);
                    setKpis(data.kpis);
                    setVariants(data.variants || []);
                    eventSource.close();
                } else if (data.type === 'error') {
                    console.log('[Frontend SSE] Error event received:', data.error);
                    setStatus('failed');
                    setOrchestrating(false);
                    setError(data.error);
                    eventSource.close();
                }
            } catch (err) {
                console.error('[Frontend SSE] Parse error:', err, 'Raw data:', event.data);
            }
        };

        eventSource.onerror = (err) => {
            console.error('[Frontend SSE] Connection error:', err);
            console.error('[Frontend SSE] ReadyState:', eventSource.readyState);
            // Fall back to polling on SSE failure
            eventSource.close();
        };

        return () => {
            console.log('[Frontend SSE] Cleaning up connection');
            eventSource.close();
        };
    }, [orchestrating, contentId]);

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

        console.log('[ContentUpload] Starting submission process');
        setLoading(true);
        setError('');
        setLogs([{ message: 'Initializing orchestration pipeline...', timestamp: new Date().toISOString() }]);

        try {
            // Step 1: Create content
            const createRes = await api.post('/content', {
                title,
                data: content,
                type: 'text'
            });

            const newContentId = createRes.data.content.id;
            setContentId(newContentId);

            // Step 2: Start orchestration
            await api.post(`/content/${newContentId}/orchestrate`, {
                platforms: selectedPlatforms
            });

            // Step 3: Start polling for logs (stay on same page)
            setLoading(false);
            setOrchestrating(true);
            setStatus('processing');

        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
            setLoading(false);
        }
    };

    const handleViewResults = () => {
        navigate(`/content/${contentId}`);
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-4">
                <h1>Upload Content</h1>
                <p className="mt-1">Transform your content for multiple platforms with AI</p>
            </div>

            {/* Two Column Layout */}
            <div className="page-grid">

                {/* Left Column - Form & Output */}
                <div>
                    <div className="card">
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
                                    disabled={orchestrating}
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
                                    placeholder="Paste your article, blog post, or any text content here..."
                                    required
                                    style={{ minHeight: '150px' }}
                                    disabled={orchestrating}
                                />
                            </div>

                            {/* Platform Selection */}
                            <div className="form-group">
                                <label className="form-label">Target Platforms</label>
                                <div className="platform-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                                    {PLATFORMS.map(platform => (
                                        <button
                                            key={platform.id}
                                            type="button"
                                            onClick={() => !orchestrating && togglePlatform(platform.id)}
                                            className={`card ${selectedPlatforms.includes(platform.id) ? 'selected' : ''}`}
                                            disabled={orchestrating}
                                            style={{
                                                padding: '0.75rem',
                                                cursor: orchestrating ? 'not-allowed' : 'pointer',
                                                textAlign: 'left',
                                                border: selectedPlatforms.includes(platform.id)
                                                    ? '2px solid var(--color-accent-primary)'
                                                    : '1px solid rgba(255,255,255,0.1)',
                                                background: selectedPlatforms.includes(platform.id)
                                                    ? 'rgba(99, 102, 241, 0.1)'
                                                    : 'var(--color-bg-card)',
                                                opacity: orchestrating ? 0.7 : 1
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '1.25rem' }}>{platform.icon}</span>
                                                <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{platform.name}</span>
                                            </div>
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

                            {/* Submit */}
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-full"
                                disabled={loading || orchestrating}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner spinner-sm"></span>
                                        Creating content...
                                    </>
                                ) : orchestrating ? (
                                    <>
                                        <span className="spinner spinner-sm"></span>
                                        Orchestrating...
                                    </>
                                ) : (
                                    <>
                                        🚀 Start Orchestration
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Generated Variants - Show after completion */}
                    {status === 'completed' && variants.length > 0 && (
                        <div className="card mt-4 animate-fade-in">
                            <div className="card-header">
                                <h3 className="card-title">Generated Variants</h3>
                                <button className="btn btn-sm btn-primary" onClick={handleViewResults}>
                                    View Full Details →
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {variants.slice(0, 2).map((variant, idx) => (
                                    <div key={idx} style={{
                                        padding: '1rem',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <span>{PLATFORMS.find(p => p.id === variant.platform)?.icon}</span>
                                            <strong style={{ textTransform: 'capitalize' }}>{variant.platform}</strong>
                                            <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                                                {variant.consistencyScore}%
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                                            {variant.content?.substring(0, 150)}...
                                        </p>
                                    </div>
                                ))}
                                {variants.length > 2 && (
                                    <p className="text-muted text-center">
                                        +{variants.length - 2} more variants
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Workflow Log */}
                <div>
                    <div className="card workflow-sidebar" style={{ position: 'sticky', top: '80px' }}>
                        <div className="card-header" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h3 className="card-title" style={{ margin: 0 }}>Workflow Log</h3>
                            {orchestrating && status !== 'completed' && (
                                <span className="spinner spinner-sm"></span>
                            )}
                            {status === 'completed' && (
                                <span className="badge badge-success">Complete</span>
                            )}
                        </div>

                        <div style={{
                            maxHeight: '500px',
                            overflowY: 'auto',
                            padding: '0.5rem 0'
                        }}>
                            {logs.length === 0 ? (
                                <p className="text-muted text-center" style={{ padding: '2rem' }}>
                                    {orchestrating ? 'Starting orchestration...' : 'Logs will appear here when you start orchestration'}
                                </p>
                            ) : (
                                <div className="workflow-steps">
                                    {logs.map((log, idx) => (
                                        <div
                                            key={idx}
                                            className="workflow-step"
                                            style={{
                                                opacity: 0,
                                                animation: 'workflowFadeIn 0.4s ease forwards',
                                                animationDelay: `${idx * 0.1}s`,
                                                marginBottom: '0.75rem'
                                            }}
                                        >
                                            <div style={{ 
                                                fontSize: '0.9rem', 
                                                lineHeight: '1.6',
                                                color: 'rgba(255,255,255,0.9)'
                                            }}>
                                                {log.message}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={logsEndRef} />
                                </div>
                            )}
                        </div>

                        {/* KPIs Summary */}
                        {kpis && (
                            <div className="kpi-summary-grid" style={{
                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                padding: '1rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '0.5rem',
                                textAlign: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                                        {kpis.hitRate}%
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>Hit Rate</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                        {kpis.publishedCount}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>Published</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                        {kpis.processingTime}s
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>Time</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes workflowFadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateX(-10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(0); 
                    }
                }
            `}</style>
        </div>
    );
}

export default ContentUpload;
