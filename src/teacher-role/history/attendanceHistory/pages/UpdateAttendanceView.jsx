import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    useAttendance,
    useUpdateAttendanceMutation,
} from "../../../../shared/queries";
import DynamicForm from "../../../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../../../shared/Components/UIElements/LoadingCircle";

import NewModal from "../../../../shared/Components/Modal/NewModal";
import useModal from "../../../../shared/hooks/useNewModal";

const UpdateAttendanceView = () => {
    const [isTransitioning, setIsTransitioning] = useState(false);

    const attendanceId = useParams().attendanceId;
    const navigate = useNavigate();

    const { modalState, openModal, closeModal } = useModal();

    const {
        data: loadedAttendance,
        isLoading: fetchLoading,
        error: fetchError,
    } = useAttendance(attendanceId);
    const updateMutation = useUpdateAttendanceMutation();

    const handleFormSubmit = async (data) => {
        console.log("Updating ... ");

        const updates = [
            {
                attendanceId: loadedAttendance.id,
                status: data.status,
                attributes: data.attributes,
                updateReason: data.updateReason,
                timestamp: Date.now(),
            },
        ];

        console.log(updates);

        updateMutation.mutate(updates, {
            onSuccess: (responseData) => {
                openModal(
                    responseData.message,
                    "success",
                    () => navigate(-1),
                    "Berhasil!",
                    false
                );
            },
        });
    };

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            <NewModal modalState={modalState} onClose={closeModal} />

            {(fetchError || updateMutation.error) && (
                <ErrorCard
                    error={fetchError || updateMutation.error}
                    onClear={() => {}}
                />
            )}

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                <DynamicForm
                    subtitle={"Edit Data Absen"}
                    fields={[
                        {
                            name: "name",
                            label: "Nama Lengkap",
                            type: "text",
                            required: false,
                            disabled: true,
                            value: loadedAttendance?.studentId?.name || "",
                        },
                        {
                            name: "status",
                            label: "Status Kehadiran",
                            type: "select",
                            required: true,
                            value: loadedAttendance?.status || "",
                            options: [
                                { label: "Hadir", value: "Hadir" },
                                { label: "Terlambat", value: "Terlambat" },
                                { label: "Izin", value: "Izin" },
                                { label: "Sakit", value: "Sakit" },
                                {
                                    label: "Tanpa Keterangan",
                                    value: "Tanpa Keterangan",
                                },
                            ],
                        },
                        {
                            name: "updateReason",
                            label: "Alasan Mengubah Data",
                            type: "textarea",
                            required: true,
                            textAreaRows: 3,
                        },
                    ]}
                    onSubmit={handleFormSubmit}
                    disabled={fetchLoading || updateMutation.isPending}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    fetchLoading || updateMutation.isPending
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={
                                    fetchLoading || updateMutation.isPending
                                }
                            >
                                {fetchLoading || updateMutation.isPending ? (
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

export default UpdateAttendanceView;
