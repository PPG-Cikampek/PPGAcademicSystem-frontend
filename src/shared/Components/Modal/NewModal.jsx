import ReactModal from "react-modal";
import {
    FiX,
    FiCheck,
    FiAlertTriangle,
    FiInfo,
    FiAlertCircle,
} from "react-icons/fi";
import { useState, useEffect } from "react";

// Set the app element for accessibility
if (typeof window !== "undefined") {
    ReactModal.setAppElement("#root");
}

const NewModal = ({
    modalState,
    onClose,
    children,
    confirmText = "OK",
    cancelText = "Cancel",
    isLoading = false,
}) => {
    const { isOpen, message, type, title, onConfirm, showCancel, size } =
        modalState;

    const [isAnimating, setIsAnimating] = useState(false);

    // Handle animation state
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    const onAfterOpen = () => setIsAnimating(true);
    const onAfterClose = () => setIsAnimating(false);

    // Icon mapping based on type
    const getIcon = () => {
        const iconClass = `w-6 h-6 ${
            isAnimating ? "animate-bounce-enter" : ""
        }`;

        switch (type) {
            case "success":
                return <FiCheck className={iconClass} />;
            case "warning":
                return <FiAlertTriangle className={iconClass} />;
            case "error":
                return <FiAlertCircle className={iconClass} />;
            case "confirmation":
                return <FiInfo className={iconClass} />;
            default:
                return <FiInfo className={iconClass} />;
        }
    };

    // Color scheme based on type (following Google Material Design)
    const getTypeStyles = () => {
        switch (type) {
            case "success":
                return {
                    iconBg: "bg-green-100",
                    iconColor: "text-green-600",
                    buttonBg: "bg-green-600 hover:bg-green-700",
                    buttonText: "text-white",
                };
            case "warning":
                return {
                    iconBg: "bg-amber-100",
                    iconColor: "text-amber-600",
                    buttonBg: "bg-amber-600 hover:bg-amber-700",
                    buttonText: "text-white",
                };
            case "error":
                return {
                    iconBg: "bg-red-100",
                    iconColor: "text-red-600",
                    buttonBg: "bg-red-600 hover:bg-red-700",
                    buttonText: "text-white",
                };
            case "confirmation":
                return {
                    iconBg: "bg-blue-100",
                    iconColor: "text-blue-600",
                    buttonBg: "bg-blue-600 hover:bg-blue-700",
                    buttonText: "text-white",
                };
            default:
                return {
                    iconBg: "bg-gray-100",
                    iconColor: "text-gray-600",
                    buttonBg: "bg-gray-600 hover:bg-gray-700",
                    buttonText: "text-white",
                };
        }
    };

    // Size variants
    const getSizeStyles = () => {
        switch (size) {
            case "sm":
                return "max-w-sm";
            case "lg":
                return "max-w-2xl";
            case "xl":
                return "max-w-4xl";
            default:
                return "max-w-md";
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            overlayClassName={{
                base: "fixed inset-0 flex items-center justify-center p-4 z-50 transition-all duration-300",
                afterOpen: "bg-black/50",
                beforeClose: "bg-black/0",
            }}
            className={{
                base: `outline-none relative bg-white rounded-lg shadow-xl w-full ${getSizeStyles()} mx-auto opacity-0 transform scale-95`,
                afterOpen: "modal-enter opacity-100 scale-100",
                beforeClose: "modal-exit opacity-0 scale-95",
            }}
            closeTimeoutMS={300}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            onAfterOpen={onAfterOpen}
            onAfterClose={onAfterClose}
        >
            <div>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
                    aria-label="Close modal"
                >
                    <FiX className="w-5 h-5 text-gray-500" />
                </button>

                {/* Modal content */}
                <div className="p-6">
                    {/* Header with icon */}
                    <div className="flex items-center mb-4">
                        <div
                            className={`
              flex items-center justify-center w-12 h-12 rounded-full mr-4
              ${typeStyles.iconBg} ${typeStyles.iconColor}
            `}
                        >
                            {getIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            {title && (
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {title}
                                </h3>
                            )}
                            {message && (
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                    {message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Custom content */}
                    {children && <div className="mb-6">{children}</div>}

                    {/* Action buttons */}
                    <div className="flex justify-end space-x-3">
                        {showCancel && (
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="
                  px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                  rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-blue-500 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={async () => {
                                let shouldClose = true;
                                if (onConfirm) {
                                    const result = await onConfirm();
                                    if (result === false) shouldClose = false;
                                }
                                if (shouldClose) onClose();
                            }}
                            disabled={isLoading}
                            className={`
                px-4 py-2 text-sm font-medium rounded-md focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors
                ${typeStyles.buttonBg} ${typeStyles.buttonText}
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </ReactModal>
    );
};

export default NewModal;
