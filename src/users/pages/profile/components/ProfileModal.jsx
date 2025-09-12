import Modal from "../../../../shared/Components/UIElements/ModalBottomClose";
import LoadingCircle from "../../../../shared/Components/UIElements/LoadingCircle";

const ProfileModal = ({ 
    isOpen, 
    modal, 
    isLoading, 
    onClose 
}) => {
    const ModalFooter = () => {
        return (
            <div className="flex gap-2 items-center">
                <button
                    onClick={onClose}
                    className={`${
                        modal.onConfirm
                            ? "btn-danger-outline"
                            : "button-primary mt-0 "
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <LoadingCircle />
                    ) : modal.onConfirm ? (
                        "Batal"
                    ) : (
                        "Tutup"
                    )}
                </button>
                {modal.onConfirm && (
                    <button
                        onClick={modal.onConfirm}
                        className={`button-primary mt-0 ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {isLoading ? <LoadingCircle /> : "Ya"}
                    </button>
                )}
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modal.title}
            footer={<ModalFooter />}
        >
            {isLoading && (
                <div className="flex justify-center">
                    <LoadingCircle size={32} />
                </div>
            )}
            {!isLoading && modal.message}
        </Modal>
    );
};

export default ProfileModal;