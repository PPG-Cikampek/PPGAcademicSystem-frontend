import { Link, useNavigate } from "react-router-dom";
import { Trash, LockOpen, Lock, Pencil, KeyRound } from "lucide-react";
import { formatAcademicYear } from "../utilities/academicUtils";
import { useLockTeachingGroupMutation } from "../../shared/queries";
import { useQueryClient } from "@tanstack/react-query";

const BranchYearCard = ({
    year,
    expandedId,
    setExpandedId,
    activateYearHandler,
    deactivateYearHandler,
    deleteBranchYearHandler,
    deleteTeachingGroupHandler,
    editTeachingGroupHandler,
    openModal,
    auth,
}) => {
    // if auth.userRole === "subBranchAdmin", filter year.teachingGroups where subBranches includes auth.userSubBranchId
    const filteredYear = {
        ...year,
        teachingGroups:
            auth.userRole === "subBranchAdmin"
                ? year.teachingGroups.filter((group) =>
                      group.subBranches.includes(auth.userSubBranchId)
                  )
                : year.teachingGroups,
    };

    const navigate = useNavigate();
    console.log(filteredYear.teachingGroups);
    console.log(year);

    const lockTeachingGroupMutation = useLockTeachingGroupMutation();
    const queryClient = useQueryClient();

    const handleCardClick = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const lockTeachingGroupHandler = (name, id, isLocked) => (e) => {
        e.stopPropagation();
        const actionType = isLocked ? "unlock" : "lock";
        const confirmLock = async () => {
            try {
                const response = await lockTeachingGroupMutation.mutateAsync({
                    teachingGroupId: id,
                    actionType,
                });

                // Invalidate branchYears query to refresh the UI
                queryClient.invalidateQueries({
                    queryKey: ["branchYears", auth.userBranchId],
                });

                openModal(
                    response.message,
                    "success",
                    null,
                    "Berhasil!",
                    false,
                    "md"
                );
            } catch (err) {
                openModal(
                    err.response?.data?.message ||
                        err.message ||
                        "Failed to lock/unlock teaching group",
                    "error",
                    null,
                    "Gagal!",
                    false,
                    "md"
                );
            }
            // Keep modal open and replace content with success/error
            return false;
        };
        if (actionType === "lock") {
            openModal(
                `KBM tidak akan bisa di-edit lagi!`,
                "confirmation",
                confirmLock,
                `Kunci KBM: ${name}?`,
                true,
                "md"
            );
        } else {
            openModal(
                `KBM akan bisa di-edit lagi`,
                "confirmation",
                confirmLock,
                `Buka Kunci KBM: ${name}?`,
                true,
                "md"
            );
        }
    };

    return (
        <div
            key={year._id}
            className={`bg-white rounded-md shadow-md overflow-hidden transition-all duration-200 ${
                year.academicYearId.isActive === true ? "" : ""
            }`}
        >
            <div
                onClick={() => handleCardClick(year._id)}
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            >
                <div className="flex md:justify-between items-start md:flex-row flex-col md:items-center w-full">
                    <div className="flex gap-2 flex-row flex-wrap">
                        <h2 className="text-xl font-medium text-gray-800">
                            {formatAcademicYear(year.academicYearId.name)}
                        </h2>
                        <div className="flex h-min gap-2">
                            {year.academicYearId.isActive && (
                                <div className="inline-block px-2 py-1 text-sm text-blue-600 bg-blue-100 rounded-sm">
                                    {year.academicYearId.isActive} Semester
                                    Berjalan
                                </div>
                            )}
                            <div
                                className={`inline-block px-2 py-1 text-sm ${
                                    year.isActive
                                        ? "text-green-600 bg-green-100"
                                        : year.academicYearId.isActive
                                        ? "text-red-600 bg-red-100"
                                        : "text-gray-600 bg-gray-100"
                                } rounded-sm`}
                            >
                                {year.isActive
                                    ? "Aktif"
                                    : year.academicYearId.isActive
                                    ? "Nonaktif"
                                    : "Semester Lewat"}
                            </div>
                        </div>
                    </div>
                    {year.academicYearId.isActive &&
                    auth.userRole === "branchAdmin" &&
                    !year.isActive ? (
                        <div className="flex justify-between md:justify-end items-center w-full">
                            <div className="flex gap-2 my-6 md:my-0">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                            `/academic/teachingGroups/new`,
                                            {
                                                state: year.id,
                                            }
                                        );
                                    }}
                                    className="btn-primary-outline m-0 text-gray-700"
                                >
                                    Tambah KBM
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        activateYearHandler(
                                            year._id,
                                            year.name
                                        )(e);
                                    }}
                                    className="btn-primary-outline m-0 text-gray-700"
                                >
                                    Aktifkan
                                </button>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteBranchYearHandler(
                                        e,
                                        year.academicYearId.name,
                                        year._id
                                    );
                                }}
                                className="btn-icon-danger ml-2"
                            >
                                <Trash size={20} />
                            </button>
                        </div>
                    ) : (
                        auth.userRole === "branchAdmin" &&
                        year.isActive && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deactivateYearHandler(
                                        year.academicYearId.name,
                                        year._id
                                    )(e);
                                }}
                                className="btn-danger-outline m-0 text-gray-700 mt-4 md:mt-0"
                            >
                                Nonaktifkan
                            </button>
                        )
                    )}
                </div>

                <div className="mt-2 text-gray-700">
                    Jumlah KBM: {filteredYear.teachingGroups.length}
                </div>
            </div>

            {/* Expandable Section */}
            <div
                className={`overflow-hidden transition-all duration-300 ${
                    expandedId === year._id ? "max-h-[512px]" : "max-h-0"
                }`}
            >
                <div className="border-t">
                    {filteredYear.teachingGroups.length > 0 ? (
                        <ul className="">
                            {filteredYear.teachingGroups.map(
                                (teachingGroup) => (
                                    <li
                                        key={teachingGroup._id}
                                        className="flex justify-start items-center border-t"
                                    >
                                        <Link
                                            to={`/dashboard/teaching-groups/${teachingGroup.id}`}
                                            className="grow"
                                        >
                                            <div className="flex justify-start items-center gap-2 p-4 text-gray-700 border-gray-200 bg-white hover:bg-gray-100 hover:cursor-pointer">
                                                <div>{teachingGroup.name}</div>
                                                {year.academicYearId
                                                    .isActive && (
                                                    <div
                                                        className={`flex justify-center items-center p-1 border rounded-md border-gray-300 italic size-6 ${
                                                            teachingGroup.isLocked
                                                                ? "text-green-400 border-green-400"
                                                                : "text-red-400 border-red-400"
                                                        }`}
                                                    >
                                                        {teachingGroup.isLocked ? (
                                                            <Lock size={16} />
                                                        ) : (
                                                            <LockOpen
                                                                size={16}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                        {auth.userRole === "branchAdmin" &&
                                            year.academicYearId.isActive &&
                                            !year.isActive && (
                                                <div className="flex gap-1 mx-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            lockTeachingGroupHandler(
                                                                teachingGroup.name,
                                                                teachingGroup.id,
                                                                teachingGroup.isLocked
                                                            )(e);
                                                        }}
                                                        className="btn-icon-secondary"
                                                    >
                                                        <KeyRound size={20} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteTeachingGroupHandler(
                                                                teachingGroup.name,
                                                                teachingGroup.id
                                                            )(e);
                                                        }}
                                                        className="btn-icon-danger"
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            editTeachingGroupHandler(
                                                                teachingGroup.name,
                                                                teachingGroup.id
                                                            )(e);
                                                        }}
                                                        className="btn-icon-primary"
                                                    >
                                                        <Pencil size={20} />
                                                    </button>
                                                </div>
                                            )}
                                    </li>
                                )
                            )}
                        </ul>
                    ) : (
                        <p className="p-4 text-gray-500 italic">
                            Tidak ada riwayat KBM.
                            {year.academicYearId.isActive && (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                            `/academic/teachingGroups/new`,
                                            {
                                                state: year.id,
                                            }
                                        );
                                    }}
                                    className="text-gray-800 hover:underline hover:cursor-pointer"
                                >
                                    Tambah KBM
                                </span>
                            )}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BranchYearCard;
