import { useContext, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FAQForm, FAQTable, DeleteConfirmationDialog } from "../components";
import { useFAQs } from "../hooks/useFAQData";
import {
    useCreateFAQ,
    useUpdateFAQ,
    useDeleteFAQ,
} from "../hooks/useFAQDataMutations";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import useToast from "../../shared/hooks/useToast";
import ToastContainer from "../../shared/Components/UIElements/ToastContainer";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import withRouteProtection from "../../shared/Components/HOC/withRouteProtection";
import "../styles/help-center.css";

const HelpCenterManagementPage = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { faqId } = useParams();
    const [pendingDelete, setPendingDelete] = useState(null);
    const { toasts, showSuccess, showError, removeToast } = useToast();

    const faqQuery = useFAQs();
    const createFAQ = useCreateFAQ();
    const updateFAQ = useUpdateFAQ();
    const deleteFAQ = useDeleteFAQ();

    const isCreating = location.pathname.endsWith("/new");
    const isEditing = location.pathname.endsWith("/edit");

    const selectedFAQ = useMemo(() => {
        if (!isEditing || !faqId || !faqQuery.data) {
            return null;
        }
        return faqQuery.data.find((faq) => faq.id === faqId) || null;
    }, [faqId, faqQuery.data, isEditing]);

    const handleGoBack = () => {
        navigate("/help-center/admin", { replace: true });
    };

    const handleCreateClick = () => {
        navigate("/help-center/admin/new");
    };

    const handleSubmit = async (values) => {
        try {
            if (isCreating) {
                await createFAQ.mutateAsync({
                    ...values,
                    createdBy: auth.userId,
                });
                showSuccess(
                    "Pertanyaan berhasil ditambahkan",
                    "FAQ baru telah disimpan."
                );
            } else if (isEditing && faqId) {
                await updateFAQ.mutateAsync({
                    faqId,
                    data: {
                        ...values,
                        createdBy: selectedFAQ?.createdBy || auth.userId,
                    },
                });
                showSuccess(
                    "Pertanyaan berhasil diperbarui",
                    "Perubahan telah disimpan."
                );
            }
            handleGoBack();
        } catch (error) {
            showError(
                "Operasi gagal",
                error?.message || "Tidak dapat menyimpan pertanyaan."
            );
        }
    };

    const handleDeleteConfirm = async () => {
        if (!pendingDelete) {
            return true;
        }

        try {
            await deleteFAQ.mutateAsync({ faqId: pendingDelete.id });
            showSuccess(
                "Pertanyaan berhasil dihapus",
                `FAQ "${pendingDelete.question}" telah dihapus.`
            );
            setPendingDelete(null);
            return true;
        } catch (error) {
            showError(
                "Gagal menghapus",
                error?.message || "Terjadi kesalahan saat menghapus FAQ."
            );
            return false;
        }
    };

    const renderFormSection = () => {
        if (isEditing && !faqQuery.isLoading && !selectedFAQ) {
            return (
                <div className="faq-form-section">
                    <p className="text-red-500 text-sm">
                        Pertanyaan tidak ditemukan. Silakan kembali ke daftar
                        FAQ.
                    </p>
                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            onClick={handleGoBack}
                            className="btn-round-primary"
                        >
                            Kembali ke daftar
                        </button>
                    </div>
                </div>
            );
        }

        if (isCreating || (isEditing && selectedFAQ)) {
            return (
                <FAQForm
                    mode={isEditing ? "edit" : "create"}
                    initialValues={selectedFAQ || undefined}
                    onSubmit={handleSubmit}
                    onCancel={handleGoBack}
                    isSubmitting={createFAQ.isPending || updateFAQ.isPending}
                />
            );
        }

        return null;
    };

    const renderTableSection = () => {
        if (isCreating || isEditing) {
            return null;
        }

        if (faqQuery.isLoading) {
            return (
                <div className="faq-table-section flex justify-center py-16">
                    <LoadingCircle size={32} />
                </div>
            );
        }

        if (faqQuery.error) {
            return (
                <div className="faq-table-section">
                    <ErrorCard
                        error={faqQuery.error}
                        onClear={faqQuery.refetch}
                    />
                </div>
            );
        }

        return (
            <FAQTable
                data={faqQuery.data || []}
                isLoading={faqQuery.isFetching}
                onEdit={(faq) => navigate(`/help-center/admin/${faq.id}/edit`)}
                onDelete={(faq) => setPendingDelete(faq)}
            />
        );
    };

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-3 mb-6">
                    <div>
                        <h1 className="font-semibold text-gray-900 text-2xl">
                            Manajemen Pusat Bantuan
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Kelola konten FAQ agar pengguna mendapatkan jawaban
                            terbaru.
                        </p>
                    </div>
                    {!isCreating && !isEditing && (
                        <button
                            type="button"
                            onClick={handleCreateClick}
                            className="btn-round-primary"
                        >
                            Pertanyaan Baru
                        </button>
                    )}
                </div>

                {renderFormSection()}
                {renderTableSection()}
            </div>

            <DeleteConfirmationDialog
                isOpen={Boolean(pendingDelete)}
                faqData={pendingDelete}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setPendingDelete(null)}
                isLoading={deleteFAQ.isPending}
            />

            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
};

export default withRouteProtection(HelpCenterManagementPage, {
    requireAuth: true,
    allowedRoles: ["admin", "superAdmin"],
    redirectTo: "/info-portal",
});
