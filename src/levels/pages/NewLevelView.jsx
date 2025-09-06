import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useBranches, useCreateBranchMutation, useCreateSubBranchMutation } from "../../shared/queries/useLevels";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";
import { AuthContext } from "../../shared/Components/Context/auth-context";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useNewModal from "../../shared/hooks/useNewModal";

import logo from "../../assets/logos/ppgcikampek.webp";
import { div } from "framer-motion/client";

const NewLevelView = () => {
    const [isBranch, setIsBranch] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { data: branchesData, isLoading: branchesLoading } = useBranches();
    const createBranchMutation = useCreateBranchMutation();
    const createSubBranchMutation = useCreateSubBranchMutation();
    const [loadedBranch, setLoadedBranch] = useState([]);
    const [subBranchFields, setSubBranchFields] = useState();

    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const { modalState, openModal, closeModal } = useNewModal();

    const branchFields = [
        {
            name: "name",
            label: "Nama Desa",
            placeholder: "Nama Desa",
            type: "text",
            required: true,
        },
        {
            name: "address",
            label: "Alamat Desa",
            placeholder: "Alamat Lengkap",
            type: "text",
            required: true,
        },
    ];

    useEffect(() => {
        if (branchesData?.branches) {
            setLoadedBranch(branchesData.branches);
        }
    }, [branchesData]);

    useEffect(() => {
        if (loadedBranch) {
            setSubBranchFields([
                {
                    name: "name",
                    label: "Nama Kelompok",
                    placeholder: "Nama Kelompok",
                    type: "text",
                    required: true,
                },
                {
                    name: "address",
                    label: "Alamat Kelompok",
                    placeholder: "Alamat Lengkap",
                    type: "text",
                    required: true,
                },
                {
                    name: "branch",
                    label: "Desa",
                    type: "select",
                    required: true,
                    options: loadedBranch.map(({ name }) => ({
                        label: name,
                        value: name,
                    })),
                },
            ]);
        }
    }, [loadedBranch]);

    const handleFormSubmit = async (data) => {
        const mutation = isBranch ? createBranchMutation : createSubBranchMutation;
        const payload = isBranch
            ? { name: data.name, address: data.address }
            : {
                  name: data.name,
                  address: data.address,
                  branchName: data.branch,
              };

        try {
            const response = await mutation.mutateAsync(payload);
            openModal(response.message, "success", () => navigate("/settings/levels/"), "Berhasil!", false);
        } catch (err) {
            // Error is handled by React Query
        }
    };

    const handleToggle = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setIsBranch((prev) => !prev);
            setIsTransitioning(false);
        }, 200);
    };

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={branchesLoading || createBranchMutation.isPending || createSubBranchMutation.isPending}
            />

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                {createBranchMutation.error && (
                    <div className="mx-2">
                        <ErrorCard
                            error={createBranchMutation.error}
                        />
                    </div>
                )}
                {createSubBranchMutation.error && (
                    <div className="mx-2">
                        <ErrorCard
                            error={createSubBranchMutation.error}
                        />
                    </div>
                )}
                <DynamicForm
                    title={isBranch ? "Tambah Desa" : "Tambah Kelompok"}
                    subtitle={"Sistem Akademik Digital"}
                    fields={isBranch ? branchFields : subBranchFields}
                    onSubmit={handleFormSubmit}
                    disabled={branchesLoading || createBranchMutation.isPending || createSubBranchMutation.isPending}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    branchesLoading || createBranchMutation.isPending || createSubBranchMutation.isPending
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={branchesLoading || createBranchMutation.isPending || createSubBranchMutation.isPending}
                            >
                                {branchesLoading || createBranchMutation.isPending || createSubBranchMutation.isPending ? (
                                    <LoadingCircle>Processing...</LoadingCircle>
                                ) : (
                                    "Tambah"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className={`button-secondary ${
                                    branchesLoading || createBranchMutation.isPending || createSubBranchMutation.isPending
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={branchesLoading || createBranchMutation.isPending || createSubBranchMutation.isPending}
                            >
                                {branchesLoading || createBranchMutation.isPending || createSubBranchMutation.isPending ? (
                                    <LoadingCircle>Processing...</LoadingCircle>
                                ) : isBranch ? (
                                    "Tambah Kelompok"
                                ) : (
                                    "Tambah Desa"
                                )}
                            </button>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default NewLevelView;
