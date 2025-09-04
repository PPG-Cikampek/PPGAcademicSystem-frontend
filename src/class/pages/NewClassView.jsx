import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import { useCreateClassMutation } from "../../shared/queries/useTeachingGroups";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import Modal from "../../shared/Components/UIElements/ModalBottomClose";

const NewClassView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const [isTransitioning, setIsTransitioning] = useState(false);
    // const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const teachingGroupId = useParams().teachingGroupId;
    console.log("Teaching Group ID:", teachingGroupId);

    const createClassMutation = useCreateClassMutation();

    const classFields = [
        {
            name: "name",
            label: "Nama Kelas",
            type: "select",
            required: true,
            options: [
                { label: "Kelas PRA-PAUD", value: "Kelas PRA-PAUD" },
                { label: "Kelas PAUD", value: "Kelas PAUD" },
                { label: "Kelas 1", value: "Kelas 1" },
                { label: "Kelas 2", value: "Kelas 2" },
                { label: "Kelas 3", value: "Kelas 3" },
                { label: "Kelas 4", value: "Kelas 4" },
                { label: "Kelas 5", value: "Kelas 5" },
                { label: "Kelas 6", value: "Kelas 6" },
            ],
        },
        {
            name: "startTime",
            label: "Waktu Mulai",
            type: "time",
            required: true,
        },
        {
            name: "endTime",
            label: "Waktu Selesai",
            type: "time",
            required: true,
        },
    ];

    const handleFormSubmit = async (data) => {
        try {
            const responseData = await createClassMutation.mutateAsync({
                name: data.name,
                startTime: data.startTime,
                endTime: data.endTime,
                teachingGroupId,
            });
            setModal({
                title: "Berhasil!",
                message: responseData.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
        } catch (err) {
            setModal({
                title: "Gagal!",
                message: err.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
        }
    };

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false);
                    navigate(-1);
                }}
                className={`${
                    modal.onConfirm
                        ? "btn-danger-outline"
                        : "button-primary mt-0 "
                }`}
            >
                {modal.onConfirm ? "Batal" : "Tutup"}
            </button>
            {modal.onConfirm && (
                <button
                    onClick={modal.onConfirm}
                    className="button-primary mt-0 "
                >
                    Ya
                </button>
            )}
        </div>
    );

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            <Modal
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                title={modal.title}
                footer={<ModalFooter />}
            >
                {createClassMutation.isPending && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {!createClassMutation.isPending && modal.message}
            </Modal>

            {createClassMutation.error && (
                <ErrorCard
                    error={createClassMutation.error}
                    onClear={() => createClassMutation.reset()}
                />
            )}

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                <DynamicForm
                    title="Tambah Kelas"
                    subtitle={"Sistem Akademik Digital"}
                    fields={classFields}
                    onSubmit={handleFormSubmit}
                    disabled={createClassMutation.isPending}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    createClassMutation.isPending
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={createClassMutation.isPending}
                            >
                                {createClassMutation.isPending ? (
                                    <LoadingCircle>Processing...</LoadingCircle>
                                ) : (
                                    "Tambah"
                                )}
                            </button>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default NewClassView;
