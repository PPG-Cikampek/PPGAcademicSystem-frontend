import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useBranches, useDeleteBranchMutation, useDeleteSubBranchMutation } from "../../shared/queries/useLevels";

import NewModal from "../../shared/Components/Modal/NewModal";
import useNewModal from "../../shared/hooks/useNewModal";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import {
    ChevronDown,
    ChevronRight,
    MapPin,
    Building,
    PlusIcon,
    Pencil,
    Trash,
} from "lucide-react";
import FloatingMenu from "../../shared/Components/UIElements/FloatingMenu";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";

const LevelsView = () => {
    const [expandedBranches, setExpandedBranches] = useState({});
    const { data, isLoading, error } = useBranches();
    const deleteBranchMutation = useDeleteBranchMutation();
    const deleteSubBranchMutation = useDeleteSubBranchMutation();

    const { modalState, openModal, closeModal } = useNewModal();

    const navigate = useNavigate();

    const toggleBranch = (branchId) => {
        setExpandedBranches((prev) => ({
            ...prev,
            [branchId]: !prev[branchId],
        }));
    };

    const deleteBranchHandler = (branchName, branchId) => {
        console.log(branchId);
        const confirmDelete = async () => {
            try {
                const response = await deleteBranchMutation.mutateAsync({ branchId });
                openModal(response.message, "success", null, "Berhasil!", false);
            } catch (err) {
                openModal(err.message || "Terjadi kesalahan tak terduga.", "error", null, "Gagal!", false);
            }
            return false;

        };
        openModal(`Hapus Desa: ${branchName}?`, "confirmation", confirmDelete, `Konfirmasi Penghapusan`, true);
    };

    const deleteSubBranchHandler = (e, subBranchName, subBranchId) => {
        e.stopPropagation();
        console.log(subBranchId);
        const confirmDelete = async () => {
            try {
                const response = await deleteSubBranchMutation.mutateAsync({ subBranchId });
                openModal(response.message, "success", null, "Berhasil!", false);
            } catch (err) {
                openModal(err.message || "Terjadi kesalahan tak terduga.", "error", null, "Gagal!", false);
            }
            return false;
        };
        openModal(`Hapus Kelompok: ${subBranchName}?`, "confirmation", confirmDelete, `Konfirmasi Penghapusan`, true);
    };

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="font-bold text-gray-900 text-2xl">
                        Manajemen Desa dan Kelompok
                    </h1>
                    <Link to={`/settings/levels/new`}>
                        <button className="pl-[10px] button-primary">
                            <PlusIcon className="mr-2 w-4 h-4" />
                            Tambah
                        </button>
                    </Link>
                </div>

                {error && (
                    <ErrorCard error={error} />
                )}

                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={isLoading || deleteBranchMutation.isPending || deleteSubBranchMutation.isPending}
                />

                {!data && isLoading && (
                    <div className="flex flex-col gap-4 mt-16 px-4">
                        <SkeletonLoader
                            variant="rectangular"
                            height="60px"
                            className="rounded-lg"
                            count={4}
                        />
                    </div>
                )}

                {data && !isLoading && (
                    <div className="bg-white shadow-sm rounded-lg divide-y">
                        {data.branches.map((branch) => (
                            <div
                                key={branch._id}
                                className="hover:bg-gray-100 p-4 transition-all duration-200 hover:cursor-pointer"
                            >
                                <div
                                    onClick={() => toggleBranch(branch._id)}
                                    className="flex items-center space-x-4"
                                >
                                    {/* <div className="flex justify-center items-center bg-indigo-100 rounded-full w-8 h-8">
                                        <Building className="w-4 h-4 text-primary" />
                                    </div> */}
                                    <div className="flex-1 h-fit">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900 text-sm">
                                                Desa {branch.name}
                                            </h4>
                                            <div className="p-1 border border-gray-500 rounded-sm text-gray-500 text-xs">
                                                {branch.subBranches.length}{" "}
                                                Kelompok
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-1 text-gray-500 text-xs">
                                            {/* <MapPin className="mr-1 w-4 h-4" /> */}
                                            {branch.address}
                                        </div>
                                    </div>
                                    <FloatingMenu
                                        onClick={(e) => e.stopPropagation()}
                                        buttons={[
                                            {
                                                icon: Pencil,
                                                label: "Edit",
                                                onClick: () =>
                                                    navigate(
                                                        `/settings/levels/${branch._id}`
                                                    ),
                                            },
                                            {
                                                icon: Trash,
                                                label: "Delete",
                                                variant: "danger",
                                                onClick: () =>
                                                    deleteBranchHandler(
                                                        branch.name,
                                                        branch._id
                                                    ),
                                            },
                                        ]}
                                    />
                                </div>

                                {expandedBranches[branch._id] && (
                                    <div className="space-y-2 mt-3 ml-12">
                                        {branch.subBranches.map((sub) => (
                                            <div
                                                key={sub._id}
                                                className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-sm text-sm"
                                            >
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        Kelompok {sub.name}
                                                    </div>
                                                    <div className="flex items-center mt-1 text-gray-500 text-xs">
                                                        {/* <MapPin className="mr-1 w-4 h-4" /> */}
                                                        {sub.address}
                                                    </div>
                                                </div>
                                                <div className="flex">
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/settings/levels/teaching-group/${sub._id}`
                                                            )
                                                        }
                                                        className="px-2 text-gray-500 hover:text-blue-500 hover:underline italic hover:cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) =>
                                                            deleteSubBranchHandler(
                                                                e,
                                                                sub.name,
                                                                sub._id
                                                            )
                                                        }
                                                        className="px-2 text-gray-500 hover:text-red-500 hover:underline italic hover:cursor-pointer"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LevelsView;
