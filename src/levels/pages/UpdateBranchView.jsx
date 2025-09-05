import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useBranch, useUpdateBranchMutation } from "../../shared/queries/useLevels";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useNewModal from "../../shared/hooks/useNewModal";

const UpdateBranchView = () => {
    const { modalState, openModal, closeModal } = useNewModal();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const branchId = useParams().branchId;
    const navigate = useNavigate();
    const { data: branchData, isLoading: branchLoading } = useBranch(branchId);
    const updateBranchMutation = useUpdateBranchMutation();

    const handleFormSubmit = async (data) => {
        try {
            const response = await updateBranchMutation.mutateAsync({ branchId, data: { name: data.name, address: data.address } });
            openModal(response.message, "success", () => navigate(-1), "Berhasil!");
        } catch (err) {
            // Error is handled by React Query
        }
    };

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            <NewModal modalState={modalState} onClose={closeModal} />

            {!branchData?.branch && branchLoading && (
                <div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                {updateBranchMutation.error && (
                    <ErrorCard error={updateBranchMutation.error} />
                )}
                <DynamicForm
                    title="Update Data Desa"
                    subtitle={"Sistem Akademik Digital"}
                    fields={[
                        {
                            name: "name",
                            label: "Nama Desa",
                            placeholder: "Nama Desa",
                            type: "text",
                            required: true,
                            value: branchData?.branch?.name || "",
                        },
                        {
                            name: "address",
                            label: "Alamat",
                            type: "textarea",
                            required: true,
                            value: branchData?.branch?.address || "",
                        },
                    ]}
                    onSubmit={handleFormSubmit}
                    disabled={branchLoading || updateBranchMutation.isPending}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    branchLoading || updateBranchMutation.isPending
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={branchLoading || updateBranchMutation.isPending}
                            >
                                {branchLoading || updateBranchMutation.isPending ? (
                                    <LoadingCircle>Processing...</LoadingCircle>
                                ) : (
                                    "Update"
                                )}
                            </button>
                            {/* <button
                                type="button"
                                onClick={handleToggle}
                                className="button-secondary"
                                disabled={isLoading}
                            >
                                {isAdmin ? 'Masuk Generus' : 'Masuk Pengurus'}
                            </button> */}
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default UpdateBranchView;
