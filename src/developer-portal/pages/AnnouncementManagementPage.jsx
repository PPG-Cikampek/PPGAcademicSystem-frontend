import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import AnnouncementForm from "../components/AnnouncementForm";
import AnnouncementManagementTable from "../components/AnnouncementManagementTable";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { useAdminCheck } from "../hooks/useAdminCheck";
import { useAnnouncements } from "../hooks/usePortalData";
import {
    useCreateAnnouncement,
    useUpdateAnnouncement,
    useDeleteAnnouncement,
} from "../hooks/usePortalDataMutations";
import useToast from "../../shared/hooks/useToast";
import ToastContainer from "../../shared/Components/UIElements/ToastContainer";
import "../styles/admin-portal.css";

const AnnouncementManagementPage = () => {
    const { isAdmin, userRole } = useAdminCheck();
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const { toasts, showSuccess, showError, removeToast } = useToast();
    const [pendingDelete, setPendingDelete] = useState(null);

    const announcementsQuery = useAnnouncements();
    const createAnnouncement = useCreateAnnouncement();
    const updateAnnouncement = useUpdateAnnouncement();
    const deleteAnnouncement = useDeleteAnnouncement();

    if (userRole && !isAdmin) {
        return <Navigate to="/info-portal" replace />;
    }

    const isCreating = location.pathname.endsWith("/new");
    const isEditing = location.pathname.endsWith("/edit");
    const announcementId = isEditing ? params.announcementId : undefined;

    const selectedAnnouncement = useMemo(() => {
        if (!announcementId || !announcementsQuery.data) {
            return undefined;
        }

        return announcementsQuery.data.find(
            (announcement) => announcement.id === announcementId
        );
    }, [announcementId, announcementsQuery.data]);

    const handleCloseForm = () => {
        navigate("/admin/portal/announcements", { replace: true });
    };

    const handleSubmit = async (values) => {
        try {
            if (isCreating) {
                await createAnnouncement.mutateAsync(values);
                showSuccess(
                    "Pengumuman dipublikasikan",
                    "Pengumuman baru berhasil disimpan."
                );
            } else if (isEditing && announcementId) {
                const { id, ...data } = values;
                await updateAnnouncement.mutateAsync({
                    announcementId,
                    data,
                });
                showSuccess(
                    "Pengumuman diperbarui",
                    "Pengumuman berhasil diperbarui."
                );
            }
            handleCloseForm();
        } catch (error) {
            showError(
                "Operasi gagal",
                error?.message || "Tidak dapat menyimpan pengumuman."
            );
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) {
            return;
        }

        try {
            await deleteAnnouncement.mutateAsync({
                announcementId: pendingDelete.id,
            });
            showSuccess(
                "Pengumuman dihapus",
                `Pengumuman "${pendingDelete.title}" telah dihapus.`
            );
            setPendingDelete(null);
        } catch (error) {
            showError(
                "Gagal menghapus",
                error?.message || "Terjadi kesalahan saat menghapus pengumuman."
            );
            return false;
        }

        return true;
    };

    const isSubmitting = createAnnouncement.isPending || updateAnnouncement.isPending;
    const isLoading = announcementsQuery.isLoading;

    return (
        <div className="md:p-8 px-4 py-8 min-h-screen admin-portal-container">
            <div className="flex flex-col gap-8 mx-auto max-w-6xl">
                <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-3">
                    <div>
                        <h1 className="font-semibold text-gray-900 text-2xl">
                            Manajemen Pengumuman
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Publikasikan pembaruan penting ke seluruh pengguna aplikasi.
                        </p>
                    </div>
                    {!isCreating && !isEditing && (
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/portal/announcements/new")
                            }
                            className="btn-round-primary"
                        >
                            Pengumuman Baru
                        </button>
                    )}
                </div>

                {isCreating || isEditing ? (
                    <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-xl">
                        {isEditing &&
                            !announcementsQuery.isLoading &&
                            !selectedAnnouncement && (
                                <p className="text-red-500 text-sm">
                                    Pengumuman tidak ditemukan. Silakan kembali ke daftar pengumuman.
                                </p>
                            )}
                        {(isCreating || selectedAnnouncement) && (
                            <AnnouncementForm
                                mode={isEditing ? "edit" : "create"}
                                initialValues={selectedAnnouncement}
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

                {announcementsQuery.error && (
                    <ErrorCard
                        error={announcementsQuery.error}
                        onClear={announcementsQuery.refetch}
                    />
                )}

                {!isLoading && !announcementsQuery.error && (
                    <AnnouncementManagementTable
                        announcements={announcementsQuery.data || []}
                        onEdit={(announcement) =>
                            navigate(
                                `/admin/portal/announcements/${announcement.id}/edit`
                            )
                        }
                        onDelete={(announcement) =>
                            setPendingDelete(announcement)
                        }
                    />
                )}
            </div>

            <DeleteConfirmationDialog
                open={Boolean(pendingDelete)}
                onCancel={() => setPendingDelete(null)}
                onConfirm={handleDelete}
                title="Hapus Pengumuman"
                description={
                    pendingDelete
                        ? `Pengumuman "${pendingDelete.title}" akan dihapus dari portal. Lanjutkan?`
                        : undefined
                }
                isProcessing={deleteAnnouncement.isPending}
            />

            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
};

export default AnnouncementManagementPage;
