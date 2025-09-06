import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../shared/Components/Context/auth-context";

import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import { Trash, PlusIcon, Users } from "lucide-react";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { useUsers } from "../hooks/useUsers";
import ModalFooter from "../components/ModalFooter";
import RoleGroup from "../components/RoleGroup";

const UsersView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const {
        users,
        selectedUserIds,
        setSelectedUserIds,
        roleOrder,
        isLoading,
        error,
        setError,
        handleDeleteUser,
        handleBulkDelete,
        navigate,
    } = useUsers();

    const auth = useContext(AuthContext);

    const combinedLoading = isLoading || !users;

    const handleDeleteUserModal = (userId) => {
        const confirmDelete = async () => {
            try {
                const message = await handleDeleteUser(userId);
                setModal({
                    title: "Berhasil!",
                    message: message,
                    onConfirm: null,
                });
            } catch (err) {
                // Error handled by useHttp
            }
        };
        setModal({
            title: "Peringatan!",
            message: "Hapus Pengguna?",
            onConfirm: confirmDelete,
        });
        setModalIsOpen(true);
    };

    const handleBulkDeleteModal = () => {
        if (selectedUserIds.length === 0) {
            setModal({
                title: "Error",
                message: "Please select at least one user.",
                onConfirm: null,
            });
            setModalIsOpen(true);
            return;
        }

        const confirmBulkDelete = async () => {
            try {
                const message = await handleBulkDelete();
                setModal({
                    title: "Berhasil!",
                    message: message,
                    onConfirm: null,
                });
            } catch (err) {
                // Error handled by useHttp
            }
        };

        setModal({
            title: "Konfirmasi",
            message: "Hapus semua user yang dipilih?",
            onConfirm: confirmBulkDelete,
        });
        setModalIsOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">
                {error && (
                    <ErrorCard error={error} onClear={() => setError(null)} />
                )}

                <Modal
                    isOpen={modalIsOpen}
                    onClose={() => setModalIsOpen(false)}
                    title={modal.title}
                    footer={
                        <ModalFooter
                            modal={modal}
                            setModalIsOpen={setModalIsOpen}
                        />
                    }
                >
                    {isLoading ? <SkeletonLoader /> : modal.message}
                </Modal>

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
