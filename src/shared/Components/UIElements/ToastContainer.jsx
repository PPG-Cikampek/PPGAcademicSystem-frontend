import React from 'react';
import Toast from './Toast';

const ToastContainer = ({ toasts = [], onRemoveToast }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    isOpen={toast.isOpen}
                    onClose={() => onRemoveToast(toast.id)}
                    type={toast.type}
                    title={toast.title}
                    message={toast.message}
                    duration={toast.duration}
                    position={toast.position}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
