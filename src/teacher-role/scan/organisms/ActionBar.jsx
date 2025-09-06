import React, { useContext } from "react";
import { LoaderCircle } from "lucide-react";
import { Icon } from "@iconify-icon/react";
import BulkActions from "../molecules/BulkActions";
import SaveButton from "../atoms/SaveButton";
import { StudentAttendanceContext } from "../context/StudentAttendanceContext";

const ActionBar = ({
    students,
    isLoading,
    error,
    unsavedChanges,
    onBulkSakit,
    onBulkIzin,
    onSave,
}) => {
    const { state } = useContext(StudentAttendanceContext);
    const selectedCount = state.selectedCount;

    return (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-300 p-4 z-10 transition-all">
            {students.length !== 0 && (
                <div className="mb-2 mx-2">
                    {isLoading ? (
                        <div className="flex items-center gap-2 animate-pulse">
                            <LoaderCircle size={24} className="animate-spin" />
                            <span className="text-xs text-gray-600">
                                Menyimpan...
                            </span>
                        </div>
                    ) : error ? (
                        <Icon
                            icon="mdi:cloud-alert-outline"
                            width="24"
                            height="24"
                        />
                    ) : (
                        <div
                            className={`flex items-center gap-1 duration-300 ${
                                unsavedChanges > 0
                                    ? "text-red-500 animate-bounce"
                                    : "text-blue-500 animate-pulse"
                            }`}
                        >
                            <Icon
                                icon={
                                    unsavedChanges > 0
                                        ? "lucide:circle-alert"
                                        : "ci:cloud-check"
                                }
                                width="24"
                                height="24"
                            />
                            <span className="text-xs">
                                {unsavedChanges > 0
                                    ? `Perubahan belum disimpan`
                                    : "Perubahan tersimpan"}
                            </span>
                        </div>
                    )}
                </div>
            )}
            <div className="flex justify-between items-center">
                <BulkActions
                    onBulkSakit={onBulkSakit}
                    onBulkIzin={onBulkIzin}
                    disabled={selectedCount === 0}
                />
                <SaveButton
                    onClick={onSave}
                    disabled={isLoading || unsavedChanges === 0}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default ActionBar;
