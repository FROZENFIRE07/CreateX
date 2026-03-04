import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts';
import { AlertCircle, Fingerprint, ShieldAlert, Sparkles, TrendingUp, Cpu, Workflow, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

/** Tokens & Theme Constants — matches dashboard */
const COLORS = {
    bg: '#1A1A1A',
    primary: '#FF6B01',
    primaryHover: '#E85F00',
    accent: '#fb923c',
    glow: 'rgba(255,107,1,0.35)',
    glowFaint: 'rgba(255,107,1,0.08)',
    surface: '#353535',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10'
};

const DUMMY_RADAR_DATA = [
    { subject: 'Authoritative', A: 120, fullMark: 150 },
    { subject: 'Friendly', A: 98, fullMark: 150 },
    { subject: 'Playful', A: 86, fullMark: 150 },
    { subject: 'Inspirational', A: 99, fullMark: 150 },
    { subject: 'Professional', A: 130, fullMark: 150 },
    { subject: 'Casual', A: 40, fullMark: 150 },
];

export default function BrandSettings() {
    const [loading, setLoading] = useState(false);
    const [brandData, setBrandData] = useState({
        name: 'SACO Default',
        keywords: ['AI-powered', 'futuristic', 'premium', 'innovation', 'seamless', 'orchestration', 'scale'],
        driftAlert: true,
        toneData: DUMMY_RADAR_DATA
    });

    return (
        <div className={`p-6 text-slate-200 font-sans min-h-[calc(100vh-100px)] rounded-3xl ${COLORS.glass} flex flex-col`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500 flex items-center gap-3">
                        <Fingerprint className="w-8 h-8 text-orange-400" />
                        Brand Telemetry & DNA
                    </h1>
                    <p className="text-slate-400 mt-2 font-mono text-xs">MONITORING ACTIVE: REAL-TIME TONE ANALYSIS.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        className="px-5 py-2.5 rounded-xl text-white font-semibold transition-all flex items-center gap-2"
                        style={{ backgroundColor: COLORS.primary, boxShadow: `0 0 20px ${COLORS.glow}` }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryHover}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
                    >
                        <Sparkles className="w-4 h-4" /> Optimize DNA
                    </button>
                </div>
            </div>

            {/* Brand Drift Alert */}
            <AnimatePresence>
                {brandData.driftAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-4 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse" />
                        <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-1" />
                        <div>
                            <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                                Brand Drift Detected <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-[10px] text-red-300">Severity: HIGH</span>
                            </h3>
                            <p className="text-red-200/80 text-sm mt-1">
                                Recent Twitter outputs have deviated 14% away from the "Professional" baseline towards "Casual".
                                The Manager Agent is currently re-aligning the generation prompts to correct this drift.
                            </p>
                        </div>
                        <button
                            onClick={() => setBrandData(prev => ({ ...prev, driftAlert: false }))}
                            className="ml-auto px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30 transition"
                        >
                            Acknowledge & Sync
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                {/* Left Column: Radar Chart */}
                <div className={`p-6 rounded-2xl ${COLORS.glass} flex flex-col relative`}>
                    <div className="absolute -top-3 -left-3 w-20 h-20 blur-2xl rounded-full" style={{ backgroundColor: `${COLORS.primary}30` }} />
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 relative z-10">
                        <TrendingUp className="w-4 h-4" /> Tone Vector Graph
                    </h2>
                    <div className="flex-1 w-full relative z-10 text-xs font-mono">
                        <ResponsiveContainer width="100%" height={350}>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={brandData.toneData}>
                                <PolarGrid stroke="#444444" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: COLORS.bg, borderColor: '#444444' }} itemStyle={{ color: COLORS.primary }} />
                                <Radar name="Brand Baseline" dataKey="A" stroke={COLORS.primary} strokeWidth={2} fill={COLORS.primary} fillOpacity={0.35} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Keyword Cloud & Agent Stats */}
                <div className="flex flex-col gap-8">
                    {/* Concept Cloud */}
                    <div className={`p-6 rounded-2xl ${COLORS.glass} flex-1`}>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <Cpu className="w-4 h-4" /> Semantic DNA Cloud
                        </h2>
                        <div className="flex flex-wrap gap-3 justify-center items-center h-[200px] overflow-hidden">
                            {brandData.keywords.map((kw, i) => {
                                const size = Math.random() * 1.5 + 0.8;
                                const opacity = Math.random() * 0.5 + 0.5;
                                const isOrange = i % 2 === 0;
                                return (
                                    <motion.div
                                        key={kw}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: i * 0.1, type: "spring" }}
                                        className={`px-4 py-2 rounded-full border border-white/10 ${isOrange ? 'text-orange-300' : 'text-amber-300'}`}
                                        style={{
                                            fontSize: `${size}rem`,
                                            opacity,
                                            backgroundColor: isOrange ? 'rgba(255,107,1,0.1)' : 'rgba(251,191,36,0.1)'
                                        }}
                                    >
                                        {kw}
                                    </motion.div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                            <input
                                type="text"
                                placeholder="Inject new keyword into DNA..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none transition"
                                style={{ focusBorderColor: COLORS.primary }}
                                onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                            <button
                                className="px-4 py-2 rounded-lg text-sm font-bold transition"
                                style={{ backgroundColor: `${COLORS.primary}30`, color: COLORS.accent }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = `${COLORS.primary}50`}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = `${COLORS.primary}30`}
                            >
                                Inject
                            </button>
                        </div>
                    </div>

                    {/* Rules Enforcer */}
                    <div className={`p-6 rounded-2xl ${COLORS.glass}`}>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Workflow className="w-4 h-4" /> Active Enforcements
                        </h2>
                        <div className="space-y-3">
                            {[
                                "Strict zero passive voice policy across all generated copy.",
                                "Ensure maximum 2 paragraphs per LinkedIn post.",
                                "Inject 1 related industry stat if content is marked 'Authoritative'."
                            ].map((rule, i) => (
                                <div key={i} className="flex gap-3 items-start text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                                    <span className="text-slate-300">{rule}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
