import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

const Toast = ({
    isOpen,
    onClose,
    type = "info",
    title,
    message,
    duration = 5000,
    position = "top-right",
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            if (duration > 0) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen, duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Match transition duration
    };

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "error":
                return <XCircle className="h-5 w-5 text-red-500" />;
            case "warning":
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getColorClasses = () => {
        switch (type) {
            case "success":
                return "bg-green-50 border-green-200";
            case "error":
                return "bg-red-50 border-red-200";
            case "warning":
                return "bg-yellow-50 border-yellow-200";
            default:
                return "bg-blue-50 border-blue-200";
        }
    };

    const getPositionClasses = () => {
        switch (position) {
            case "top-left":
                return "top-4 left-4";
            case "top-center":
                return "top-4 left-1/2 transform -translate-x-1/2";
            case "top-right":
                return "top-4 right-4";
            case "bottom-left":
                return "bottom-4 left-4";
            case "bottom-center":
                return "bottom-4 left-1/2 transform -translate-x-1/2";
            case "bottom-right":
                return "bottom-4 right-4";
            default:
                return "top-4 right-4";
        }
    };

    if (!isOpen && !isVisible) return null;

    return (
        <div
            className={`
                fixed z-50 max-w-sm w-full transition-all duration-300 ease-in-out
                ${getPositionClasses()}
                ${
                    isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-2"
                }
            `}
        >
            <div
                className={`
                rounded-lg border p-4 shadow-lg ${getColorClasses()}
            `}
            >
                <div className="flex items-start">
                    <div className="flex-shrink-0">{getIcon()}</div>
                    <div className="ml-3 flex-1">
                        {title && (
                            <h3 className="text-sm font-medium text-gray-900">
                                {title}
                            </h3>
                        )}
                        {message && (
                            <p
                                className={`text-sm text-gray-700 ${
                                    title ? "mt-1" : ""
                                }`}
                            >
                                {message}
                            </p>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="inline-flex rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast;
