import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import useHttp from "../../shared/hooks/http-hook";
import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";

import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";

const NewBranchYearsView = () => {
    const { modalState, openModal, closeModal } = useModal();
    const [academicYears, setAcademicYears] = useState();
    const { isLoading, error, sendRequest, setError } = useHttp();

    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const targetBranchId = auth.userBranchId;

    useEffect(() => {
        const loadYears = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/academicYears?populate=branchYears`
                );
                setAcademicYears(responseData.academicYears);
            } catch (err) {
                // Error handled by useHttp
            }
        };
        loadYears();
    }, [sendRequest]);

    const registerYearHandler = (academicYearName, academicYearId) => {
        const confirmRegister = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/branchYears`;
            const body = JSON.stringify({
                name: academicYearName,
                branchId: auth.userBranchId,
                academicYearId,
            });
            let responseData;
            try {
                responseData = await sendRequest(url, "POST", body, {
                    "Content-Type": "application/json",
                });
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
                    }/academicYears?populate=branchYears`
                );
                setAcademicYears(updatedData.academicYears);
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
            `Daftarkan tahun ajaran ${academicYearFormatter(
                academicYearName
            )}?`,
            "confirmation",
            confirmRegister,
            `Konfirmasi Pendaftaran`,
            true
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">
                    Daftarkan Tahun Ajaran ke Kelompok
                </h1>
                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={isLoading}
                />

                {(!academicYears || isLoading) && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {academicYears && !isLoading && (
                    <>
                        {academicYears.length === 0 && (
                            <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                                <p className="text-gray-700 text-center">
                                    Daerah belum membuat tahun ajaran. Hubungi
                                    Operator Daerah!
                                </p>
                            </div>
                        )}
                        {academicYears.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {academicYears.map((year) => {
                                    const hasTargetBranch =
                                        year.branchYears.some(
                                            (branchYear) =>
                                                branchYear.branchId.id ===
                                                targetBranchId
                                        );

                                    return (
                                        <div
                                            key={year._id}
                                            className={`p-4 border rounded-lg transition-all duration-300 ${
                                                hasTargetBranch
                                                    ? "bg-gray-100 border-gray-300 text-gray-500 hover:cursor-not-allowed"
                                                    : "bg-white border-gray-200 hover:ring-4 hover:ring-blue-200 hover:border-blue-500 hover:shadow-xl cursor-pointer"
                                            }`}
                                            onClick={
                                                !hasTargetBranch
                                                    ? () =>
                                                          registerYearHandler(
                                                              year.name,
                                                              year.id
                                                          )
                                                    : undefined
                                            }
                                        >
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-lg font-semibold">
                                                    {academicYearFormatter(
                                                        year.name
                                                    )}
                                                </h2>
                                                {hasTargetBranch && (
                                                    <span className="text-sm font-base text-gray-500">
                                                        Terdaftar ✓
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NewBranchYearsView;
