import { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";

const UpdateAcademicYearView = () => {
    const { modalState, openModal, closeModal } = useModal();
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadedAcademicYear, setLoadedAcademicYear] = useState();

    const academicYearId = useParams().academicYearId;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAcademicYear = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/academicYears/${academicYearId}`
                );
                setLoadedAcademicYear(responseData.academicYear);
            } catch (err) {}
        };
        fetchAcademicYear();
    }, [sendRequest]);

    const handleFormSubmit = async (data) => {
        console.log("Updating ... ");
        const url = `${
            import.meta.env.VITE_BACKEND_URL
        }/academicYears/${academicYearId}`;

        const body = JSON.stringify({
            name: data.name,
        });

        console.log(body);

        let responseData;
        try {
            responseData = await sendRequest(url, "PATCH", body, {
                "Content-Type": "application/json",
            });
        } catch (err) {
            openModal(
                err.message,
                "error",
                null,
                "Gagal!",
                false
            );
            return;
        }

        openModal(
            responseData.message,
            "success",
            () => {
                navigate(-1);
                return false; // Prevent immediate redirect
            },
            "Berhasil!",
            false
        );
    };

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={isLoading}
            />

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
                    title={`Aktifkan Tahun Ajaran`}
                    subtitle={`Sistem Akademik Digital`}
                    fields={[
                        {
                            name: "name",
                            label: "Nama Tahun Ajaran",
                            type: "text",
                            required: false,
                            value: loadedAcademicYear?.name || "",
                        },
                    ]}
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

export default UpdateAcademicYearView;
