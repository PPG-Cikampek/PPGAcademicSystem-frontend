import { useState } from "react";

const useClassActions = (lockMutation, removeTeacherMutation, removeStudentMutation, openModal, classData) => {
    const [modalLoading, setModalLoading] = useState(false);

    const lockClassHandler = (className, classId) => {
        const teachingGroupId =
            classData?.class?.teachingGroupId?._id ||
            classData?.class?.teachingGroupId;

        const confirmLock = async () => {
            try {
                setModalLoading(true);
                const res = await lockMutation.mutateAsync({
                    classId,
                    actionType: "lock",
                    teachingGroupId,
                });
                openModal(
                    res?.message || "Kelas berhasil dikunci",
                    "success",
                    null,
                    "Berhasil!"
                );
            } catch (err) {
                openModal(
                    err?.response?.data?.message ||
                        err?.message ||
                        "Terjadi kesalahan",
                    "error",
                    null,
                    "Gagal!"
                );
            } finally {
                setModalLoading(false);
            }
            return false;
        };

        openModal(
            `Kelas tidak akan bisa di-edit lagi!`,
            "confirmation",
            confirmLock,
            `Kunci kelas: ${className}?`,
            true
        );
    };

    const unlockClassHandler = (className, classId) => {
        const teachingGroupId =
            classData?.class?.teachingGroupId?._id ||
            classData?.class?.teachingGroupId;

        const confirmUnlock = async () => {
            try {
                setModalLoading(true);
                const res = await lockMutation.mutateAsync({
                    classId,
                    actionType: "unlock",
                    teachingGroupId,
                });
                openModal(
                    res?.message || "Kelas berhasil dibuka",
                    "success",
                    null,
                    "Berhasil!"
                );
            } catch (err) {
                openModal(
                    err?.response?.data?.message ||
                        err?.message ||
                        "Terjadi kesalahan",
                    "error",
                    null,
                    "Gagal!"
                );
            } finally {
                setModalLoading(false);
            }
            return false;
        };

        openModal(
            `Kelas dapat di-edit kembali`,
            "confirmation",
            confirmUnlock,
            `Buka kelas: ${className}?`,
            true
        );
    };

    const removeHandler = (role, name, id, classId) => {
        const confirmRemove = async () => {
            try {
                setModalLoading(true);
                if (role === "teacher") {
                    const res = await removeTeacherMutation.mutateAsync({
                        classId,
                        teacherId: id,
                    });
                    openModal(
                        res?.message || "Guru dihapus",
                        "success",
                        null,
                        "Berhasil!"
                    );
                } else {
                    const res = await removeStudentMutation.mutateAsync({
                        classId,
                        studentId: id,
                    });
                    openModal(
                        res?.message || "Siswa dihapus",
                        "success",
                        null,
                        "Berhasil!"
                    );
                }
            } catch (err) {
                openModal(
                    err?.response?.data?.message ||
                        err?.message ||
                        "Terjadi kesalahan",
                    "error",
                    null,
                    "Gagal!"
                );
            } finally {
                setModalLoading(false);
            }
            return false;
        };

        openModal(
            `Hapus ${name} dari kelas ini?`,
            "confirmation",
            confirmRemove,
            "Konfirmasi Penghapusan",
            true
        );
    };

    return {
        lockClassHandler,
        unlockClassHandler,
        removeHandler,
        modalLoading,
    };
};

export default useClassActions;
