import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";
import useModal from "../../shared/hooks/useNewModal";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import { useTeachingGroup } from "../../shared/queries";

const UpdateTeachingGroupView = () => {
    const { isLoading, error, sendRequest, setError } = useHttp();

    const { modalState, openModal, closeModal, handleConfirm } = useModal();

    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const teachingGroupId = state?.teachingGroupId;

    const { data: teachingGroupData, isLoading: isFetching } =
        useTeachingGroup(teachingGroupId);

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
        const url = `${
            import.meta.env.VITE_BACKEND_URL
        }/teachingGroups/${teachingGroupId}`;

        const body = JSON.stringify({
            name: data.teachingGroupName,
            address: data.address,
        });

        let responseData;
        try {
            responseData = await sendRequest(url, "PATCH", body, {
                "Content-Type": "application/json",
            });
            openModal(
                responseData.message,
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
                isLoading={isLoading}
            />

            {error && (
                <ErrorCard error={error} onClear={() => setError(null)} />
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
                        disabled={isLoading}
                        reset={false}
                        footer={false}
                        button={
                            <div className="flex flex-col justify-stretch mt-4">
                                <button
                                    type="submit"
                                    className={`button-primary ${
                                        isLoading
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
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
