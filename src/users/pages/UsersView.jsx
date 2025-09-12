import { Link } from "react-router-dom";

import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import { Trash, PlusIcon, Users } from "lucide-react";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { useUsers } from "../hooks/useUsers";
import RoleGroup from "../components/RoleGroup";

const UsersView = () => {
    const { modalState, openModal, closeModal } = useModal();

    const {
        users,
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

    const combinedLoading = isLoading || !users;

    const handleDeleteUserModal = (userId) => {
        const confirmDelete = async () => {
            try {
                const message = await handleDeleteUser(userId);
                openModal(message, "success", null, "Berhasil!", false);
            } catch {
                // Error handled by useHttp
            }
        };
        openModal(
            "Hapus Pengguna?",
            "confirmation",
            confirmDelete,
            "Peringatan!",
            true
        );
        // prevent modal from closing immediately
        return false;
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
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                {error && (
                    <ErrorCard error={error} onClear={() => setError(null)} />
                )}

                <NewModal
                    modalState={modalState}
                    onClose={closeModal}
                    isLoading={isLoading}
                />

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Daftar User
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkDeleteModal}
                            className="button-danger disabled:hidden"
                            disabled={selectedUserIds.length === 0}
                        >
                            <Trash className="w-4 h-4 mr-2" />
                            Hapus Akun
                        </button>
                        <Link to="/settings/users/new">
                            <button className="button-primary pl-[14px]">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Tambah Akun
                            </button>
                        </Link>
                        <Link to="/settings/users/bulk-create">
                            <button className="button-primary pl-[14px]">
                                <Users className="w-4 h-4 mr-2" />
                                Tambah Peserta Didik
                            </button>
                        </Link>
                    </div>
                </div>

                {roleOrder.map((role) => (
                    <RoleGroup
                        key={role}
                        role={role}
                        users={users ? users.users : []}
                        navigate={navigate}
                        handleDeleteUser={handleDeleteUserModal}
                        isLoading={combinedLoading}
                    />
                ))}
            </div>
        </div>
    );
};

export default UsersView;
