/**
 * Manager Panel Component
 * 
 * IDE-style assistant panel for natural language content management.
 * Replaces the workflow log sidebar in ContentDetail.
 * 
 * Features:
 * - Single multiline text input
 * - Streaming response display
 * - Status indicator (idle, thinking, executing)
 * - Auto-scroll to latest messages
 */

import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import ConfirmationModal from './ConfirmationModal';

const ManagerPanel = ({ contentId, onVariantsUpdated }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, thinking, executing
    const [isConnected, setIsConnected] = useState(true); // Always show as connected (uses API)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });
    const messagesEndRef = useRef(null);
    const onVariantsUpdatedRef = useRef(onVariantsUpdated);

    // Keep callback ref updated
    useEffect(() => {
        onVariantsUpdatedRef.current = onVariantsUpdated;
    }, [onVariantsUpdated]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (content, type = 'system') => {
        setMessages(prev => [...prev, {
            content,
            type
        }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || status !== 'idle') return;

        const userMessage = input.trim();
        setInput('');
        addMessage(userMessage, 'user');
        setStatus('thinking');

        try {
            const response = await api.post('/manager/interact', {
                contentId,
                message: userMessage
            });

            if (response.data.success) {
                if (response.data.requiresConfirmation) {
                    // Open confirmation modal
                    setConfirmModal({
                        isOpen: true,
                        message: response.data.confirmationMessage,
                        pendingAction: response.data.classification,
                        dryRunSummary: response.data.validation?.dryRunSummary,
                        skippedVariants: response.data.validation?.skippedVariants || [],
                        allowForceOverwrite: response.data.validation?.skippedVariants?.length > 0
                    });
                    addMessage(response.data.confirmationMessage, 'confirm');
                    setStatus('idle');
                } else {
                    // Show result message if available
                    const resultMsg = response.data.result?.message ||
                        response.data.message ||
                        'Done!';
                    addMessage(resultMsg, 'assistant');
                    setStatus('idle');

                    // Refresh variants if action was pipeline or image related
                    if (response.data.result?.action &&
                        ['pipeline_complete', 'images_regenerated', 'variant_refined'].includes(response.data.result.action)) {
                        if (onVariantsUpdatedRef.current) {
                            onVariantsUpdatedRef.current();
                        }
                    }
                }
            } else {
                addMessage(`Error: ${response.data.error}`, 'error');
                setStatus('idle');
            }
        } catch (err) {
            console.error('[ManagerPanel] Submit error:', err);
            addMessage(`Failed to process request: ${err.message}`, 'error');
            setStatus('idle');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit(e);
        }
    };

    const getStatusIndicator = () => {
        switch (status) {
            case 'thinking':
                return <span className="manager-status thinking">🤔 Thinking...</span>;
            case 'executing':
                return <span className="manager-status executing">⚡ Executing...</span>;
            default:
                return <span className="manager-status idle">✨ Ready</span>;
        }
    };

    return (
        <div className="card manager-panel" style={{ position: 'sticky', top: '80px' }}>
            <div className="card-header">
                <h3 className="card-title">Manager Agent</h3>
                <div className="manager-header-status">
                    {isConnected ? (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Connected</span>
                    ) : (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Reconnecting...</span>
                    )}
                </div>
            </div>

            {/* Messages Stream */}
            <div className="manager-stream">
                {messages.length === 0 ? (
                    <div className="manager-empty">
                        <p className="text-muted">
                            Hi! I can help you transform and refine your content.
                        </p>
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            Try: "Turn this into a Twitter thread" or "Make the LinkedIn post shorter"
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`manager-message manager-message-${msg.type}`}>
                            <span className="manager-message-content">{msg.content}</span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Status Indicator */}
            <div className="manager-status-bar">
                {getStatusIndicator()}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="manager-input-form">
                <textarea
                    className="manager-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What would you like to do?"
                    rows={2}
                    disabled={status !== 'idle'}
                />
                <button
                    type="submit"
                    className="btn btn-primary manager-submit"
                    disabled={!input.trim() || status !== 'idle'}
                >
                    {status === 'idle' ? 'Send' : '...'}
                </button>
            </form>
            <p className="manager-hint text-muted">Ctrl+Enter to send</p>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false })}
                onConfirm={(result) => {
                    addMessage('Action confirmed, executing...', 'system');
                    setStatus('executing');
                    if (onVariantsUpdated) {
                        setTimeout(onVariantsUpdated, 1000);
                    }
                }}
                contentId={contentId}
                pendingAction={confirmModal.pendingAction}
                message={confirmModal.message}
                dryRunSummary={confirmModal.dryRunSummary}
                skippedVariants={confirmModal.skippedVariants}
                allowForceOverwrite={confirmModal.allowForceOverwrite}
            />
        </div>
    );
};

export default ManagerPanel;

