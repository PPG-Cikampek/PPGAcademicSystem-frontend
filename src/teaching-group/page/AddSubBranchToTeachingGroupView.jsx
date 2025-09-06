import { useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    useBranchSubBranches,
    useRegisterSubBranchToTeachingGroupMutation,
} from "../../shared/queries/useTeachingGroups";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import useModal from "../../shared/hooks/useNewModal";

import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";

const AddSubBranchToTeachingGroupView = () => {
    const { modalState, openModal, closeModal } = useModal();

    const targetTeachingGroupId = useParams().teachingGroupId;

    const location = useLocation();

    const auth = useContext(AuthContext);

    // Fetch sub-branches for the current branch
    const {
        data: subBranches,
        isLoading: isSubsLoading,
        refetch: refetchSubBranches,
    } = useBranchSubBranches(auth?.userBranchId, {
        // refetchOnMount: 'always',
        // refetchOnWindowFocus: true,
    });

    // Mutation: register a sub-branch to the teaching group
    const registerMutation = useRegisterSubBranchToTeachingGroupMutation();

    const registerSubBranchHandler = (subBranchName, subBranchId) => {
        const confirmRegister = async () => {
            try {
                const responseData = await registerMutation.mutateAsync({
                    name: subBranchName,
                    teachingGroupId: targetTeachingGroupId,
                    subBranchId,
                    branchId: auth?.userBranchId,
                });
                openModal(
                    responseData.message,
                    "success",
                    null,
                    "Berhasil!",
                    false,
                    "md"
                );
                // Ensure both lists reflect the change
                await refetchSubBranches();
                return false;
            } catch (err) {
                openModal(
                    err?.message || "Terjadi kesalahan",
                    "error",
                    null,
                    "Gagal!",
                    false,
                    "md"
                );
                return false;
            }
        };
        openModal(
            `Daftarkan kelompok ${subBranchName}?`,
            "confirmation",
            confirmRegister,
            "Konfirmasi Pendaftaran",
            true,
            "md"
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">
                    Daftarkan Kelompok ke KBM
                </h1>
                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={registerMutation.isPending}
                />

                {(!subBranches || isSubsLoading) && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {subBranches && !isSubsLoading && (
                    <>
                        {subBranches.length === 0 && (
                            <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                                <p className="text-gray-700 text-center">
                                    Tidak Ada Kelompok di Desa Ini!
                                </p>
                            </div>
                        )}
                        {subBranches.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subBranches.map((subBranch) => {
                                    const hasEnrolled =
                                        subBranch.teachingGroups.includes(
                                            targetTeachingGroupId
                                        );

                                    return (
                                        <div
                                            key={subBranch._id}
                                            // className={`p-4 border rounded-lg transition-all duration-300 bg-white border-gray-200 hover:ring-4 hover:ring-blue-200 hover:border-blue-500 hover:shadow-xl cursor-pointer`}
                                            className={`p-4 border rounded-lg transition-all duration-300 ${
                                                hasEnrolled
                                                    ? "bg-gray-100 border-gray-300 text-gray-500 hover:cursor-not-allowed"
                                                    : "bg-white border-gray-200 hover:ring-4 hover:ring-blue-200 hover:border-blue-500 hover:shadow-xl cursor-pointer"
                                            }`}
                                            onClick={
                                                !hasEnrolled
                                                    ? () =>
                                                          registerSubBranchHandler(
                                                              subBranch.name,
                                                              subBranch.id
                                                          )
                                                    : undefined
                                            }
                                        >
                                            <div className="flex justify-between items-center">
                                                <p className="text-lg font-semibold">
                                                    {subBranch?.name}
                                                </p>
                                                {hasEnrolled && (
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

export default AddSubBranchToTeachingGroupView;
