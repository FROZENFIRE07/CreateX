/**
 * Content Detail Component
 * View content with orchestration status and variants
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import PlatformPreview from '../PlatformPreviews';
import ManagerPanel from '../ManagerPanel/ManagerPanel';

const platformIcons = {
    twitter: '🐦',
    linkedin: '💼',
    email: '📧',
    instagram: '📷',
    blog: '📝'
};

const POLL_INTERVAL = 3000; // 3 seconds

// Helper to convert relative image URLs to absolute backend URLs
const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url; // Already absolute
    if (url.startsWith('data:')) return url; // Base64 data URL, return as-is
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const baseUrl = API_BASE.replace('/api', ''); // Remove /api suffix
    const absoluteUrl = `${baseUrl}${url}`;
    return absoluteUrl;
};

function ContentDetail() {
    const { id } = useParams();
    const [content, setContent] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchContent();
    }, [id]);

    // Poll for status updates while processing
    useEffect(() => {
        if (status?.status === 'processing') {
            const interval = setInterval(fetchStatus, POLL_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [status?.status]);

    const fetchContent = async () => {
        try {
            const res = await api.get(`/content/${id}`);
            console.log('[ContentDetail] Fetched content:', res.data.content);
            console.log('[ContentDetail] Orchestration log:', res.data.content.orchestrationLog);
            setContent(res.data.content);
            setStatus({
                status: res.data.content.orchestrationStatus,
                log: res.data.content.orchestrationLog || [],
                kpis: res.data.content.kpis,
                variants: res.data.content.variants
            });
        } catch (err) {
            setError('Content not found');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await api.get(`/content/${id}/status`);
            setStatus(res.data);

            if (res.data.status === 'completed' || res.data.status === 'failed') {
                // Fetch full content to get all variants
                fetchContent();
            }
        } catch (err) {
            console.error('Status poll error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center" style={{ padding: '3rem' }}>
                <h2>Content Not Found</h2>
                <p className="text-muted mt-2">{error}</p>
                <Link to="/" className="btn btn-primary mt-4">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 content-detail-header">
                <div>
                    <Link to="/" className="text-muted" style={{ fontSize: '0.875rem' }}>← Back to Dashboard</Link>
                    <h1 className="mt-2">{content.title}</h1>
                    <p className="mt-1">
                        Created {new Date(content.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <StatusBadge status={status?.status} />
            </div>

            {/* KPIs */}
            {status?.kpis && (
                <div className="kpi-grid mb-4">
                    <div className="card kpi-card">
                        <div className="kpi-label">Hit Rate</div>
                        <div className="kpi-value">{status.kpis.hitRate}<span className="kpi-unit">%</span></div>
                    </div>
                    <div className="card kpi-card">
                        <div className="kpi-label">Processing Time</div>
                        <div className="kpi-value">{status.kpis.processingTime}<span className="kpi-unit">s</span></div>
                    </div>
                    <div className="card kpi-card">
                        <div className="kpi-label">Avg Consistency</div>
                        <div className="kpi-value">{status.kpis.avgConsistencyScore}<span className="kpi-unit">%</span></div>
                    </div>
                    <div className="card kpi-card">
                        <div className="kpi-label">Automation</div>
                        <div className="kpi-value">{status.kpis.automationRate}<span className="kpi-unit">%</span></div>
                    </div>
                </div>
            )}

            <div className="page-grid-wide">
                {/* Main Content Area */}
                <div>
                    {/* Original Content */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">Original Content</h3>
                            <span className="badge badge-info">{content.type}</span>
                        </div>
                        <div style={{
                            padding: '1rem',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '300px',
                            overflow: 'auto'
                        }}>
                            {content.data}
                        </div>
                    </div>

                    {/* Generated Variants */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Generated Variants</h3>
                            <span className="text-muted">{status?.variants?.length || 0} platforms</span>
                        </div>

                        {status?.status === 'processing' ? (
                            <div className="text-center" style={{ padding: '3rem' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <p>Generating variants...</p>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    AI agents are transforming your content for each platform
                                </p>
                            </div>
                        ) : status?.variants?.length > 0 ? (
                            <div className="preview-grid">
                                {status.variants.map((variant, idx) => (
                                    <PlatformPreview
                                        key={idx}
                                        platform={variant.platform}
                                        content={variant.content}
                                        image={resolveImageUrl(variant.image?.url)}
                                        score={variant.consistencyScore}
                                        title={content?.title}
                                        authorName="Your Brand"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center" style={{ padding: '2rem' }}>
                                <p className="text-muted">No variants generated yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Manager Agent Panel */}
                <div>
                    <ManagerPanel
                        contentId={id}
                        onVariantsUpdated={fetchContent}
                    />
                </div>

            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const badges = {
        pending: { class: 'badge-info', label: 'Pending' },
        processing: { class: 'badge-processing', label: 'Processing' },
        completed: { class: 'badge-success', label: 'Completed' },
        failed: { class: 'badge-error', label: 'Failed' },
        approved: { class: 'badge-success', label: 'Approved' },
        flagged: { class: 'badge-warning', label: 'Flagged' }
    };

    const badge = badges[status] || { class: 'badge-info', label: status };

    return <span className={`badge ${badge.class}`}>{badge.label}</span>;
}

function getAgentIcon(agent) {
    const icons = {
        manager: '🎯',
        ingest: '📥',
        generator: '✨',
        reviewer: '✅',
        publisher: '📤',
        system: '⚙️'
    };
    return icons[agent] || '•';
}

export default ContentDetail;
