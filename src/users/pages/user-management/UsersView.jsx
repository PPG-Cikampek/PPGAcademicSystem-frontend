import { Link } from "react-router-dom";

import NewModal from "../../../shared/Components/Modal/NewModal";
import useModal from "../../../shared/hooks/useNewModal";
import { Trash, PlusIcon, Users } from "lucide-react";
import ErrorCard from "../../../shared/Components/UIElements/ErrorCard";
import { useUsers } from "../../hooks";
import RoleGroup from "../../components/RoleGroup";

const UsersView = () => {
    const { modalState, openModal, closeModal } = useModal();

    const {
        selectedUserIds,
        // setSelectedUserIds,
        roleOrder,
        isLoading,
        error,
        setError,
        handleDeleteUser,
        handleBulkDelete,
        navigate,
    } = useUsers();

    const handleDeleteUserModal = (userId) => {
        const confirmDelete = async () => {
            try {
                const message = await handleDeleteUser(userId);
                openModal(message, "success", null, "Berhasil!", false);
            } catch {
                // Error handled by useHttp
            }
            // prevent modal from closing immediately
            return false;
        };
        openModal(
            "Hapus Pengguna?",
            "confirmation",
            confirmDelete,
            "Peringatan!",
            true
        );
    };

    const handleBulkDeleteModal = () => {
        if (selectedUserIds.length === 0) {
            openModal(
                "Please select at least one user.",
                "error",
                null,
                "Error",
                false
            );
            return;
        }

        const confirmBulkDelete = async () => {
            try {
                const message = await handleBulkDelete();
                openModal(message, "success", null, "Berhasil!", false);
            } catch {
                // Error handled by useHttp
            }
            // prevent modal from closing immediately
            return false;
        };

        openModal(
            "Hapus semua user yang dipilih?",
            "confirmation",
            confirmBulkDelete,
            "Konfirmasi",
            true
        );
    };

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-6xl">
                {error && (
                    <ErrorCard error={error} onClear={() => setError(null)} />
                )}

                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={isLoading}
                />

                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-semibold text-gray-900 text-2xl">
                        Daftar User
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkDeleteModal}
                            className="disabled:hidden button-danger"
                            disabled={selectedUserIds.length === 0}
                        >
                            <Trash className="mr-2 w-4 h-4" />
                            Hapus Akun
                        </button>
                        <Link to="/settings/users/new">
                            <button className="pl-[14px] button-primary">
                                <PlusIcon className="mr-2 w-4 h-4" />
                                Tambah Akun
                            </button>
                        </Link>
                        <Link to="/settings/users/bulk-create">
                            <button className="pl-[14px] button-primary">
                                <Users className="mr-2 w-4 h-4" />
                                Tambah Peserta Didik
                            </button>
                        </Link>
                    </div>
                </div>

                {roleOrder.map((role) => (
                    <RoleGroup
                        key={role}
                        role={role}
                        navigate={navigate}
                        handleDeleteUser={handleDeleteUserModal}
                    />
                ))}
            </div>
        </div>
    );
};

export default UsersView;
