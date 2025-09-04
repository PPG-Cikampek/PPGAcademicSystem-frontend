import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useRemoveSubBranchMutation,
    useRemoveClassMutation,
    useLockTeachingGroupMutation,
    useLockClassMutation,
} from "../../shared/queries";

export const useTeachingGroupHandlers = (
    teachingGroupId,
    teachingGroupData,
    openModal,
    closeModal,
    setError
) => {
    const navigate = useNavigate();

    const removeSubBranchMutation = useRemoveSubBranchMutation();
    const removeClassMutation = useRemoveClassMutation();
    const lockTeachingGroupMutation = useLockTeachingGroupMutation();
    const lockClassMutation = useLockClassMutation();

    const removeSubBranchHandler = (name, subBranchId) => {
        const confirmRemove = async () => {
            try {
                const response = await removeSubBranchMutation.mutateAsync({
                    teachingGroupId,
                    subBranchId,
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
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Failed to remove sub-branch"
                );
            }
        };
        openModal(
            `Hapus ${name} KBM ini?`,
            "confirmation",
            confirmRemove,
            `Konfirmasi Penghapusan`,
            true,
            "md"
        );
    };

    const lockClassHandler = (actionType, className, classId) => {
        console.log(actionType);
        const confirmLock = async () => {
            try {
                const response = await lockClassMutation.mutateAsync({
                    classId,
                    actionType,
                    teachingGroupId,
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
                        "Failed to lock/unlock class",
                    "error",
                    null,
                    "Gagal!",
                    false,
                    "md"
                );
            }
        };
        if (actionType === "lock") {
            openModal(
                `Kelas tidak akan bisa di-edit lagi!`,
                "confirmation",
                confirmLock,
                `Kunci kelas: ${className}?`,
                true,
                "md"
            );
        } else {
            openModal(
                `Kelas akan bisa di-edit lagi`,
                "confirmation",
                confirmLock,
                `Buka Kunci kelas: ${className}?`,
                true,
                "md"
            );
        }
    };

    const removeClassHandler = (name, classId) => {
        const confirmRemove = async () => {
            try {
                const response = await removeClassMutation.mutateAsync({
                    teachingGroupId,
                    classId,
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
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Failed to remove class"
                );
            }
        };
        openModal(
            `Hapus ${name} dari KBM ini?`,
            "confirmation",
            confirmRemove,
            `Konfirmasi Penghapusan`,
            true,
            "md"
        );
    };

    const lockTeachingGroupHandler = (actionType) => {
        console.log(actionType);
        const confirmLock = async () => {
            try {
                const response = await lockTeachingGroupMutation.mutateAsync({
                    teachingGroupId,
                    actionType,
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
        };
        if (actionType === "lock") {
            openModal(
                `KBM tidak akan bisa di-edit lagi!`,
                "confirmation",
                confirmLock,
                `Kunci KBM: ${teachingGroupData?.name}?`,
                true,
                "md"
            );
        } else {
            openModal(
                `KBM akan bisa di-edit lagi`,
                "confirmation",
                confirmLock,
                `Buka Kunci KBM: ${teachingGroupData?.name}?`,
                true,
                "md"
            );
        }
    };

    const editClassHandler = (className, classId) => {
        // Assuming edit navigates to edit page
        navigate(`/dashboard/classes/${classId}/edit`);
    };

    return {
        removeSubBranchHandler,
        lockClassHandler,
        removeClassHandler,
        lockTeachingGroupHandler,
        editClassHandler,
        mutations: {
            removeSubBranchMutation,
            removeClassMutation,
            lockTeachingGroupMutation,
            lockClassMutation,
        },
    };
};
