import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import useModal from "../../shared/hooks/useNewModal";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import { useCreateTeachingGroupMutation } from "../../shared/queries/useTeachingGroups";

const NewTeachingGroupView = () => {
    const { modalState, openModal, closeModal, handleConfirm } = useModal();

    const createTeachingGroupMutation = useCreateTeachingGroupMutation();

    // const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const teachingGroupFields = [
        {
            name: "teachingGroupName",
            label: "Nama KBM",
            type: "text",
            required: true,
        },
        {
            name: "address",
            label: "Tempat Kegiatan KBM",
            type: "text",
            required: true,
        },
    ];

    const handleFormSubmit = async (data) => {
        try {
            await createTeachingGroupMutation.mutateAsync({
                name: data.teachingGroupName,
                address: data.address,
                branchYearId: state,
            });
            openModal(
                `Berhasil membuat KBM ${data.teachingGroupName}`,
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
                isLoading={createTeachingGroupMutation.isPending}
            />

            {createTeachingGroupMutation.isError && (
                <ErrorCard
                    error={createTeachingGroupMutation.error}
                    onClear={() => createTeachingGroupMutation.reset()}
                />
            )}

            <div className={`pb-24 transition-opacity duration-300`}>
                <DynamicForm
                    title="Tambah KBM"
                    subtitle={"Sistem Akademik Digital"}
                    fields={teachingGroupFields}
                    onSubmit={handleFormSubmit}
                    disabled={createTeachingGroupMutation.isPending}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    createTeachingGroupMutation.isPending
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={createTeachingGroupMutation.isPending}
                            >
                                {createTeachingGroupMutation.isPending ? (
                                    <LoadingCircle>Processing...</LoadingCircle>
                                ) : (
                                    "Tambah"
                                )}
                            </button>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default NewTeachingGroupView;
