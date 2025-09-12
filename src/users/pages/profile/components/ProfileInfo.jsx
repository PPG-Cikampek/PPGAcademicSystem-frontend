import { useState, useCallback } from "react";
import { Pencil, X, Check } from "lucide-react";
import { Icon } from "@iconify-icon/react/dist/iconify.js";

const ProfileInfo = ({ 
    userData, 
    isLoading, 
    onSaveName, 
    onEmailVerification 
}) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState("");

    const handleSaveName = useCallback(
        async (e) => {
            e.preventDefault();
            if (!editedName.trim()) return;
            
            const success = await onSaveName(editedName);
            if (success) {
                setIsEditingName(false);
            }
        },
        [editedName, onSaveName]
    );

    if (isLoading) {
        return (
            <div className="animate-pulse flex space-x-4 mb-6">
                <div className="flex-1 h-fit space-y-6 py-1">
                    <div className="h-5 bg-slate-500 rounded-sm"></div>
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-3 bg-slate-300 rounded-sm col-span-2"></div>
                            <div className="h-3 bg-slate-300 rounded-sm col-span-1"></div>
                        </div>
                        <div className="h-3 bg-slate-300 rounded-sm"></div>
                        <div className="h-3 bg-slate-300 rounded-sm"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <div className="mb-4">
            <div
                className={`flex items-center ${
                    isEditingName ? "justify-between" : ""
                } gap-2 my-2`}
            >
                {isEditingName ? (
                    <form
                        onSubmit={handleSaveName}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="border rounded-sm m-0 px-2 py-2 font-medium text-gray-800 focus:ring-2 focus:ring-primary"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="icon-button-primary"
                        >
                            <Check size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditingName(false)}
                            className="icon-button-danger"
                        >
                            <X size={16} />
                        </button>
                    </form>
                ) : (
                    <>
                        <h2 className="text-xl font-medium text-gray-800">
                            {userData.name}
                        </h2>
                        <button
                            onClick={() => {
                                setIsEditingName(true);
                                setEditedName(userData.name);
                            }}
                            className="p-2 self-start place-self-start rounded-full hover:bg-gray-200"
                            title="Edit Nama"
                        >
                            <Pencil size={18} />
                        </button>
                    </>
                )}
            </div>
            <div className="text-gray-600 flex flex-wrap items-center mb-2 md:mb-0 md:gap-2">
                {userData.email}{" "}
                {userData.isEmailVerified ? (
                    <Icon
                        icon="tdesign:verified"
                        width="18"
                        height="18"
                        style={{ color: "#06ff00" }}
                    />
                ) : (
                    <div
                        onClick={onEmailVerification}
                        className="p-1 border rounded-md border-red-500 text-gray-500 active:text-primary hover:cursor-pointer italic flex items-center"
                    >
                        Belum verifikasi{" "}
                        <Icon
                            icon="ci:triangle-warning"
                            width="16"
                            height="16"
                            style={{ color: "#ff0000" }}
                        />
                    </div>
                )}
            </div>
            <p className="text-gray-600">
                Desa {userData?.subBranchId?.branchId?.name}
            </p>
            <p className="text-gray-600">
                Kelompok {userData?.subBranchId?.name || ""}
            </p>
        </div>
    );
};

export default ProfileInfo;