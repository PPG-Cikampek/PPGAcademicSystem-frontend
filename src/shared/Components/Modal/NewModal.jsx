import ReactModal from "react-modal";
import {
    FiX,
    FiCheck,
    FiAlertTriangle,
    FiInfo,
    FiAlertCircle,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import LoadingCircle from "../UIElements/LoadingCircle";

// Set the app element for accessibility
if (typeof window !== "undefined") {
    ReactModal.setAppElement("#root");
}

// Helper function to format bytes to human-readable string
const formatBytes = (bytes) => {
    if (bytes === 0 || bytes === null || bytes === undefined) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const NewModal = ({
    modalState,
    onClose,
    children,
    confirmText = "OK",
    cancelText = "Batal",
    isLoading = false,
    loadingVariant = "spinner",
    progress = null,
    uploadedBytes = null,
    totalBytes = null,
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
                    buttonStyle: "btn-round-gray",
                };
            case "warning":
                return {
                    iconBg: "bg-amber-100",
                    iconColor: "text-amber-600",
                    buttonStyle: "btn-round-danger",
                };
            case "error":
                return {
                    iconBg: "bg-red-100",
                    iconColor: "text-red-600",
                    buttonStyle: "btn-round-gray",
                };
            case "confirmation":
                return {
                    iconBg: "bg-blue-100",
                    iconColor: "text-blue-600",
                    buttonStyle: "btn-round-primary",
                };
            default:
                return {
                    iconBg: "bg-gray-100",
                    iconColor: "text-gray-600",
                    buttonStyle: "btn-round-gray",
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
                base: `outline-none relative bg-white rounded-md shadow-xl w-full ${getSizeStyles()} mx-auto opacity-0 transform scale-95`,
                afterOpen: "modal-enter opacity-100 scale-100",
                beforeClose: "modal-exit opacity-0 scale-95",
            }}
            closeTimeoutMS={300}
            shouldCloseOnOverlayClick={
                !onConfirm &&
                (type === "success" || type === "error" || type === "info")
                    ? false
                    : true
            }
            shouldCloseOnEsc={
                !onConfirm &&
                (type === "success" || type === "error" || type === "info")
                    ? false
                    : true
            }
            onAfterOpen={onAfterOpen}
            onAfterClose={onAfterClose}
        >
            <div>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="top-4 right-4 z-10 absolute hover:bg-gray-100 p-1 rounded-full transition-colors"
                    aria-label="Close modal"
                >
                    <FiX className="w-5 h-5 text-gray-500" />
                </button>

                {/* Modal content */}
                <div className="p-6">
                    {/* Header with icon */}
                    <div className="flex items-center mb-6 md:mb-10">
                        <div
                            className={`
              flex items-center justify-center w-12 h-12 rounded-full mr-4
              ${typeStyles.iconBg} ${typeStyles.iconColor}
            `}
                        >
                            {getIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            {((loadingVariant === "bar" && isLoading) ||
                                title) && (
                                <h4 className="mb-1">
                                    {loadingVariant === "bar" && isLoading
                                        ? "Memroses..."
                                        : title}
                                </h4>
                            )}
                            {!(loadingVariant === "bar" && isLoading) &&
                                message && (
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                        {message}
                                    </p>
                                )}
                        </div>
                    </div>

                    {/* Custom content */}
                    {!(loadingVariant === "bar" && isLoading) && children && (
                        <div className="mb-6">{children}</div>
                    )}

                    {/* Action buttons */}
                    {!(loadingVariant === "bar" && isLoading) && (
                        <div className="flex justify-end space-x-3">
                            {showCancel && (
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="btn-round-gray"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={async () => {
                                    // If this is a confirmation modal (has onConfirm), execute it
                                    if (onConfirm) {
                                        let shouldClose = true;
                                        const result = await onConfirm();
                                        if (result === false)
                                            shouldClose = false;
                                        if (shouldClose) onClose();
                                    } else {
                                        // For notification modals (success, error, info), just close
                                        onClose();
                                    }
                                }}
                                disabled={isLoading}
                                className={`${typeStyles.buttonStyle}
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
                            >
                                {isLoading ? (
                                    <LoadingCircle>Memroses...</LoadingCircle>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    )}

                    {/* Progress bar */}
                    {isLoading &&
                        loadingVariant === "bar" &&
                        typeof progress === "number" && (
                            <div className="flex flex-col items-center gap-1 mt-4 min-w-[8rem]">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-600 text-xs">
                                        {`${Math.min(100, Math.max(0, progress))}%`}
                                    </span>
                                    {typeof uploadedBytes === "number" &&
                                        typeof totalBytes === "number" &&
                                        totalBytes > 0 && (
                                            <span className="text-gray-500 text-xs">
                                                {`(${formatBytes(uploadedBytes)} / ${formatBytes(totalBytes)})`}
                                            </span>
                                        )}
                                </div>
                                <div className="bg-gray-200 rounded-full w-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full transition-[width] animate-pulse duration-150 ease-out"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                Math.max(0, progress)
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </ReactModal>
    );
};

export default NewModal;
