import { useEffect, useState } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = "hidden";
        } else {
            setIsVisible(false);
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
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
                    ${isVisible ? "opacity-50" : "opacity-0"}
                `}
            />

            {/* Modal with slide-in and fade-in */}
            <div
                className={`
                    relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl 
                    transform transition-all duration-300 ease-in-out
                    ${
                        isVisible
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button onClick={handleClose} className="btn-sqr-danger">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
