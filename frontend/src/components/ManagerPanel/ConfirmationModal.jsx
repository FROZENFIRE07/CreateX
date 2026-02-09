/**
 * Confirmation Modal Component
 * 
 * Modal dialog for Manager Agent confirmations.
 * Used for:
 * - Ambiguous intent clarification
 * - Force overwrite of protected variants
 * - Destructive action confirmation
 */

import React, { useState } from 'react';
import api from '../../services/api';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    contentId,
    pendingAction,
    message,
    dryRunSummary,
    skippedVariants = [],
    allowForceOverwrite = false
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [forceOverwrite, setForceOverwrite] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const response = await api.post('/manager/confirm', {
                contentId,
                confirmed: true,
                pendingAction,
                forceOverwrite
            });

            if (response.data.success) {
                onConfirm?.(response.data);
            }
            onClose();
        } catch (error) {
            console.error('[ConfirmationModal] Error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        try {
            await api.post('/manager/confirm', {
                contentId,
                confirmed: false
            });
        } catch (error) {
            console.error('[ConfirmationModal] Cancel error:', error);
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleCancel}>
            <div className="confirmation-modal" onClick={e => e.stopPropagation()}>
                <div className="confirmation-modal-header">
                    <h3>⚠️ Confirm Action</h3>
                    <button className="modal-close" onClick={handleCancel}>×</button>
                </div>

                <div className="confirmation-modal-body">
                    <p className="confirmation-message">{message}</p>

                    {dryRunSummary && (
                        <div className="dry-run-summary">
                            <strong>Summary:</strong>
                            <p>{dryRunSummary}</p>
                        </div>
                    )}

                    {skippedVariants.length > 0 && (
                        <div className="skipped-variants">
                            <strong>Protected variants (will be skipped):</strong>
                            <ul>
                                {skippedVariants.map((v, i) => (
                                    <li key={i}>
                                        <span className="platform">{v.platform}</span>
                                        <span className="reason">({v.reason})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {allowForceOverwrite && skippedVariants.length > 0 && (
                        <div className="force-overwrite-option">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={forceOverwrite}
                                    onChange={(e) => setForceOverwrite(e.target.checked)}
                                />
                                <span>Force overwrite protected variants</span>
                            </label>
                            <p className="warning-text">
                                ⚠️ This will overwrite user-modified content and cannot be undone.
                            </p>
                        </div>
                    )}
                </div>

                <div className="confirmation-modal-footer">
                    <button
                        className="btn btn-secondary"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
