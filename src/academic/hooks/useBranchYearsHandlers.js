import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import {
    useActivateBranchYearMutation,
    useDeactivateBranchYearMutation,
    useDeleteBranchYearMutation,
    useDeleteTeachingGroupMutation,
} from "../../shared/queries/useBranchYears";
import { formatAcademicYear } from "../utilities/academicUtils";

const useBranchYearsHandlers = (setModal, setModalIsOpen) => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const activateMutation = useActivateBranchYearMutation();
    const deactivateMutation = useDeactivateBranchYearMutation();
    const deleteBranchYearMutation = useDeleteBranchYearMutation();
    const deleteTeachingGroupMutation = useDeleteTeachingGroupMutation();

    const activateYearHandler = (branchYearId, branchYearName) => (e) => {
        e.stopPropagation();
        const confirmActivate = async () => {
            try {
                const res = await activateMutation.mutateAsync({
                    branchYearId,
                    branchId: auth.userBranchId,
                });
                setModal({
                    title: "Berhasil!",
                    message: res.message,
                    onConfirm: null,
                });
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err?.message || err,
                    onConfirm: null,
                });
            }
            setModalIsOpen(true);
        };

        setModal({
            title: `Konfirmasi`,
            message: `Aktifkan tahun ajaran ${formatAcademicYear(
                branchYearName
            )}?`,
            onConfirm: confirmActivate,
        });
        setModalIsOpen(true);
    };

    const deactivateYearHandler = (branchYearName, branchYearId) => (e) => {
        e.stopPropagation();
        const confirmDelete = async () => {
            try {
                const res = await deactivateMutation.mutateAsync({
                    branchYearId,
                    branchId: auth.userBranchId,
                });
                setModal({
                    title: "Berhasil!",
                    message: res.message,
                    onConfirm: null,
                });
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err?.message || err,
                    onConfirm: null,
                });
            }
            setModalIsOpen(true);
        };
        setModal({
            title: `Konfirmasi`,
            message: `Nonaktifkan tahun ajaran ${formatAcademicYear(
                branchYearName
            )}?`,
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    };

    const deleteBranchYearHandler = (branchYearName, branchYearId) => (e) => {
        e.stopPropagation();
        const confirmDelete = async () => {
            try {
                const res = await deleteBranchYearMutation.mutateAsync({
                    branchYearId,
                    branchId: auth.userBranchId,
                });
                setModal({
                    title: "Berhasil!",
                    message: res.message,
                    onConfirm: null,
                });
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err?.message || err,
                    onConfirm: null,
                });
            }
            setModalIsOpen(true);
        };
        setModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus tahun ajaran ${formatAcademicYear(
                branchYearName
            )}?`,
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    };

    const deleteTeachingGroupHandler = (className, teachingGroupId) => (e) => {
        e.stopPropagation();
        const confirmDelete = async () => {
            try {
                const res = await deleteTeachingGroupMutation.mutateAsync({
                    teachingGroupId,
                    branchId: auth.userBranchId,
                });
                setModal({
                    title: "Berhasil!",
                    message: res.message,
                    onConfirm: null,
                });
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err?.message || err,
                    onConfirm: null,
                });
            }
            setModalIsOpen(true);
        };
        setModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus KBM: ${className}?`,
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    };

    return {
        activateYearHandler,
        deactivateYearHandler,
        deleteBranchYearHandler,
        deleteTeachingGroupHandler,
    };
};

export default useBranchYearsHandlers;
