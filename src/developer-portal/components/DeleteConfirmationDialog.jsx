import NewModal from "../../shared/Components/Modal/NewModal";

const DeleteConfirmationDialog = ({
    open,
    title = "Hapus Data",
    description = "Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin melanjutkan?",
    onCancel,
    onConfirm,
    isProcessing = false,
}) => {
    const modalState = {
        isOpen: open,
        message: description,
        type: "confirmation",
        title,
        onConfirm,
        showCancel: true,
        size: "sm",
    };

    return (
        <NewModal
            modalState={modalState}
            onClose={onCancel}
            confirmText="Hapus"
            cancelText="Batal"
            isLoading={isProcessing}
        />
    );
};

export default DeleteConfirmationDialog;
