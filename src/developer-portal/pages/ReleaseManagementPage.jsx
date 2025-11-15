import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import ReleaseForm from "../components/ReleaseForm";
import ReleaseManagementTable from "../components/ReleaseManagementTable";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { useAdminCheck } from "../hooks/useAdminCheck";
import { useReleaseNotes } from "../hooks/usePortalData";
import {
    useCreateRelease,
    useUpdateRelease,
    useDeleteRelease,
} from "../hooks/usePortalDataMutations";
import useToast from "../../shared/hooks/useToast";
import ToastContainer from "../../shared/Components/UIElements/ToastContainer";
import "../styles/admin-portal.css";

const ReleaseManagementPage = () => {
    const { isAdmin, userRole } = useAdminCheck();
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const { toasts, showSuccess, showError, removeToast } = useToast();
    const [pendingDelete, setPendingDelete] = useState(null);

    const releasesQuery = useReleaseNotes();
    const createRelease = useCreateRelease();
    const updateRelease = useUpdateRelease();
    const deleteRelease = useDeleteRelease();

    if (userRole && !isAdmin) {
        return <Navigate to="/info-portal" replace />;
    }

    const isCreating = location.pathname.endsWith("/new");
    const isEditing = location.pathname.endsWith("/edit");
    const releaseId = isEditing ? params.releaseId : undefined;

    const selectedRelease = useMemo(() => {
        if (!releaseId || !releasesQuery.data) {
            return undefined;
        }

        return releasesQuery.data.find((release) => release.id === releaseId);
    }, [releaseId, releasesQuery.data]);

    const handleCloseForm = () => {
        navigate("/admin/portal/releases", { replace: true });
    };

    const handleSubmit = async (values) => {
        try {
            if (isCreating) {
                await createRelease.mutateAsync(values);
                showSuccess("Catatan rilis ditambahkan", "Rilis baru berhasil disimpan.");
            } else if (isEditing && releaseId) {
                await updateRelease.mutateAsync({
                    releaseId,
                    data: values,
                });
                showSuccess("Catatan rilis diperbarui", "Perubahan rilis berhasil disimpan.");
            }
            handleCloseForm();
        } catch (error) {
            showError(
                "Operasi gagal",
                error?.message || "Tidak dapat menyimpan catatan rilis."
            );
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) {
            return;
        }

        try {
            await deleteRelease.mutateAsync({ releaseId: pendingDelete.id });
            showSuccess(
                "Catatan rilis dihapus",
                `Rilis ${pendingDelete.version} telah dihapus.`
            );
            setPendingDelete(null);
        } catch (error) {
            showError(
                "Gagal menghapus",
                error?.message || "Terjadi kesalahan saat menghapus catatan rilis."
            );
            return false;
        }

        return true;
    };

    const isSubmitting = createRelease.isPending || updateRelease.isPending;
    const isLoading = releasesQuery.isLoading;

    return (
        <div className="md:p-8 px-4 py-8 min-h-screen admin-portal-container">
            <div className="flex flex-col gap-8 mx-auto max-w-6xl">
                <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-3">
                    <div>
                        <h1 className="font-semibold text-gray-900 text-2xl">
                            Manajemen Catatan Rilis
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Dokumentasikan setiap versi dan perubahan aplikasi.
                        </p>
                    </div>
                    {!isCreating && !isEditing && (
                        <button
                            type="button"
                            onClick={() => navigate("/admin/portal/releases/new")}
                            className="btn-round-primary"
                        >
                            Catatan Rilis Baru
                        </button>
                    )}
                </div>

                {isCreating || isEditing ? (
                    <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-xl">
                        {isEditing && !releasesQuery.isLoading && !selectedRelease && (
                            <p className="text-red-500 text-sm">
                                Rilis tidak ditemukan. Silakan kembali ke daftar rilis.
                            </p>
                        )}
                        {(isCreating || selectedRelease) && (
                            <ReleaseForm
                                mode={isEditing ? "edit" : "create"}
                                initialValues={selectedRelease}
                                onSubmit={handleSubmit}
                                onCancel={handleCloseForm}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </div>
                ) : null}

                {isLoading && (
                    <div className="flex justify-center py-16">
                        <LoadingCircle size={32} />
                    </div>
                )}

                {releasesQuery.error && (
                    <ErrorCard
                        error={releasesQuery.error}
                        onClear={releasesQuery.refetch}
                    />
                )}

                {!isLoading && !releasesQuery.error && (
                    <ReleaseManagementTable
                        releases={releasesQuery.data || []}
                        onEdit={(release) =>
                            navigate(`/admin/portal/releases/${release.id}/edit`)
                        }
                        onDelete={(release) => setPendingDelete(release)}
                    />
                )}
            </div>

            <DeleteConfirmationDialog
                open={Boolean(pendingDelete)}
                onCancel={() => setPendingDelete(null)}
                onConfirm={handleDelete}
                title="Hapus Catatan Rilis"
                description={
                    pendingDelete
                        ? `Catatan rilis ${pendingDelete.version} akan dihapus. Lanjutkan?`
                        : undefined
                }
                isProcessing={deleteRelease.isPending}
            />

            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
};

export default ReleaseManagementPage;
