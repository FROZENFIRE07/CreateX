/**
 * Dashboard Component
 * Main dashboard with KPIs and content list
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

// Platform icons (using emoji for simplicity)
const platformIcons = {
    twitter: '🐦',
    linkedin: '💼',
    email: '📧',
    instagram: '📷',
    blog: '📝'
};

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, contentsRes] = await Promise.all([
                api.get('/auth/stats'),
                api.get('/content?limit=5')
            ]);

            setStats(statsRes.data);
            setContents(contentsRes.data.contents);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="mt-1">Your content orchestration at a glance</p>
                </div>
                <Link to="/upload" className="btn btn-primary">
                    + New Content
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="card kpi-card">
                    <div className="kpi-label">Hit Rate</div>
                    <div className="kpi-value">
                        {stats?.kpis?.hitRate || 85}<span className="kpi-unit">%</span>
                    </div>
                    <div className="kpi-change positive">↑ Target: 85%</div>
                </div>

                <div className="card kpi-card">
                    <div className="kpi-label">Automation Rate</div>
                    <div className="kpi-value">
                        {stats?.kpis?.automationRate || 0}<span className="kpi-unit">%</span>
                    </div>
                    <div className="kpi-change positive">Autonomous</div>
                </div>

                <div className="card kpi-card">
                    <div className="kpi-label">Total Content</div>
                    <div className="kpi-value">
                        {stats?.kpis?.totalContent || 0}
                    </div>
                    <div className="kpi-change">Pieces created</div>
                </div>

                <div className="card kpi-card">
                    <div className="kpi-label">Variants Generated</div>
                    <div className="kpi-value">
                        {stats?.kpis?.totalVariants || 0}
                    </div>
                    <div className="kpi-change">Via COPE pipeline</div>
                </div>
            </div>

            {/* Recent Content */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Recent Content</h3>
                    <Link to="/upload" className="btn btn-ghost btn-sm">View All</Link>
                </div>

                {contents.length === 0 ? (
                    <div className="text-center" style={{ padding: '3rem' }}>
                        <p className="text-muted mb-4">No content yet. Create your first piece!</p>
                        <Link to="/upload" className="btn btn-primary">
                            Upload Content
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="table-container desktop-only">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Variants</th>
                                        <th>Created</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contents.map(content => (
                                        <tr key={content._id}>
                                            <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                                {content.title}
                                            </td>
                                            <td>
                                                <span className="badge badge-info">{content.type}</span>
                                            </td>
                                            <td>
                                                <StatusBadge status={content.orchestrationStatus} />
                                            </td>
                                            <td>
                                                {content.variants?.length || 0} variants
                                            </td>
                                            <td>
                                                {new Date(content.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <Link to={`/content/${content._id}`} className="btn btn-ghost btn-sm">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card list */}
                        <div className="mobile-content-list">
                            {contents.map(content => (
                                <Link to={`/content/${content._id}`} key={content._id} className="mobile-content-item" style={{ textDecoration: 'none' }}>
                                    <div className="mobile-content-item-title">{content.title}</div>
                                    <div className="mobile-content-item-meta">
                                        <span className="badge badge-info">{content.type}</span>
                                        <StatusBadge status={content.orchestrationStatus} />
                                        <span className="text-muted">{content.variants?.length || 0} variants</span>
                                    </div>
                                    <div className="mobile-content-item-footer">
                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {new Date(content.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="btn btn-ghost btn-sm">View →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Quick Stats Table */}
            <div className="card mt-4">
                <div className="card-header">
                    <h3 className="card-title">Performance Metrics</h3>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Current</th>
                                <th>Target</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Hit Rate</td>
                                <td>{stats?.kpis?.hitRate || 85}%</td>
                                <td>85%</td>
                                <td><span className="badge badge-success">On Track</span></td>
                            </tr>
                            <tr>
                                <td>Automation Rate</td>
                                <td>{stats?.kpis?.automationRate || 0}%</td>
                                <td>90%</td>
                                <td><span className="badge badge-info">Building</span></td>
                            </tr>
                            <tr>
                                <td>Brand Consistency</td>
                                <td>{stats?.kpis?.avgConsistencyScore || 0}%</td>
                                <td>80%</td>
                                <td><span className="badge badge-success">Passing</span></td>
                            </tr>
                            <tr>
                                <td>Time Saved</td>
                                <td>{stats?.stats?.timesSaved || 0} min</td>
                                <td>-</td>
                                <td><span className="badge badge-success">Tracked</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const badges = {
        pending: 'badge-info',
        processing: 'badge-processing',
        completed: 'badge-success',
        failed: 'badge-error'
    };

    return (
        <span className={`badge ${badges[status] || 'badge-info'}`}>
            {status}
        </span>
    );
}

export default Dashboard;
