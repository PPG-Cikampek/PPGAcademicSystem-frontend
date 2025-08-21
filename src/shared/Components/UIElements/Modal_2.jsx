// components/Modal.js
import { useState, useEffect } from "react";

export default function Modal_2({ isOpen, onClose, children }) {
    const [showModal, setShowModal] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
        } else {
            setTimeout(() => setShowModal(false), 300); // Match this duration to Tailwind transition
        }
    }, [isOpen]);

    if (!showModal) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-300 ${
                    isOpen ? "scale-100" : "scale-95"
                }`}
                onClick={(e) => e.stopPropagation()} // Prevents click from closing modal
            >
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 focus:outline-hidden absolute top-2 right-2"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}
