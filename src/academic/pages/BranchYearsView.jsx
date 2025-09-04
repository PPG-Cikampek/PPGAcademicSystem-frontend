import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import { PlusIcon } from "lucide-react";
import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import ModalFooter from "../components/ModalFooter";

import useBranchYearsHandlers from "../hooks/useBranchYearsHandlers";
import BranchYearCard from "../components/BranchYearCard";
import { useBranchYears } from "../../shared/queries";

const BranchYearsView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
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
    } = useBranchYearsHandlers(setModal, setModalIsOpen);

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

                <Modal
                    isOpen={modalIsOpen}
                    onClose={() => setModalIsOpen(false)}
                    title={modal.title}
                    footer={
                        <ModalFooter
                            onClose={() => setModalIsOpen(false)}
                            onConfirm={modal.onConfirm}
                        />
                    }
                >
                    {isLoading && (
                        <div className="flex justify-center mt-16">
                            <LoadingCircle size={32} />
                        </div>
                    )}
                    {!isLoading && modal.message}
                </Modal>

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
