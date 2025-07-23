import { useState, useCallback } from 'react';

const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((toast) => {
        const id = Date.now().toString();
        const newToast = {
            id,
            isOpen: true,
            ...toast
        };

        setToasts(prev => [...prev, newToast]);

        // Auto remove toast after duration (default 5 seconds)
        const duration = toast.duration || 5000;
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((title, message, options = {}) => {
        return showToast({ type: 'success', title, message, ...options });
    }, [showToast]);

    const showError = useCallback((title, message, options = {}) => {
        return showToast({ type: 'error', title, message, ...options });
    }, [showToast]);

    const showWarning = useCallback((title, message, options = {}) => {
        return showToast({ type: 'warning', title, message, ...options });
    }, [showToast]);

    const showInfo = useCallback((title, message, options = {}) => {
        return showToast({ type: 'info', title, message, ...options });
    }, [showToast]);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast,
        clearAll
    };
};

export default useToast;
