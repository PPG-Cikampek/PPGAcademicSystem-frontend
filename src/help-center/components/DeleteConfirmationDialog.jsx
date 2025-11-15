import NewModal from "../../shared/Components/Modal/NewModal";

const DeleteConfirmationDialog = ({
    isOpen,
    faqData,
    onConfirm,
    onCancel,
    isLoading = false,
}) => {
    const modalState = {
        isOpen,
        type: "confirmation",
        title: "Hapus Pertanyaan",
        message: faqData
            ? `FAQ "${faqData.question}" akan dihapus dari pusat bantuan. Lanjutkan?`
            : "Pertanyaan akan dihapus dari pusat bantuan. Lanjutkan?",
        showCancel: true,
        onConfirm,
        size: "sm",
    };

    return (
        <NewModal
            modalState={modalState}
            onClose={onCancel}
            confirmText="Hapus"
            cancelText="Batal"
            isLoading={isLoading}
        />
    );
};

export default DeleteConfirmationDialog;
