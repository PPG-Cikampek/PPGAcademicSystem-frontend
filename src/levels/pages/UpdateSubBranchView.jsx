import { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSubBranch, useUpdateSubBranchMutation } from "../../shared/queries/useLevels";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useNewModal from "../../shared/hooks/useNewModal";

const UpdateSubBranchView = () => {
    const [isTransitioning, setIsTransitioning] = useState(false);

    const subBranchId = useParams().subBranchId;
    const navigate = useNavigate();
    const { modalState, openModal, closeModal } = useNewModal();
    const { data: subBranchData, isLoading: subBranchLoading } = useSubBranch(subBranchId);
    const updateSubBranchMutation = useUpdateSubBranchMutation();

    const handleFormSubmit = async (data) => {
        try {
            const response = await updateSubBranchMutation.mutateAsync({ subBranchId, data: { name: data.name, address: data.address } });
            openModal(response.message, "success", () => navigate(-1), "Berhasil!", false);
        } catch (err) {
            // Error is handled by React Query
        }
    };

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            {!subBranchData?.subBranch && subBranchLoading && (
                <div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}

            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={subBranchLoading || updateSubBranchMutation.isPending}
            />

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                <DynamicForm
                    title="Update Data Kelompok"
                    subtitle={"Sistem Akademik Digital"}
                    fields={[
                        {
                            name: "name",
                            label: "Nama Kelompok",
                            placeholder: "Nama Kelompok",
                            type: "text",
                            required: true,
                            value: subBranchData?.subBranch?.name || "",
                        },
                        {
                            name: "address",
                            label: "Alamat",
                            type: "textarea",
                            required: true,
                            value: subBranchData?.subBranch?.address || "",
                        },
                        {
                            name: "branch",
                            label: "Desa",
                            type: "text",
                            required: false,
                            disabled: true,
                            value: subBranchData?.subBranch?.branchId?.name || "",
                        },
                    ]}
                    onSubmit={handleFormSubmit}
                    disabled={subBranchLoading || updateSubBranchMutation.isPending}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    subBranchLoading || updateSubBranchMutation.isPending
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={subBranchLoading || updateSubBranchMutation.isPending}
                            >
                                {subBranchLoading || updateSubBranchMutation.isPending ? (
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

export default UpdateSubBranchView;
