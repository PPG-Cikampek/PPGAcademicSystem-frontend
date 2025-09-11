import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";
import { AuthContext } from "../../shared/Components/Context/auth-context";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";

const NewTeacherView = () => {
    const { modalState, openModal, closeModal } = useModal();

    const [isTransitioning, setIsTransitioning] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();

    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const loginFields = [
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
            name: "nig",
            label: "NIG",
            placeholder: "NIG",
            type: "text",
            required: true,
        },
        {
            name: "phone",
            label: "Nomor HP Aktif",
            placeholder: "Nomor HP Aktif",
            type: "text",
            required: true,
        },
        {
            name: "position",
            label: "Posisi",
            type: "select",
            required: true,
            options: [
                { label: "Guru", value: "teacher" },
                { label: "Assisten", value: "assistant" },
            ],
        },
        {
            name: "dateOfBirth",
            label: "Tanggal Lahir",
            placeholder: "Tanggal Lahir",
            type: "text",
            required: true,
        },
        {
            name: "gender",
            label: "Jenis Kelamin",
            type: "select",
            required: true,
            options: [
                { label: "Laki-laki", value: "male" },
                { label: "Perempuan", value: "female" },
            ],
        },
        {
            name: "address",
            label: "Alamat",
            placeholder: "Alamat",
            type: "text",
            required: true,
        },
        {
            name: "positionStartDate",
            label: "Mulai Masa Tugas",
            placeholder: "Mulai Masa Tugas",
            type: "text",
            required: true,
        },
    ];

    const handleFormSubmit = async (data) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/teachers/`;

        const body = JSON.stringify({
            name: data.name,
            email: data.email,
            nig: data.nig,
            phone: data.phone,
            position: data.position,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            address: data.address,
            positionStartDate: data.positionStartDate,
        });

        // console.log(body)
        let responseData;
        try {
            responseData = await sendRequest(url, "POST", body, {
                "Content-Type": "application/json",
            });
            openModal(
                responseData.message,
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

    const handleToggle = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setIsAdmin((prev) => !prev);
            setIsTransitioning(false);
        }, 200);
    };

    return (
        <div className="m-auto max-w-md mt-14 md:my-8">
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
                    title="Tambah Tenaga Pendidik"
                    subtitle={"Sistem Akademik Digital"}
                    fields={loginFields}
                    onSubmit={handleFormSubmit}
                    disabled={isLoading}
                    reset={false}
                    footer={false}
                    labels={false}
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

export default NewTeacherView;
