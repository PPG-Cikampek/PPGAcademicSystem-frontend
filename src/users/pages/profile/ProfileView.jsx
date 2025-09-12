import { useContext, useEffect, useState, useRef, useCallback } from "react";

import useHttp from "../../../shared/hooks/http-hook";
import { AuthContext } from "../../../shared/Components/Context/auth-context";

import ErrorCard from "../../../shared/Components/UIElements/ErrorCard";
import WarningCard from "../../../shared/Components/UIElements/WarningCard";

import ProfileImageUpload from "./components/ProfileImageUpload";
import ProfileInfo from "./components/ProfileInfo";
import EmailSection from "./components/EmailSection";
import PasswordSection from "./components/PasswordSection";
import ProfileModal from "./components/ProfileModal";

const ProfileView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [userData, setUserData] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isLoading, error, sendRequest, setError } = useHttp();

    // Use refs for large binary data to avoid re-renders
    const pickedFileRef = useRef(null);
    const originalDataRef = useRef(null); // Store original data for comparison

    const auth = useContext(AuthContext);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/users/${auth.userId}`
                );
                setUserData(response.users);

                // Store original data for comparison to detect changes
                originalDataRef.current = {
                    name: response.users.name,
                    email: response.users.email,
                };
            } catch {
                // handled by useHttp
            }
        };
        fetchUserData();
    }, [sendRequest, auth.userId]);

    const saveImageHandler = async () => {
        // Prevent duplicate submissions
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            if (pickedFileRef.current) {
                formData.append("image", pickedFileRef.current);
            } else {
                if (auth.userRole !== "admin") {
                    setError("Tidak ada foto yang dipilih!");
                    throw new Error("Tidak ada foto yang dipilih!");
                }
            }

            const response = await sendRequest(
                `${import.meta.env.VITE_BACKEND_URL}/users/image-upload/${
                    auth.userId
                }`,
                "POST",
                formData
            );
            setModal({
                title: "Berhasil!",
                message: response.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
            pickedFileRef.current = null;
        } catch (err) {
            setModal({
                title: "Gagal!",
                message: err.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler for name saving
    const handleSaveName = useCallback(async (newName) => {
        try {
            const response = await sendRequest(
                `${import.meta.env.VITE_BACKEND_URL}/users/${auth.userId}`,
                "PATCH",
                JSON.stringify({ name: newName }),
                {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                }
            );
            setUserData((prev) => ({ ...prev, name: newName }));
            setModal({
                title: "Berhasil!",
                message: response.message || "Nama berhasil diubah.",
                onConfirm: null,
            });
            setModalIsOpen(true);
            return true;
        } catch (err) {
            setModal({
                title: "Gagal!",
                message: err.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
            return false;
        }
    }, [auth.userId, auth.token, sendRequest]);

    const handleEmailVerification = useCallback(() => {
        // Guard: ensure userData is loaded before attempting to read email
        if (!userData || !userData.email) {
            setModal({
                title: "Gagal!",
                message:
                    "Data pengguna belum dimuat. Silakan coba lagi setelah halaman selesai dimuat.",
                onConfirm: null,
            });
            setModalIsOpen(true);
            return;
        }

        const verifyEmail = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/users/request-verify-email`,
                    "POST",
                    JSON.stringify({
                        email: userData.email,
                        newEmail: userData.email,
                        isNewEmail: false,
                    }),
                    {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + auth.token,
                    }
                );
                setModal({
                    title: "Berhasil!",
                    message: responseData.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
            } catch (err) {
                console.log(err);
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
            }
        };
        setModal({
            title: "Verifikasi Email?",
            message: "Pesan verifikasi akan dikirim ke inbox Anda.",
            onConfirm: verifyEmail,
        });
        setModalIsOpen(true);
    }, [auth.token, sendRequest, userData]);

    const handleEmailUpdate = useCallback(async (newEmail) => {
        if (!userData || !userData.email) {
            setModal({
                title: "Gagal!",
                message:
                    "Data pengguna belum dimuat. Silakan coba lagi setelah halaman selesai dimuat.",
                onConfirm: null,
            });
            setModalIsOpen(true);
            return false;
        }

        const updateEmail = async () => {
            try {
                const responseData = await sendRequest(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/users/request-verify-email`,
                    "POST",
                    JSON.stringify({
                        email: userData.email,
                        newEmail,
                        isNewEmail: true,
                    }),
                    {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + auth.token,
                    }
                );
                setModal({
                    title: "Berhasil!",
                    message: responseData.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
                return true;
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
                return false;
            }
        };

        setModal({
            title: "Ubah Email?",
            message: "Pesan verifikasi akan dikirim ke email baru Anda.",
            onConfirm: updateEmail,
        });
        setModalIsOpen(true);
        return true;
    }, [auth.token, sendRequest, userData]);

    const handlePasswordUpdate = useCallback(async ({ oldPassword, newPassword, confirmNewPassword }) => {
        if (!userData || !userData.email) {
            setModal({
                title: "Gagal!",
                message:
                    "Data pengguna belum dimuat. Silakan coba lagi setelah halaman selesai dimuat.",
                onConfirm: null,
            });
            setModalIsOpen(true);
            return false;
        }

        const updatePassword = async () => {
            try {
                const response = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/users/change-password`,
                    "POST",
                    JSON.stringify({
                        email: userData.email,
                        oldPassword,
                        newPassword,
                        confirmNewPassword,
                    }),
                    {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + auth.token,
                    }
                );
                setModal({
                    title: "Berhasil!",
                    message: response.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
                return true;
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
                return false;
            }
        };
        setModal({
            title: "Ubah Password?",
            message: "Apakah anda yakin untuk mengubah password?",
            onConfirm: updatePassword,
        });
        setModalIsOpen(true);
        return true;
    }, [auth.token, sendRequest, userData]);

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="card-basic rounded-md flex flex-col items-stretch mb-12">
                <ProfileModal
                    isOpen={modalIsOpen}
                    modal={modal}
                    isLoading={isLoading}
                    onClose={() => setModalIsOpen(false)}
                />

                {!isLoading &&
                    userData &&
                    userData.isEmailVerified !== true && (
                        <WarningCard
                            onClick={handleEmailVerification}
                            className="items-center justify-start hover:cursor-pointer hover:underline"
                            warning="Verifikasi email Anda agar dapat mengubah password!"
                            onClear={() => setError(null)}
                        />
                    )}

                {error && (
                    <ErrorCard error={error} onClear={() => setError(null)} />
                )}

                <div className="flex flex-col items-stretch">
                    <h1 className="text-2xl font-bold self-center mt-4">
                        Profile
                    </h1>

                    <div className="flex flex-col md:flex-row gap-4 justify-around py-2">
                        <ProfileImageUpload
                            userData={userData}
                            isLoading={isLoading}
                            isSubmitting={isSubmitting}
                            onImageSave={saveImageHandler}
                            pickedFileRef={pickedFileRef}
                        />
                        <div className="flex flex-col self-center">
                            <ProfileInfo
                                userData={userData}
                                isLoading={isLoading}
                                onSaveName={handleSaveName}
                                onEmailVerification={handleEmailVerification}
                            />
                            <EmailSection
                                isLoading={isLoading}
                                isSubmitting={isSubmitting}
                                onEmailUpdate={handleEmailUpdate}
                            />
                            <PasswordSection
                                userData={userData}
                                isLoading={isLoading}
                                isSubmitting={isSubmitting}
                                onPasswordUpdate={handlePasswordUpdate}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
