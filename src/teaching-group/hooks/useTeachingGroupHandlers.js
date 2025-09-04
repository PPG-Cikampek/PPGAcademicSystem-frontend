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
    setModal,
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
                setModal({
                    title: "Berhasil!",
                    message: response.message,
                    onConfirm: null,
                });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Failed to remove sub-branch"
                );
            }
        };
        closeModal();
        openModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus ${name} KBM ini?`,
            onConfirm: confirmRemove,
        });
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

                setModal({
                    title: "Berhasil!",
                    message: response.message,
                    onConfirm: null,
                });
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message:
                        err.response?.data?.message ||
                        err.message ||
                        "Failed to lock/unlock class",
                    onConfirm: null,
                });
            }
        };
        closeModal();
        if (actionType === "lock") {
            openModal({
                title: `Kunci kelas: ${className}?`,
                message: `Kelas tidak akan bisa di-edit lagi!`,
                onConfirm: confirmLock,
            });
        } else {
            openModal({
                title: `Buka Kunci kelas: ${className}?`,
                message: `Kelas akan bisa di-edit lagi`,
                onConfirm: confirmLock,
            });
        }
    };

    const removeClassHandler = (name, classId) => {
        const confirmRemove = async () => {
            try {
                const response = await removeClassMutation.mutateAsync({
                    teachingGroupId,
                    classId,
                });
                setModal({
                    title: "Berhasil!",
                    message: response.message,
                    onConfirm: null,
                });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        "Failed to remove class"
                );
            }
        };
        closeModal();
        openModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus ${name} dari KBM ini?`,
            onConfirm: confirmRemove,
        });
    };

    const lockTeachingGroupHandler = (actionType) => {
        console.log(actionType);
        const confirmLock = async () => {
            try {
                const response = await lockTeachingGroupMutation.mutateAsync({
                    teachingGroupId,
                    actionType,
                });

                setModal({
                    title: "Berhasil!",
                    message: response.message,
                    onConfirm: null,
                });
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message:
                        err.response?.data?.message ||
                        err.message ||
                        "Failed to lock/unlock teaching group",
                    onConfirm: null,
                });
            }
        };
        closeModal();
        if (actionType === "lock") {
            openModal({
                title: `Kunci KBM: ${teachingGroupData?.name}?`,
                message: `KBM tidak akan bisa di-edit lagi!`,
                onConfirm: confirmLock,
            });
        } else {
            openModal({
                title: `Buka Kunci KBM: ${teachingGroupData?.name}?`,
                message: `KBM akan bisa di-edit lagi`,
                onConfirm: confirmLock,
            });
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
