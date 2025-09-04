import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import Modal from "../../shared/Components/UIElements/ModalBottomClose";

const UpdateClassView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadedClass, setLoadedClass] = useState();

    const classId = useParams().classId;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/classes/${classId}`
                );
                setLoadedClass(responseData.class);
            } catch (err) {}
        };
        fetchClass();
    }, [sendRequest, classId]);

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
            value: loadedClass?.name || "",
        },
        {
            name: "startTime",
            label: "Waktu Mulai",
            type: "time",
            required: true,
            value: loadedClass?.startTime || "",
        },
        {
            name: "endTime",
            label: "Waktu Selesai",
            type: "time",
            required: true,
            value: loadedClass?.endTime || "",
        },
    ];

    const handleFormSubmit = async (data) => {
        console.log("Updating class...");
        const url = `${import.meta.env.VITE_BACKEND_URL}/classes/${classId}`;

        const body = JSON.stringify({
            name: data.name,
            startTime: data.startTime,
            endTime: data.endTime,
        });

        console.log(body);

        let responseData;
        try {
            responseData = await sendRequest(url, "PATCH", body, {
                "Content-Type": "application/json",
            });
        } catch (err) {
            setModal({
                title: "Gagal!",
                message: err.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
            return;
        }

        setModal({
            title: "Berhasil!",
            message: responseData.message,
            onConfirm: null,
        });
        setModalIsOpen(true);
    };

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false);
                    !error && navigate(-1);
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
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {!isLoading && modal.message}
            </Modal>

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                {error && (
                    <div className="px-2">
                        <ErrorCard
                            error={error}
                            onClear={() => setError(null)}
                        />
                    </div>
                )}

                <DynamicForm
                    title="Update Kelas"
                    subtitle="Sistem Akademik Digital"
                    fields={classFields}
                    onSubmit={handleFormSubmit}
                    disabled={isLoading}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    isLoading
                                        ? "opacity-50 hover:cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <LoadingCircle>Processing...</LoadingCircle>
                                ) : (
                                    "Update"
                                )}
                            </button>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default UpdateClassView;
