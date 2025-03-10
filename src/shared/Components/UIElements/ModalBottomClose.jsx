import React, { useEffect, useState } from 'react';

const DefaultFooter = ({ onClose, onConfirm, confirmText, cancelText, isLoading }) => (
    <div className="flex gap-2 items-center">
        <button
            onClick={onClose}
            disabled={isLoading}
            className={`${onConfirm ? 'btn-danger-outline' : 'button-primary mt-0'} disabled:opacity-50`}
        >
            {cancelText || (onConfirm ? 'Batal' : 'Tutup')}
        </button>
        {onConfirm && (
            <button
                onClick={onConfirm}
                disabled={isLoading}
                className="button-primary mt-0 disabled:opacity-50"
            >
                {confirmText || 'Ya'}
            </button>
        )}
    </div>
);

const Modal = ({ isOpen, onClose, title, children, footer, confirmText, cancelText, onConfirm, isLoading }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Delay to match the duration of the transition
    };

    if (!isOpen && !isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={handleClose}
        >
            {/* Backdrop with fade-in */}
            <div
                className={`
                    absolute inset-0 bg-black transition-opacity duration-300 ease-in-out
                    ${isVisible ? 'opacity-50' : 'opacity-0'}
                `}
            />

            {/* Modal with slide-in and fade-in */}
            <div
                className={`
                    relative w-full max-w-md md:max-w-2xl mx-4 bg-white rounded-lg shadow-xl 
                    transform transition-all duration-300 ease-in-out
                    ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b">
                    <h2 className="text-lg font-medium">{title}</h2>
                </div>

                {/* Content */}
                <div className="p-4">
                    {children}
                </div>

                {/* Footer */}
                {(footer || onConfirm) && (
                    <div className="flex justify-end p-4 border-t">
                        {footer || (
                            <DefaultFooter
                                onClose={onClose}
                                onConfirm={onConfirm}
                                confirmText={confirmText}
                                cancelText={cancelText}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
