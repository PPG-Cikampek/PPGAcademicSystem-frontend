import { useState } from "react";

const useModal = () => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        message: "",
        type: "info",
        title: "",
        onConfirm: null,
        showCancel: false,
        size: "md",
    });

    const openModal = (
        message,
        type = "info",
        onConfirm = null,
        title = "",
        showCancel = false,
        size = "md"
    ) => {
        setModalState({
            isOpen: true,
            message,
            type,
            title,
            onConfirm,
            showCancel,
            size,
        });
    };

    const closeModal = () => {
        setModalState((prev) => ({
            ...prev,
            isOpen: false,
        }));
    };

    const handleConfirm = () => {
        if (modalState.onConfirm) {
            modalState.onConfirm();
        }
        closeModal();
    };

    return {
        modalState,
        openModal,
        closeModal,
        handleConfirm,
    };
};

export default useModal;
