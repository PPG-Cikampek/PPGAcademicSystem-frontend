import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import FeatureForm from "../components/FeatureForm";
import FeatureManagementTable from "../components/FeatureManagementTable";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { useAdminCheck } from "../hooks/useAdminCheck";
import {
    useCurrentFeatures,
} from "../hooks/usePortalData";
import {
    useCreateFeature,
    useUpdateFeature,
    useDeleteFeature,
} from "../hooks/usePortalDataMutations";
import useToast from "../../shared/hooks/useToast";
import ToastContainer from "../../shared/Components/UIElements/ToastContainer";
import "../styles/admin-portal.css";

const FeatureManagementPage = () => {
    const { isAdmin, userRole } = useAdminCheck();
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const { toasts, showSuccess, showError, removeToast } = useToast();
    const [pendingDelete, setPendingDelete] = useState(null);

    const featuresQuery = useCurrentFeatures();
    const createFeature = useCreateFeature();
    const updateFeature = useUpdateFeature();
    const deleteFeature = useDeleteFeature();

    if (userRole && !isAdmin) {
        return <Navigate to="/info-portal" replace />;
    }

    const isCreating = location.pathname.endsWith("/new");
    const isEditing = location.pathname.endsWith("/edit");
    const featureId = isEditing ? params.featureId : undefined;

    const selectedFeature = useMemo(() => {
        if (!featureId || !featuresQuery.data) {
            return undefined;
        }

        return featuresQuery.data.find((feature) => feature.id === featureId);
    }, [featureId, featuresQuery.data]);

    const handleCloseForm = () => {
        navigate("/admin/portal/features", { replace: true });
    };

    const handleSubmit = async (values) => {
        try {
            if (isCreating) {
                await createFeature.mutateAsync(values);
                showSuccess("Fitur ditambahkan", "Fitur baru berhasil disimpan.");
            } else if (isEditing && featureId) {
                await updateFeature.mutateAsync({
                    featureId,
                    data: values,
                });
                showSuccess("Fitur diperbarui", "Perubahan fitur berhasil disimpan.");
            }
            handleCloseForm();
        } catch (error) {
            console.log(error)
            showError(
                "Operasi gagal",
                error?.message || "Tidak dapat menyimpan perubahan fitur."
            );
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) {
            return;
        }

        try {
            await deleteFeature.mutateAsync({ featureId: pendingDelete.id });
            showSuccess(
                "Fitur dihapus",
                `Fitur "${pendingDelete.title}" telah dihapus.`
            );
            setPendingDelete(null);
        } catch (error) {
            showError(
                "Gagal menghapus",
                error?.message || "Terjadi kesalahan saat menghapus fitur."
            );
            return false;
        }

        return true;
    };

    const isSubmitting = createFeature.isPending || updateFeature.isPending;
    const isLoading = featuresQuery.isLoading;

    return (
        <div className="md:p-8 px-4 py-8 min-h-screen admin-portal-container">
            <div className="flex flex-col gap-8 mx-auto max-w-6xl">
                <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-3">
                    <div>
                        <h1 className="font-semibold text-gray-900 text-2xl">
                            Manajemen Fitur
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Kelola daftar fitur yang tampil pada portal informasi.
                        </p>
                    </div>
                    {!isCreating && !isEditing && (
                        <button
                            type="button"
                            onClick={() => navigate("/admin/portal/features/new")}
                            className="btn-round-primary"
                        >
                            Tambah Fitur
                        </button>
                    )}
                </div>

                {isCreating || isEditing ? (
                    <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-xl">
                        {isEditing && !featuresQuery.isLoading && !selectedFeature && (
                            <p className="text-red-500 text-sm">
                                Fitur tidak ditemukan. Silakan kembali ke daftar fitur.
                            </p>
                        )}
                        {(isCreating || selectedFeature) && (
                            <FeatureForm
                                mode={isEditing ? "edit" : "create"}
                                initialValues={selectedFeature}
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

                {featuresQuery.error && (
                    <ErrorCard
                        error={featuresQuery.error}
                        onClear={featuresQuery.refetch}
                    />
                )}

                {!isLoading && !featuresQuery.error && (
                    <FeatureManagementTable
                        features={featuresQuery.data || []}
                        onEdit={(feature) =>
                            navigate(`/admin/portal/features/${feature.id}/edit`)
                        }
                        onDelete={(feature) => setPendingDelete(feature)}
                    />
                )}
            </div>

            <DeleteConfirmationDialog
                open={Boolean(pendingDelete)}
                onCancel={() => setPendingDelete(null)}
                onConfirm={handleDelete}
                title="Hapus Fitur"
                description={
                    pendingDelete
                        ? `Fitur "${pendingDelete.title}" akan dihapus dari portal. Lanjutkan?`
                        : undefined
                }
                isProcessing={deleteFeature.isPending}
            />

            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
};

export default FeatureManagementPage;
