const ModalFooter = ({ modal, setModalIsOpen }) => (
    <div className="flex gap-2 items-center">
        <button
            onClick={() => {
                setModalIsOpen(false);
            }}
            className={`${
                modal.onConfirm ? "btn-danger-outline" : "button-primary mt-0 "
            }`}
        >
            {modal.onConfirm ? "Batal" : "Tutup"}
        </button>
        {modal.onConfirm && (
            <button onClick={modal.onConfirm} className="button-primary mt-0 ">
                Ya
            </button>
        )}
    </div>
);

export default ModalFooter;
