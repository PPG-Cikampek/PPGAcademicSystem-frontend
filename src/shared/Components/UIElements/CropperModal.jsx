import { useEffect, useState } from "react";

const CropperModal = ({ isOpen, onClose, children }) => {
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
                    relative flex justify-center items-center w-full mx-4 transform transition-all duration-300 ease-in-out
                    ${
                        isVisible
                            ? "translate-y-0 opacity-100"
                            : "translate-y-4 opacity-0"
                    }
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

export default CropperModal;
