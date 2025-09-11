import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusIcon } from "lucide-react";

import useHttp from "../../shared/hooks/http-hook";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import AcademicYearList from "../components/AcademicYearList";

import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";

const AcademicYearsView = () => {
    const [expandedCards, setExpandedCards] = useState({});
    const { modalState, openModal, closeModal } = useModal();
    const [data, setData] = useState();
    const { isLoading, sendRequest, error } = useHttp();

    useEffect(() => {
        const loadLevels = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/academicYears?populate=subBranchYears`
                );
                setData(responseData);
            } catch (err) {
                // Error handled by useHttp
            }
        };
        loadLevels();
    }, [sendRequest]);

    const toggleCard = (id) => {
        setExpandedCards((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const activateYearHandler = (academicYearName, academicYearId) => {
        const confirmRegister = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/academicYears/activate/${academicYearId}`,
                    "POST",
                    null,
                    { "Content-Type": "application/json" }
                );

                openModal(
                    responseData.message,
                    "success",
                    null,
                    "Berhasil!",
                    false
                );

                const updatedData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/academicYears?populate=subBranchYears`
                );
                setData(updatedData);
            } catch (err) {}
        };

        openModal(
            `Aktivasi tahun ajaran ${academicYearFormatter(
                academicYearName
            )}?`,
            "confirmation",
            confirmRegister,
            `Konfirmasi Aktivasi`,
            true
        );
    };

    const munaqasyahStatusHandler = (
        actionType,
        academicYearName,
        academicYearId
    ) => {
        const confirmAction = async (action) => {
            const body = JSON.stringify({ munaqasyahStatus: action });
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/academicYears/munaqasyah/${academicYearId}`,
                    "PATCH",
                    body,
                    { "Content-Type": "application/json" }
                );

                openModal(
                    responseData.message,
                    "success",
                    null,
                    "Berhasil!",
                    false
                );

                const updatedData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/academicYears?populate=subBranchYears`
                );
                setData(updatedData);
            } catch (err) {
                openModal(
                    err.message,
                    "error",
                    null,
                    "Gagal!",
                    false
                );
            }
        };

        if (actionType === "start") {
            openModal(
                `Mulai munaqosah untuk tahun ajaran ${academicYearFormatter(
                    academicYearName
                )}?`,
                "confirmation",
                () => confirmAction("inProgress"),
                `Konfirmasi`,
                true
            );
        } else if (actionType === "complete") {
            openModal(
                `Selesaikan munaqosah untuk tahun ajaran ${academicYearFormatter(
                    academicYearName
                )}?`,
                "confirmation",
                () => confirmAction("completed"),
                `Konfirmasi`,
                true
            );
        }
    };

    const deleteAcademicYearHandler = (academicYearName, academicYearId) => {
        const confirmDelete = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/academicYears/${academicYearId}`,
                    "DELETE",
                    JSON.stringify({ academicYearId }),
                    { "Content-Type": "application/json" }
                );

                openModal(
                    responseData.message,
                    "success",
                    null,
                    "Berhasil!",
                    false
                );

                const updatedData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/academicYears?populate=subBranchYears`
                );
                setData(updatedData);
            } catch (err) {
                openModal(
                    err.message,
                    "error",
                    null,
                    "Gagal!",
                    false
                );
            }
        };

        openModal(
            `Hapus Tahun Ajaran: ${academicYearFormatter(
                academicYearName
            )}?`,
            "confirmation",
            confirmDelete,
            `Konfirmasi Penghapusan`,
            true
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={isLoading}
                />

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Daftar Tahun Ajaran
                    </h1>
                    <Link to="/academic/new">
                        <button className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-200">
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Tambah
                        </button>
                    </Link>
                </div>

                {(!data || isLoading) && (
                    <div className="space-y-4">
                        <SkeletonLoader
                            variant="rectangular"
                            width="100%"
                            height={140}
                            count={3}
                        />
                    </div>
                )}

                {error && <ErrorCard error={error} />}

                {data && !isLoading && (
                    <AcademicYearList
                        years={data.academicYears}
                        expandedCards={expandedCards}
                        onToggleCard={toggleCard}
                        onActivateYear={activateYearHandler}
                        onMunaqsyahStatusChange={munaqasyahStatusHandler}
                        onDeleteYear={deleteAcademicYearHandler}
                    />
                )}
            </div>
        </div>
    );
};

export default AcademicYearsView;
