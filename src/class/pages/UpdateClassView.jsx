import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useClass, useUpdateClassMutation } from "../../shared/queries";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useNewModal from "../../shared/hooks/useNewModal";

const UpdateClassView = () => {
    const { modalState, openModal, closeModal } = useNewModal();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const classId = useParams().classId;
    const navigate = useNavigate();

    const {
        data: loadedClass,
        isLoading: isFetching,
        error: fetchError,
    } = useClass(classId);

    const updateMutation = useUpdateClassMutation({
        onSuccess: (data) => {
            openModal(data.message, "success", () => navigate(-1), "Berhasil!");
        },
        onError: (error) => {
            openModal(error.message, "error", null, "Gagal!");
        },
    });

    const classFields = useMemo(
        () => [
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
                disabled: true,
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
        ],
        [loadedClass]
    );

    const handleFormSubmit = async (data) => {
        console.log("Updating class...");
        updateMutation.mutate({
            classId,
            name: data.name,
            startTime: data.startTime,
            endTime: data.endTime,
        });
    };

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            <NewModal modalState={modalState} onClose={closeModal} />

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                {fetchError && (
                    <div className="px-2">
                        <ErrorCard error={fetchError} />
                    </div>
                )}

                <DynamicForm
                    title="Update Kelas"
                    subtitle="Sistem Akademik Digital"
                    fields={classFields}
                    onSubmit={handleFormSubmit}
                    disabled={isFetching || updateMutation.isPending}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    isFetching || updateMutation.isPending
                                        ? "opacity-50 hover:cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={
                                    isFetching || updateMutation.isPending
                                }
                            >
                                {updateMutation.isPending ? (
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
