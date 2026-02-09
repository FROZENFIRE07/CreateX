/**
 * Toast Wrapper Component
 * Configures react-hot-toast with SACO theme
 */

import { Toaster, toast } from 'react-hot-toast';

// Custom styled toaster component
export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            gutter={12}
            containerStyle={{
                top: 80, // Below navbar
            }}
            toastOptions={{
                // Base styles for all toasts
                style: {
                    background: '#1a1a24',
                    color: '#f1f1f1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                },
                // Success toast
                success: {
                    iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #10b981',
                    },
                },
                // Error toast
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #ef4444',
                    },
                },
                // Loading toast
                loading: {
                    iconTheme: {
                        primary: '#6366f1',
                        secondary: '#fff',
                    },
                    style: {
                        borderLeft: '4px solid #6366f1',
                    },
                },
                // Duration
                duration: 4000,
            }}
        />
    );
}

// Helper functions for consistent toast usage
export const showToast = {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    loading: (message) => toast.loading(message),
    dismiss: (toastId) => toast.dismiss(toastId),

    // Promise wrapper for async actions
    promise: (promise, messages) => toast.promise(promise, {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong',
    }),

    // Custom toast with icon
    custom: (message, icon) => toast(message, { icon }),

    // Info toast (custom)
    info: (message) => toast(message, {
        icon: 'ℹ️',
        style: {
            borderLeft: '4px solid #6366f1',
        },
    }),

    // Warning toast
    warning: (message) => toast(message, {
        icon: '⚠️',
        style: {
            borderLeft: '4px solid #f59e0b',
        },
    }),

    // AI/Agent toast
    agent: (message) => toast(message, {
        icon: '🎯',
        style: {
            borderLeft: '4px solid #8b5cf6',
        },
    }),

    // Celebration toast (for successes like content generation)
    celebrate: (message) => toast.success(message, {
        icon: '🎉',
        duration: 5000,
        style: {
            borderLeft: '4px solid #10b981',
            background: 'linear-gradient(135deg, #1a1a24 0%, #1e2a1e 100%)',
        },
    }),
};

export { toast };
export default ToastProvider;
