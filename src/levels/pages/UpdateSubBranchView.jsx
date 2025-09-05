import { useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useNewModal from "../../shared/hooks/useNewModal";

const UpdateSubBranchView = () => {
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadedLevel, setLoadedLevel] = useState();

    const subBranchId = useParams().subBranchId;
    const navigate = useNavigate();
    const { modalState, openModal, closeModal } = useNewModal();

    useEffect(() => {
        const fetchSubBranch = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/levels/branches/sub-branches/${subBranchId}`
                );
                setLoadedLevel(responseData.subBranch);
                console.log(responseData);
                console.log(responseData.subBranch);
            } catch (err) {}
        };
        fetchSubBranch();
    }, [sendRequest]);

    const handleFormSubmit = async (data) => {
        const url = `${
            import.meta.env.VITE_BACKEND_URL
        }/levels/branches/sub-branches/${subBranchId}`;

        const body = JSON.stringify({ name: data.name, address: data.address });

        console.log(body);

        let responseData;
        try {
            responseData = await sendRequest(url, "PATCH", body, {
                "Content-Type": "application/json",
            });
        } catch (err) {
            // Error is already handled by useHttp
        }
        openModal(responseData.message, "success", () => navigate(-1), "Berhasil!", false);
    };

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            {!loadedLevel && isLoading && (
                <div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}

            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={isLoading}
            />

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                {error && (
                    <ErrorCard error={error} onClear={() => setError(null)} />
                )}
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
                            value: loadedLevel?.name || "",
                        },
                        {
                            name: "address",
                            label: "Alamat",
                            type: "textarea",
                            required: true,
                            value: loadedLevel?.address || "",
                        },
                        {
                            name: "branch",
                            label: "Desa",
                            type: "text",
                            required: false,
                            disabled: true,
                            value: loadedLevel?.branchId?.name || "",
                        },
                    ]}
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
