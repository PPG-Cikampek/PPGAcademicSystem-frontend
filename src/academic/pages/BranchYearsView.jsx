import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import { PlusIcon } from "lucide-react";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import useModal from "../../shared/hooks/useNewModal";
import NewModal from "../../shared/Components/Modal/NewModal";

import useBranchYearsHandlers from "../hooks/useBranchYearsHandlers";
import BranchYearCard from "../components/BranchYearCard";
import { useBranchYears } from "../../shared/queries";
import { useTeachingGroupHandlers } from "../../teaching-group/hooks/useTeachingGroupHandlers";

const BranchYearsView = () => {
    const { modalState, openModal, closeModal, handleConfirm } = useModal();
    const [expandedId, setExpandedId] = useState(null);
    const [error, setError] = useState(null);

    const auth = useContext(AuthContext);

    const {
        data: branchYears,
        isLoading,
        error: queryError,
    } = useBranchYears(auth?.userBranchId, {
        enabled: !!auth?.userBranchId,
    });

    useEffect(() => {
        if (queryError) setError(queryError?.message || String(queryError));
        else setError(null);
    }, [queryError]);

    const {
        activateYearHandler,
        deactivateYearHandler,
        deleteBranchYearHandler,
        deleteTeachingGroupHandler,
        editTeachingGroupHandler,
    } = useBranchYearsHandlers(openModal, closeModal);

    

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Daftar Tahun Ajaran{" "}
                        {auth.userRole === "branchAdmin" ? "Desa" : ""}
                    </h1>
                    {auth.userRole === "branchAdmin" && (
                        <Link to="/academic/new">
                            <button className="button-primary pl-[8px]">
                                <PlusIcon className="w-4 h-4 mr-1" />
                                Tambah
                            </button>
                        </Link>
                    )}
                </div>

                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={false}
                />

                {(!branchYears || isLoading) && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {error && (
                    <ErrorCard error={error} onClear={() => setError(null)} />
                )}

                {branchYears && !isLoading && (
                    <>
                        {(!branchYears.branchYears ||
                            branchYears.branchYears.length === 0) && (
                            <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                                <p className="text-gray-700 text-center">
                                    Belum ada tahun ajaran terdaftar.
                                </p>
                            </div>
                        )}

                        {branchYears.branchYears &&
                            branchYears.branchYears.length > 0 && (
                                <div className="flex flex-col items-stretch gap-4">
                                    {branchYears.branchYears.map((year) => (
                                        <BranchYearCard
                                            key={year._id}
                                            year={year}
                                            expandedId={expandedId}
                                            setExpandedId={setExpandedId}
                                            activateYearHandler={
                                                activateYearHandler
                                            }
                                            deactivateYearHandler={
                                                deactivateYearHandler
                                            }
                                            deleteBranchYearHandler={
                                                deleteBranchYearHandler
                                            }
                                            deleteTeachingGroupHandler={
                                                deleteTeachingGroupHandler
                                            }
                                            editTeachingGroupHandler={
                                                editTeachingGroupHandler
                                            }
                                            openModal={openModal}
                                            auth={auth}
                                        />
                                    ))}
                                </div>
                            )}
                    </>
                )}
            </main>
        </div>
    );
};

export default BranchYearsView;
