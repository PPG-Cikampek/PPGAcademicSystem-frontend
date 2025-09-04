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

const useBranchYearsHandlers = (openModal, closeModal) => {
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
                openModal(res.message, "success", null, "Berhasil!", false);
            } catch (err) {
                openModal(
                    err?.response?.data?.message || err.message || err,
                    "error",
                    null,
                    "Gagal!",
                    false
                );
            }
            // Keep modal open and replace content with success/error
            return false;
        };

        openModal(
            `Aktifkan tahun ajaran ${formatAcademicYear(branchYearName)}?`,
            "confirmation",
            confirmActivate,
            "Konfirmasi",
            true
        );
    };

    const deactivateYearHandler = (branchYearName, branchYearId) => (e) => {
        e.stopPropagation();
        const confirmDelete = async () => {
            try {
                const res = await deactivateMutation.mutateAsync({
                    branchYearId,
                    branchId: auth.userBranchId,
                });
                openModal(res.message, "success", null, "Berhasil!", false);
            } catch (err) {
                openModal(
                    err?.response?.data?.message || err.message || err,
                    "error",
                    null,
                    "Gagal!",
                    false
                );
            }
            // Keep modal open and replace content with success/error
            return false;
        };
        openModal(
            `Nonaktifkan tahun ajaran ${formatAcademicYear(branchYearName)}?`,
            "confirmation",
            confirmDelete,
            "Konfirmasi",
            true
        );
    };

    const deleteBranchYearHandler = (branchYearName, branchYearId) => (e) => {
        e.stopPropagation();
        const confirmDelete = async () => {
            try {
                const res = await deleteBranchYearMutation.mutateAsync({
                    branchYearId,
                    branchId: auth.userBranchId,
                });
                openModal(res.message, "success", null, "Berhasil!", false);
            } catch (err) {
                openModal(
                    err?.response?.data?.message || err.message || err,
                    "error",
                    null,
                    "Gagal!",
                    false
                );
            }
            // Keep modal open and replace content with success/error
            return false;
        };
        openModal(
            `Hapus tahun ajaran ${formatAcademicYear(branchYearName)}?`,
            "confirmation",
            confirmDelete,
            "Konfirmasi Penghapusan",
            true
        );
    };

    const deleteTeachingGroupHandler = (className, teachingGroupId) => (e) => {
        e.stopPropagation();
        const confirmDelete = async () => {
            try {
                const res = await deleteTeachingGroupMutation.mutateAsync({
                    teachingGroupId,
                    branchId: auth.userBranchId,
                });
                openModal(res.message, "success", null, "Berhasil!", false);
            } catch (err) {
                console.log(err);
                openModal(
                    err?.response?.data?.message || err.message || err,
                    "error",
                    null,
                    "Gagal!",
                    false
                );
            }
            // Keep modal open and replace content with success/error
            return false;
        };
        openModal(
            `Hapus KBM: ${className}?`,
            "confirmation",
            confirmDelete,
            "Konfirmasi Penghapusan",
            true
        );
    };

    return {
        activateYearHandler,
        deactivateYearHandler,
        deleteBranchYearHandler,
        deleteTeachingGroupHandler,
    };
};

export default useBranchYearsHandlers;
