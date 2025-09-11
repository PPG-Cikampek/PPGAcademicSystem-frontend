import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";

const NewStudentView = () => {
    const { modalState, openModal, closeModal } = useModal();

    const [isTransitioning, setIsTransitioning] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [loadedSubBranches, setLoadedSubBranches] = useState([]);
    const [signUpFields, setSignUpFields] = useState();

    // const auth = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubBranches = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/levels/subBranch`
                );
                setLoadedSubBranches(responseData.subBranches);
            } catch (err) {}
        };
        fetchSubBranches();
    }, [sendRequest]);

    useEffect(() => {
        if (loadedSubBranches) {
            setSignUpFields([
                {
                    name: "name",
                    label: "Name Lengkap",
                    placeholder: "",
                    type: "text",
                    required: true,
                },
                {
                    name: "email",
                    label: "Email",
                    placeholder: "contoh@gmail.com",
                    type: "email",
                    required: true,
                },
                {
                    name: "nis",
                    label: "Nomor Induk Siswa (NIS)",
                    placeholder: "",
                    type: "text",
                    required: true,
                },
                {
                    name: "password",
                    label: "Password",
                    placeholder: "",
                    type: "password",
                    required: true,
                },
                {
                    name: "role",
                    label: "Akun",
                    type: "select",
                    required: true,
                    options: [
                        {
                            label: "Peserta Didik",
                            value: "student",
                            disabled: true,
                        },
                    ],
                },
                {
                    name: "subBranchName",
                    label: "Kelompok",
                    type: "select",
                    required: true,
                    options: loadedSubBranches.map(({ name }) => ({
                        label: name,
                        value: name,
                    })),
                },
            ]);
        }
    }, [loadedSubBranches]);

    const handleFormSubmit = async (data) => {
        const userUrl = `${import.meta.env.VITE_BACKEND_URL}/users/signup`;
        const userBody = JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
            subBranchName: data.subBranchName,
        });

        const studentUrl = `${import.meta.env.VITE_BACKEND_URL}/students/`;
        const studentBody = JSON.stringify({
            name: data.name,
            email: data.email,
            nis: data.nis,
        });

        // console.log(userBody)
        let userResponseData;
        let studentResponseData;
        try {
            userResponseData = await sendRequest(userUrl, "POST", userBody, {
                "Content-Type": "application/json",
            });

            studentResponseData = await sendRequest(
                studentUrl,
                "POST",
                studentBody,
                {
                    "Content-Type": "application/json",
                }
            );
            openModal(
                studentResponseData.message,
                "success",
                () => {
                    navigate("/settings/users/");
                    return false; // Prevent immediate redirect
                },
                "Berhasil!",
                false
            );
        } catch (err) {
            // Error is already handled by useHttp
        }
    };

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            <NewModal
                modalState={modalState}
                onClose={closeModal}
            />

            {error && (
                <ErrorCard error={error} onClear={() => setError(null)} />
            )}

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                <DynamicForm
                    title="Tambah Peserta Didik"
                    subtitle={"Sistem Akademik Digital"}
                    fields={
                        signUpFields || [
                            {
                                name: "name",
                                label: "Name",
                                placeholder: "Nama Lengkap",
                                type: "text",
                                required: true,
                            },
                            {
                                name: "email",
                                label: "Email",
                                placeholder: "Email",
                                type: "email",
                                required: true,
                            },
                            {
                                name: "password",
                                label: "Password",
                                placeholder: "Password",
                                type: "password",
                                required: true,
                            },
                        ]
                    }
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

export default NewStudentView;
