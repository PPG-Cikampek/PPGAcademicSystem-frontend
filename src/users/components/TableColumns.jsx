import { Pencil, Trash } from "lucide-react";
import { getRoleColor, getInitials } from "../utilities/userUtils";

export const TableColumns = (role, navigate, handleDeleteUserModal) => [
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
                        handleDeleteUserModal(user._id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-sm text-red-500"
                >
                    <Trash className="w-4 h-4" />
                </button>
            </div>
        ),
    },
];
