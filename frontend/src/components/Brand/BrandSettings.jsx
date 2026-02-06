/**
 * Brand Settings Component
 * Manage brand DNA for content consistency
 */

import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const TONE_OPTIONS = [
    'professional',
    'casual',
    'inspirational',
    'authoritative',
    'friendly',
    'formal',
    'playful'
];

function BrandSettings() {
    const [brandDNA, setBrandDNA] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [form, setForm] = useState({
        name: '',
        tone: 'professional',
        voice: '',
        values: '',
        keywords: '',
        avoidWords: '',
        targetAudience: ''
    });

    useEffect(() => {
        fetchBrandDNA();
    }, []);

    const fetchBrandDNA = async () => {
        try {
            const res = await api.get('/brand');
            if (res.data.brandDNA) {
                const b = res.data.brandDNA;
                setBrandDNA(b);
                setForm({
                    name: b.name || '',
                    tone: b.guidelines?.tone || 'professional',
                    voice: b.guidelines?.voice || '',
                    values: b.guidelines?.values?.join(', ') || '',
                    keywords: b.guidelines?.keywords?.join(', ') || '',
                    avoidWords: b.guidelines?.avoidWords?.join(', ') || '',
                    targetAudience: b.guidelines?.targetAudience || ''
                });
            }
        } catch (err) {
            console.error('Brand fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                name: form.name,
                guidelines: {
                    tone: form.tone,
                    voice: form.voice,
                    values: form.values.split(',').map(v => v.trim()).filter(Boolean),
                    keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
                    avoidWords: form.avoidWords.split(',').map(w => w.trim()).filter(Boolean),
                    targetAudience: form.targetAudience
                }
            };

            await api.post('/brand', payload);
            setSuccess('Brand DNA saved successfully!');
            fetchBrandDNA();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
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
            <div className="mb-4">
                <h1>Brand DNA</h1>
                <p className="mt-1">Define your brand voice for consistent content generation</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
                {/* Form */}
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Brand Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g., Acme Corp"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Tone of Voice</label>
                            <select
                                className="form-select"
                                value={form.tone}
                                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                            >
                                {TONE_OPTIONS.map(tone => (
                                    <option key={tone} value={tone}>
                                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Brand Voice Statement</label>
                            <textarea
                                className="form-textarea"
                                value={form.voice}
                                onChange={(e) => setForm({ ...form, voice: e.target.value })}
                                placeholder="Describe how your brand speaks. e.g., 'We communicate with clarity and confidence. We're experts who make complex topics accessible...'"
                                style={{ minHeight: '100px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Core Values</label>
                            <input
                                type="text"
                                className="form-input"
                                value={form.values}
                                onChange={(e) => setForm({ ...form, values: e.target.value })}
                                placeholder="e.g., innovation, trust, simplicity (comma-separated)"
                            />
                            <p className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                                Comma-separated list of brand values
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Must-Use Keywords</label>
                            <input
                                type="text"
                                className="form-input"
                                value={form.keywords}
                                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                                placeholder="e.g., AI-powered, seamless, innovative"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Words to Avoid</label>
                            <input
                                type="text"
                                className="form-input"
                                value={form.avoidWords}
                                onChange={(e) => setForm({ ...form, avoidWords: e.target.value })}
                                placeholder="e.g., cheap, basic, easy"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Target Audience</label>
                            <input
                                type="text"
                                className="form-input"
                                value={form.targetAudience}
                                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                                placeholder="e.g., Tech-savvy marketers aged 25-45"
                            />
                        </div>

                        {error && <p className="form-error mb-4">{error}</p>}
                        {success && (
                            <p className="text-success mb-4" style={{ fontSize: '0.875rem' }}>{success}</p>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner spinner-sm"></span>
                                    Saving...
                                </>
                            ) : (
                                'Save Brand DNA'
                            )}
                        </button>
                    </form>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Preview Card */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">Brand Preview</h3>
                        </div>
                        <div>
                            <div className="mb-2">
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>BRAND</span>
                                <p style={{ fontWeight: 600 }}>{form.name || 'Not set'}</p>
                            </div>
                            <div className="mb-2">
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>TONE</span>
                                <p><span className="badge badge-info">{form.tone}</span></p>
                            </div>
                            <div className="mb-2">
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>VALUES</span>
                                <p style={{ fontSize: '0.875rem' }}>
                                    {form.values || 'None defined'}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>AUDIENCE</span>
                                <p style={{ fontSize: '0.875rem' }}>
                                    {form.targetAudience || 'Not specified'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="card">
                        <h4 className="mb-2">Why Brand DNA?</h4>
                        <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                            Brand DNA ensures consistency across all generated content.
                            The Reviewer Agent scores every variant against your guidelines
                            (threshold: 80%) to maintain your voice across platforms.
                        </p>
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-success">✓</span>
                                <span style={{ fontSize: '0.875rem' }}>Consistent tone</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-success">✓</span>
                                <span style={{ fontSize: '0.875rem' }}>Brand keywords</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="badge badge-success">✓</span>
                                <span style={{ fontSize: '0.875rem' }}>Audience alignment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BrandSettings;
