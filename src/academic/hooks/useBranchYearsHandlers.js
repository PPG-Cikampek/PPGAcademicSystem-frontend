import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import useHttp from "../../shared/hooks/http-hook";
import { formatAcademicYear } from "../utilities/academicUtils";

const useBranchYearsHandlers = (setModal, setModalIsOpen, setBranchYears) => {
    const { sendRequest } = useHttp();
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const activateYearHandler = (branchYearId, branchYearName) => (e) => {
        e.stopPropagation();
        const confirmActivate = async () => {
            console.log("Updating ... ");
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/branchYears/activate`;

            const body = JSON.stringify({
                branchYearId: branchYearId,
            });

            console.log(body);

            let responseData;
            try {
                responseData = await sendRequest(url, "PATCH", body, {
                    "Content-Type": "application/json",
                });
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
                return;
            }

            setModal({
                title: "Berhasil!",
                message: responseData.message,
                onConfirm: null,
            });

            const updatedData = await sendRequest(
                `${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${
                    auth.userBranchId
                }`
            );
            setBranchYears(updatedData);
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
            const url = `${
                import.meta.env.VITE_BACKEND_URL
            }/branchYears/deactivate`;
            const body = JSON.stringify({
                branchYearId,
            });
            let responseData;
            try {
                responseData = await sendRequest(url, "PATCH", body, {
                    "Content-Type": "application/json",
                });
                setModal({
                    title: "Berhasil!",
                    message: responseData.message,
                    onConfirm: null,
                });

                const updatedData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${
                        auth.userBranchId
                    }`
                );
                setBranchYears(updatedData);
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
            }
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
        console.log(branchYearId);
        const confirmDelete = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/branchYears/`;
            const body = JSON.stringify({
                branchYearId,
            });
            let responseData;
            try {
                responseData = await sendRequest(url, "DELETE", body, {
                    "Content-Type": "application/json",
                });
                setModal({
                    title: "Berhasil!",
                    message: responseData.message,
                    onConfirm: null,
                });

                const updatedData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${
                        auth.userBranchId
                    }`
                );
                setBranchYears(updatedData);
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
            }
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
            const url = `${import.meta.env.VITE_BACKEND_URL}/teachingGroups/`;
            console.log(url);
            const body = JSON.stringify({
                teachingGroupId,
            });
            let responseData;
            try {
                responseData = await sendRequest(url, "DELETE", body, {
                    "Content-Type": "application/json",
                });
                setModal({
                    title: "Berhasil!",
                    message: responseData.message,
                    onConfirm: null,
                });

                const updatedData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/branchYears/branch/${
                        auth.userBranchId
                    }`
                );
                setBranchYears(updatedData);
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
            }
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
