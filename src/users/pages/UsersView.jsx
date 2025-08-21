import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import useHttp from "../../shared/hooks/http-hook";

import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import SkeletonLoader from "../../shared/Components/UIElements/SkeletonLoader";
import {
    Search,
    Users,
    Pencil,
    Trash,
    ChevronDown,
    Filter,
    PlusIcon,
} from "lucide-react";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import DataTable from "../../shared/Components/UIElements/DataTable";
import getUserRoleTitle from "../../shared/Utilities/getUserRoleTitle";

const UsersView = () => {
    const [users, setUsers] = useState();
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [groupVisibility, setGroupVisibility] = useState({
        admin: true,
        BranchAdmin: true,
        subBranchAdmin: true,
        teacher: true,
        student: true,
        curriculum: true,
    });

    const roleOrder = [
        "admin",
        "branchAdmin",
        "subBranchAdmin",
        "teacher",
        "student",
        "curriculum",
        "munaqisy",
    ];

    const { isLoading, error, sendRequest, setError } = useHttp();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/users/`
                );
                setUsers(responseData);
                console.log(responseData);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchUsers();
    }, [sendRequest]);

    const toggleGroupVisibility = (role) => {
        setGroupVisibility((prev) => ({ ...prev, [role]: !prev[role] }));
    };

    const getRoleColor = (role) => {
        const roles = {
            admin: "bg-red-100 text-red-700",
            branchAdmin: "bg-orange-100 text-orange-700",
            subBranchAdmin: "bg-yellow-100 text-yellow-700",
            teacher: "bg-violet-100 text-violet-700",
            student: "bg-blue-100 text-blue-700",
            curriculum: "bg-green-100 text-green-700",
            munaqisy: "bg-pink-100 text-pink-700",
        };
        return roles[role] || "bg-gray-100 text-gray-700";
    };

    const getInitials = (name) => {
        return name
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleDeleteUser = (userId) => {
        const confirmDelete = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/users/${userId}`,
                    "DELETE",
                    null,
                    {
                        Authorization: "Bearer " + auth.token,
                    }
                );
                setModal({
                    title: "Berhasil!",
                    message: responseData.message,
                    onConfirm: null,
                });
                setUsers((prevUsers) => ({
                    ...prevUsers,
                    users: prevUsers.users.filter(
                        (user) => user._id !== userId
                    ),
                }));
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

    const handleBulkDelete = () => {
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
            const url = `${import.meta.env.VITE_BACKEND_URL}/users/bulk-delete`;
            const body = JSON.stringify({ userIds: selectedUserIds });
            console.log(body);
            try {
                const responseData = await sendRequest(url, "DELETE", body, {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                });
                setModal({
                    title: "Berhasil!",
                    message: responseData.message,
                    onConfirm: null,
                });
                setUsers((prevUsers) => ({
                    ...prevUsers,
                    users: prevUsers.users.filter(
                        (user) => !selectedUserIds.includes(user._id)
                    ),
                }));
                setSelectedUserIds([]);
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

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false);
                }}
                className={`${
                    modal.onConfirm
                        ? "btn-danger-outline"
                        : "button-primary mt-0 "
                }`}
            >
                {modal.onConfirm ? "Batal" : "Tutup"}
            </button>
            {modal.onConfirm && (
                <button
                    onClick={modal.onConfirm}
                    className="button-primary mt-0 "
                >
                    Ya
                </button>
            )}
        </div>
    );

    const getTableColumns = (role) => [
        {
            key: "image",
            label: "",
            render: (user) =>
                user.image ? (
                    <img
                        src={
                            user.thumbnail
                                ? user.thumbnail
                                : `${import.meta.env.VITE_BACKEND_URL}/${
                                      user.image
                                  }`
                        }
                        alt={user.name}
                        className="size-10 rounded-full border border-gray-200 bg-white"
                    />
                ) : (
                    <div
                        className={`size-10 rounded-full flex ${getRoleColor(
                            user.role
                        )} items-center justify-center font-medium`}
                    >
                        {getInitials(user.name)}
                    </div>
                ),
        },
        { key: "name", label: "Nama", sortable: true },
        { key: "email", label: "Email", sortable: true },
        {
            key: "branch",
            label: "Desa",
            sortable: true,
            render: (user) => user.subBranchId?.branchId?.name,
        },
        {
            key: "group",
            label: "Kelompok",
            sortable: true,
            render: (user) => user.subBranchId?.name,
        },
        {
            key: "actions",
            label: "Aksi",
            render: (user) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/settings/users/${user._id}`);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-sm"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user._id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-sm text-red-500"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

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
                    footer={<ModalFooter />}
                >
                    {isLoading ? <SkeletonLoader /> : modal.message}
                </Modal>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Daftar User
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleBulkDelete}
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

                {users &&
                    roleOrder.map((role) => {
                        const roleUsers = users.users.filter(
                            (user) => user.role === role
                        );
                        if (roleUsers.length === 0) return null;
                        return (
                            <div key={role} className="mb-8">
                                <h2 className="text-lg font-bold text-gray-900">
                                    {getUserRoleTitle(role)}
                                </h2>
                                <DataTable
                                    data={roleUsers}
                                    columns={getTableColumns(role)}
                                    searchableColumns={["name", "email"]}
                                    initialSort={{
                                        key: "name",
                                        direction: "ascending",
                                    }}
                                    initialEntriesPerPage={5}
                                    config={{
                                        showSearch: true,
                                        showTopEntries: true,
                                        showBottomEntries: true,
                                        showPagination: true,
                                        clickeableRows: false,
                                        entriesOptions: [5, 10, 20, 30],
                                    }}
                                    tableId={`users-table-${role}`}
                                    isLoading={isLoading}
                                />
                                <hr className="my-8" />
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default UsersView;
