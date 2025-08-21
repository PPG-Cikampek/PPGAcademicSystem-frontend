import { useState } from "react";

import useHttp from "../../../../shared/hooks/http-hook";

import DynamicForm from "../../../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../../../shared/Components/UIElements/LoadingCircle";
import { useNavigate, useParams } from "react-router-dom";

const EditAttendanceConfirmation = () => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { isLoading, error, sendRequest } = useHttp();

    const navigate = useNavigate();

    const attendanceId = useParams().attendanceId;

    const editFields = [
        {
            name: "editReason",
            label: "Alasan Mengubah Data?",
            placeholder: "Karena lupa mengabsen...",
            type: "text",
            required: true,
        },
    ];

    const handleFormSubmit = async (data) => {
        console.log("submitting...");

        const url = `${import.meta.env.VITE_BACKEND_URL}/academicYears`;

        const body = JSON.stringify({
            name: data.name,
        });

        // console.log(body)
        let responseData;
        try {
            // responseData = await sendRequest(url, 'POST', body, {
            //     'Content-Type': 'application/json'
            // });
        } catch (err) {
            // Error is already handled by useHttp
        }

        navigate(`/attendance/history/class/edit/${attendanceId}`);
    };

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            {error && (
                <ErrorCard error={error} onClear={() => setError(null)} />
            )}

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                <DynamicForm
                    // title='Tambah Tahun Ajaran'
                    subtitle={"Konfirmasi Ubah Data"}
                    fields={editFields}
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
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <LoadingCircle>Processing...</LoadingCircle>
                                ) : (
                                    "Ya"
                                )}
                            </button>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default EditAttendanceConfirmation;
