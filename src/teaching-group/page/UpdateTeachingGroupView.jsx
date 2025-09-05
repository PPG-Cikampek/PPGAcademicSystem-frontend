import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import useModal from "../../shared/hooks/useNewModal";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import { useTeachingGroup } from "../../shared/queries";
import { useUpdateTeachingGroupMutation } from "../../shared/queries/useTeachingGroups";

const UpdateTeachingGroupView = () => {
    const { modalState, openModal, closeModal, handleConfirm } = useModal();

    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const teachingGroupId = state?.teachingGroupId;

    const { data: teachingGroupData, isLoading: isFetching } =
        useTeachingGroup(teachingGroupId);

    const updateTeachingGroupMutation = useUpdateTeachingGroupMutation();

    const teachingGroupFields = [
        {
            name: "teachingGroupName",
            label: "Nama KBM",
            type: "text",
            required: true,
            value: teachingGroupData?.name || "",
        },
        {
            name: "address",
            label: "Tempat Kegiatan KBM",
            type: "text",
            required: true,
            value: teachingGroupData?.address || "",
        },
    ];

    const handleFormSubmit = async (data) => {
        try {
            await updateTeachingGroupMutation.mutateAsync({
                teachingGroupId,
                name: data.teachingGroupName,
                address: data.address,
            });
            openModal(
                `Berhasil memperbarui KBM ${data.teachingGroupName}`,
                "success",
                null,
                "Berhasil!",
                false,
                "md"
            );
        } catch (err) {
            openModal(err.message, "error", null, "Gagal!", false, "md");
        }
    };

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            <NewModal
                modalState={modalState}
                onClose={() => {
                    closeModal();
                    navigate(-1);
                }}
                isLoading={updateTeachingGroupMutation.isPending}
            />

            {updateTeachingGroupMutation.isError && (
                <ErrorCard error={updateTeachingGroupMutation.error} onClear={() => updateTeachingGroupMutation.reset()} />
            )}

            <div className={`pb-24 transition-opacity duration-300 `}>
                {isFetching ? (
                    <LoadingCircle />
                ) : (
                    <DynamicForm
                        title="Edit KBM"
                        subtitle={"Sistem Akademik Digital"}
                        fields={teachingGroupFields}
                        onSubmit={handleFormSubmit}
                        disabled={updateTeachingGroupMutation.isPending}
                        reset={false}
                        footer={false}
                        button={
                            <div className="flex flex-col justify-stretch mt-4">
                                <button
                                    type="submit"
                                    className={`button-primary ${
                                        updateTeachingGroupMutation.isPending
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    disabled={updateTeachingGroupMutation.isPending}
                                >
                                    {updateTeachingGroupMutation.isPending ? (
                                        <LoadingCircle>
                                            Processing...
                                        </LoadingCircle>
                                    ) : (
                                        "Update"
                                    )}
                                </button>
                            </div>
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default UpdateTeachingGroupView;
