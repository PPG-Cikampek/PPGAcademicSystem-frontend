import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import { useCreateClassMutation } from "../../shared/queries/useTeachingGroups";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useNewModal from "../../shared/hooks/useNewModal";

const NewClassView = () => {
    const { modalState, openModal, closeModal } = useNewModal();

    const [isTransitioning, setIsTransitioning] = useState(false);
    // const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const teachingGroupId = useParams().teachingGroupId;

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
                { label: "Kelas 7", value: "Kelas 7" },
                { label: "Kelas 8", value: "Kelas 8" },
                { label: "Kelas 9", value: "Kelas 9" },
                { label: "Kelas Khusus", value: "Kelas Khusus" },
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
            openModal(
                responseData.message,
                "success",
                () => navigate(-1),
                "Berhasil!"
            );
        } catch (err) {
            openModal(err.message, "error", null, "Gagal!");
        }
    };

    return (
        <div className="m-auto mt-14 md:mt-8 max-w-md">
            <NewModal modalState={modalState} onClose={closeModal} />

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
