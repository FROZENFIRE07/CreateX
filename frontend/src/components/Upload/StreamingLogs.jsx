/**
 * StreamingLogs Component (Polling Version)
 * Real-time display of orchestration progress using polling
 * More reliable than SSE since it uses regular authenticated API calls
 */

import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const STEP_ICONS = {
    memory: '🧠',
    plan: '📋',
    ingest: '📥',
    generate: '✨',
    review: '🔍',
    verify: '✅',
    publish: '🚀',
    complete: '🎉',
    error: '❌',
    start: '⚡',
    processing: '⟳'
};

function StreamingLogs({ contentId, onComplete }) {
    const [logs, setLogs] = useState([{ message: 'Starting orchestration...', type: 'start' }]);
    const [status, setStatus] = useState('processing');
    const [elapsed, setElapsed] = useState(0);
    const [kpis, setKpis] = useState(null);
    const logsEndRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const lastLogCountRef = useRef(0);

    // Auto-scroll to bottom
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Elapsed time counter
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Polling for status updates
    useEffect(() => {
        if (!contentId) return;

        const pollStatus = async () => {
            try {
                const res = await api.get(`/content/${contentId}/status`);
                const data = res.data;

                // Update logs from orchestrationLog
                if (data.log && data.log.length > lastLogCountRef.current) {
                    const newLogs = data.log.slice(lastLogCountRef.current);
                    lastLogCountRef.current = data.log.length;

                    setLogs(prev => [
                        ...prev,
                        ...newLogs.map(l => ({
                            message: l.details?.message || l.action || 'Processing...',
                            type: l.action || 'processing',
                            agent: l.agent,
                            timestamp: l.timestamp
                        }))
                    ]);
                }

                // Check completion status
                if (data.status === 'completed') {
                    setStatus('complete');
                    setKpis(data.kpis);
                    setLogs(prev => [...prev, {
                        message: `Orchestration complete! Published ${data.kpis?.publishedCount || 0} variants.`,
                        type: 'complete'
                    }]);

                    if (onComplete) {
                        setTimeout(() => onComplete(data), 1500);
                    }
                    return true; // Stop polling
                } else if (data.status === 'failed') {
                    setStatus('error');
                    setLogs(prev => [...prev, { message: 'Orchestration failed', type: 'error' }]);
                    return true; // Stop polling
                }

                return false; // Continue polling
            } catch (err) {
                console.error('Polling error:', err);
                return false;
            }
        };

        // Poll every 1 second
        const interval = setInterval(async () => {
            const done = await pollStatus();
            if (done) {
                clearInterval(interval);
            }
        }, 1000);

        // Initial poll
        pollStatus();

        return () => clearInterval(interval);
    }, [contentId, onComplete]);

    return (
        <div className="streaming-logs card" style={{
            maxWidth: '600px',
            width: '100%',
            margin: '0 auto',
            padding: '1.5rem'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '0.75rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {status === 'complete' ? (
                        <span style={{ fontSize: '1.25rem' }}>🎉</span>
                    ) : status === 'error' ? (
                        <span style={{ fontSize: '1.25rem' }}>❌</span>
                    ) : (
                        <span className="spinner spinner-sm"></span>
                    )}
                    <h3 style={{ margin: 0 }}>
                        {status === 'complete' ? 'Orchestration Complete!'
                            : status === 'error' ? 'Orchestration Failed'
                                : 'Orchestrating...'}
                    </h3>
                </div>
                <span className="text-muted" style={{ fontFamily: 'monospace' }}>
                    {elapsed}s
                </span>
            </div>

            {/* Logs Stream */}
            <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem'
            }}>
                {logs.map((log, i) => (
                    <div
                        key={i}
                        className="log-line"
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            marginBottom: '0.35rem',
                            opacity: 0,
                            animation: 'fadeIn 0.3s ease forwards',
                            animationDelay: `${Math.min(i * 0.05, 0.5)}s`
                        }}
                    >
                        <span style={{ flexShrink: 0 }}>
                            {STEP_ICONS[log.type] || '→'}
                        </span>
                        <span style={{
                            color: log.type === 'error' ? 'var(--color-error)'
                                : log.type === 'complete' ? 'var(--color-success)'
                                    : 'inherit'
                        }}>
                            {log.message}
                        </span>
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>

            {/* KPIs Summary (shown on complete) */}
            {kpis && (
                <div className="kpi-summary-grid" style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.5rem',
                    textAlign: 'center'
                }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                            {kpis.hitRate}%
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Hit Rate</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {kpis.publishedCount}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Published</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {kpis.processingTime}s
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Time</div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default StreamingLogs;
