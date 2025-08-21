import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import Modal from "../../shared/Components/UIElements/ModalBottomClose";

const PasswordResetView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const { isLoading, error, sendRequest, setError } = useHttp();

    const navigate = useNavigate();
    const token = useParams().token;

    const handleResetPassword = async (data) => {
        try {
            const responseData = await sendRequest(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/users/request-reset-password`,
                "POST",
                JSON.stringify({ email: data.email }),
                {
                    "Content-Type": "application/json",
                }
            );
            console.log(responseData);
            setModal({
                title: "Berhasil!",
                message: responseData.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
        } catch (err) {
            setModal({
                title: "Gagal!",
                message: err.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
        }
    };

    const handleSubmit = async (data) => {
        try {
            const responseData = await sendRequest(
                `${import.meta.env.VITE_BACKEND_URL}/users/reset-password`,
                "POST",
                JSON.stringify({
                    token: data.token,
                    newPassword: data.newPassword,
                }),
                {
                    "Content-Type": "application/json",
                }
            );
            setModal({
                title: "Berhasil!",
                message: responseData.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
        } catch (err) {
            setModal({
                title: "Gagal!",
                message: err.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
        }
    };

    const ModalFooter = () => (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => {
                    setModalIsOpen(false);
                    navigate(`/`);
                }}
                className={`${
                    modal.onConfirm
                        ? "btn-danger-outline"
                        : "button-primary mt-0 "
                }`}
            >
                {modal.onConfirm ? "Batal" : "Tutup"}
            </button>
            {modal.onConfirm && (
                <button
                    onClick={modal.onConfirm}
                    className="button-primary mt-0 "
                >
                    Ya
                </button>
            )}
        </div>
    );

    return (
        <div className="m-auto max-w-md mt-16 md:mt-24">
            <div className={`pb-24 transition-opacity duration-300`}>
                <Modal
                    isOpen={modalIsOpen}
                    onClose={() => setModalIsOpen(false)}
                    title={modal.title}
                    footer={<ModalFooter />}
                >
                    {isLoading && (
                        <div className="flex justify-center mt-16">
                            <LoadingCircle size={32} />
                        </div>
                    )}
                    {!isLoading && modal.message}
                </Modal>

                {error && (
                    <div className="px-2">
                        <ErrorCard
                            error={error}
                            onClear={() => setError(null)}
                        />
                    </div>
                )}
                {token === "reset" ? (
                    <DynamicForm
                        title="Reset Password"
                        fields={[
                            {
                                name: "email",
                                label: "Email",
                                placeholder: "Email",
                                type: "email",
                                required: true,
                            },
                        ]}
                        onSubmit={handleResetPassword}
                        disabled={isLoading}
                        labels={false}
                        footer={false}
                        customDescription={
                            <p className="text-center text-sm text-gray-500">
                                Masukkan email yang terdaftar untuk mereset
                                password
                            </p>
                        }
                        button={
                            <div className="flex flex-col justify-stretch mt-4">
                                <button
                                    type="submit"
                                    className={`button-primary ${
                                        isLoading
                                            ? "opacity-50 hover:cursor-not-allowed"
                                            : ""
                                    }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <LoadingCircle>
                                            Mengirim email...
                                        </LoadingCircle>
                                    ) : (
                                        "Reset"
                                    )}
                                </button>
                            </div>
                        }
                        helpButton={
                            <div
                                onClick={() => navigate(-1)}
                                className="text-center mt-2"
                            >
                                <p className="underline text-xs text-gray-600 active:text-primary hover:text-primary hover:cursor-pointer">
                                    Kembali ke Login
                                </p>
                            </div>
                        }
                    />
                ) : token ? (
                    <DynamicForm
                        title="Reset Password"
                        fields={[
                            { name: "token", type: "hidden", value: token },
                            {
                                name: "newPassword",
                                label: "Password Baru",
                                placeholder: "password baru",
                                type: "password",
                                required: true,
                            },
                            {
                                name: "confirmPassword",
                                label: "Konfirmasi Password",
                                placeholder: "konfirmasi password baru",
                                type: "password",
                                required: true,
                            },
                        ]}
                        onSubmit={handleSubmit}
                        disabled={isLoading}
                        labels={false}
                        footer={false}
                        customDescription={
                            <p className="text-center text-sm text-gray-500">
                                Masukkan password baru
                            </p>
                        }
                        button={
                            <div className="flex flex-col justify-stretch mt-4">
                                <button
                                    type="submit"
                                    className={`button-primary ${
                                        isLoading
                                            ? "opacity-50 hover:cursor-not-allowed"
                                            : ""
                                    }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <LoadingCircle>
                                            Processing...
                                        </LoadingCircle>
                                    ) : (
                                        "Update Password"
                                    )}
                                </button>
                            </div>
                        }
                        helpButton={
                            <div
                                onClick={() => navigate(-1)}
                                className="text-center mt-2"
                            >
                                <p className="underline text-xs text-gray-600 active:text-primary hover:text-primary hover:cursor-pointer">
                                    Kembali ke Login
                                </p>
                            </div>
                        }
                    />
                ) : (
                    // <div className={`pb-24 transition-opacity duration-300}`}>
                    //     Hello
                    //     <h2 className="text-2xl font-medium text-center">Reset Password</h2>
                    //     <input
                    //         type="email"
                    //         placeholder="Enter your email"
                    //         value={resetEmail}
                    //         onChange={(e) => setResetEmail(e.target.value)}
                    //         className="w-full p-2 mt-4 border rounded-md"
                    //     />
                    //     <button
                    //         onClick={handleResetPassword}
                    //         className={`button-primary mt-4 ${isLoading ? 'opacity-50 hover:cursor-not-allowed' : ''}`}
                    //         disabled={isLoading}
                    //     >
                    //         {isLoading ? (<LoadingCircle>Processing...</LoadingCircle>) : ('Reset Password')}
                    //     </button>
                    //     {resetMessage && <p className="mt-4 text-center">{resetMessage}</p>}
                    //     <button
                    //         onClick={() => setIsLoading(false)}
                    //         className="mt-4 text-blue-500 hover:underline"
                    //     >
                    //         Back to Login
                    //     </button>
                    // </div>
                    <div className="px-2">
                        <ErrorCard
                            error={"Invalid Token!"}
                            onClear={() => setError(null)}
                        />
                        <div
                            onClick={() => navigate(-1)}
                            className="text-center mt-2"
                        >
                            <p className="underline text-xs text-gray-600 active:text-primary hover:text-primary hover:cursor-pointer">
                                Kembali ke Login
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordResetView;
