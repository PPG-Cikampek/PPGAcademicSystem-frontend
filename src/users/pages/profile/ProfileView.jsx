import { useContext, useEffect, useState, useRef, useCallback } from "react";

import useHttp from "../../../shared/hooks/http-hook";

import ErrorCard from "../../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";
import { AuthContext } from "../../../shared/Components/Context/auth-context";

import FileUpload from "../../../shared/Components/FormElements/FileUpload";
import DynamicForm from "../../../shared/Components/UIElements/DynamicForm";
import Modal from "../../../shared/Components/UIElements/ModalBottomClose";
import WarningCard from "../../../shared/Components/UIElements/WarningCard";
import { Pencil, X, Check } from "lucide-react";
import { Icon } from "@iconify-icon/react/dist/iconify.js";

const ProfileView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [userData, setUserData] = useState();
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isLoading, error, sendRequest, setError } = useHttp();

    // Use refs for large binary data to avoid re-renders
    const pickedFileRef = useRef(null);
    const fileInputRef = useRef();
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

    // Memoized handlers to prevent unnecessary re-renders
    const handleImageCropped = useCallback((croppedImage) => {
        pickedFileRef.current = croppedImage;
    }, []);

    const handleEmailChange = useCallback((e) => {
        setNewEmail(e.target.value);
    }, []);

    const handlePasswordChange = useCallback((e) => {
        setPassword(e.target.value);
    }, []);

    const handleConfirmPasswordChange = useCallback((e) => {
        setConfirmPassword(e.target.value);
    }, []);

    const handleOldPasswordChange = useCallback((e) => {
        setOldPassword(e.target.value);
    }, []);

    const toggleShowPassword = useCallback(() => {
        setShowPassword((prevState) => !prevState);
    }, []);

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

    const handleEmailUpdate = useCallback(async () => {
        if (!newEmail) {
            setEmailError(" Email tidak boleh kosong!");
            return;
        }

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
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
                setModalIsOpen(true);
            }
        };

        setModal({
            title: "Ubah Email?",
            message: "Pesan verifikasi akan dikirim ke email baru Anda.",
            onConfirm: updateEmail,
        });
        setModalIsOpen(true);
    }, [auth.token, sendRequest, newEmail, userData]);

    const handlePasswordUpdate = useCallback(async () => {
        if (password !== confirmPassword) {
            setPasswordError("Passwords tidak sama");
            return;
        }

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

        const updatePassword = async () => {
            try {
                const response = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/users/change-password`,
                    "POST",
                    JSON.stringify({
                        email: userData.email,
                        oldPassword,
                        newPassword: password,
                        confirmNewPassword: confirmPassword,
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
            } catch (err) {
                setModal({
                    title: "Gagal!",
                    message: err.message,
                    onConfirm: null,
                });
            }
        };
        setModal({
            title: "Ubah Password?",
            message: "Apakah anda yakin untuk mengubah password?",
            onConfirm: updatePassword,
        });
        setModalIsOpen(true);
    }, [
        auth.token,
        sendRequest,
        password,
        confirmPassword,
        oldPassword,
        userData,
    ]);

    const handleSaveName = useCallback(
        async (e) => {
            e.preventDefault();
            if (!editedName.trim()) return;
            try {
                const response = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/users/${auth.userId}`,
                    "PATCH",
                    JSON.stringify({ name: editedName }),
                    {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + auth.token,
                    }
                );
                setUserData((prev) => ({ ...prev, name: editedName }));
                setIsEditingName(false);
                setModal({
                    title: "Berhasil!",
                    message: response.message || "Nama berhasil diubah.",
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
        },
        [auth.userId, auth.token, sendRequest, editedName]
    );

    const ModalFooter = () => {
        return (
            <div className="flex gap-2 items-center">
                <button
                    onClick={() => {
                        setModalIsOpen(false);
                    }}
                    className={`${
                        modal.onConfirm
                            ? "btn-danger-outline"
                            : "button-primary mt-0 "
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <LoadingCircle />
                    ) : modal.onConfirm ? (
                        "Batal"
                    ) : (
                        "Tutup"
                    )}
                </button>
                {modal.onConfirm && (
                    <button
                        onClick={modal.onConfirm}
                        className={`button-primary mt-0 ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {isLoading ? <LoadingCircle /> : "Ya"}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="card-basic rounded-md flex flex-col items-stretch mb-12">
                <Modal
                    isOpen={modalIsOpen}
                    onClose={() => setModalIsOpen(false)}
                    title={modal.title}
                    footer={<ModalFooter />}
                >
                    {isLoading && (
                        <div className="flex justify-center">
                            <LoadingCircle size={32} />
                        </div>
                    )}
                    {!isLoading && modal.message}
                </Modal>

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
                        <DynamicForm
                            className={"border-0 ring-0"}
                            customDescription={
                                <div className="relative">
                                    <div className="">
                                        <FileUpload
                                            ref={fileInputRef}
                                            accept=".jpg,.jpeg,.png"
                                            buttonLabel={
                                                <Icon
                                                    icon="jam:upload"
                                                    width="24"
                                                    height="24"
                                                />
                                            }
                                            buttonClassName={`${
                                                isLoading && "hidden"
                                            } border border-gray-600 bg-gray-50 size-9 rounded-full absolute offset bottom-7 right-7 md:bottom-9 md:right-9 translate-x-1/2 translate-y-1/2`}
                                            imgClassName={`${
                                                isLoading && "animate-pulse"
                                            } mt-2 rounded-full size-48 md:size-64 shrink-0`}
                                            defaultImageSrc={
                                                userData?.image
                                                    ? `${
                                                          import.meta.env
                                                              .VITE_BACKEND_URL
                                                      }/${userData.image}`
                                                    : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                                            }
                                            onImageCropped={handleImageCropped}
                                        />
                                    </div>
                                </div>
                            }
                            onSubmit={saveImageHandler}
                            disabled={isLoading}
                            reset={false}
                            footer={false}
                            button={
                                pickedFileRef.current && (
                                    <div className="flex flex-col justify-stretch mt-4">
                                        <button
                                            type="submit"
                                            className={`button-primary ${
                                                isLoading || isSubmitting
                                                    ? "opacity-50 hover:cursor-not-allowed"
                                                    : ""
                                            }`}
                                            disabled={isLoading || isSubmitting}
                                        >
                                            {isLoading || isSubmitting ? (
                                                <LoadingCircle>
                                                    Processing...
                                                </LoadingCircle>
                                            ) : (
                                                "Simpan Gambar"
                                            )}
                                        </button>
                                    </div>
                                )
                            }
                        />
                        <div className="flex flex-col self-center">
                            {isLoading && (
                                <div className="animate-pulse flex space-x-4 mb-6">
                                    <div className="flex-1 h-fit space-y-6 py-1">
                                        <div className="h-5 bg-slate-500 rounded-sm"></div>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="h-3 bg-slate-300 rounded-sm col-span-2"></div>
                                                <div className="h-3 bg-slate-300 rounded-sm col-span-1"></div>
                                            </div>
                                            <div className="h-3 bg-slate-300 rounded-sm"></div>
                                            <div className="h-3 bg-slate-300 rounded-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {!isLoading && userData && (
                                <div className="mb-4">
                                    <div
                                        className={`flex items-center ${
                                            isEditingName
                                                ? "justify-between"
                                                : ""
                                        } gap-2 my-2`}
                                    >
                                        {isEditingName ? (
                                            <form
                                                onSubmit={handleSaveName}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="text"
                                                    value={editedName}
                                                    onChange={(e) =>
                                                        setEditedName(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="border rounded-sm m-0 px-2 py-2 font-medium text-gray-800 focus:ring-2 focus:ring-primary"
                                                    autoFocus
                                                />
                                                <button
                                                    type="submit"
                                                    className="icon-button-primary    "
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIsEditingName(false)
                                                    }
                                                    className="icon-button-danger"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </form>
                                        ) : (
                                            <>
                                                <h2 className="text-xl font-medium text-gray-800">
                                                    {userData.name}
                                                </h2>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingName(true);
                                                        setEditedName(
                                                            userData.name
                                                        );
                                                    }}
                                                    className="p-2 self-start place-self-start rounded-full hover:bg-gray-200"
                                                    title="Edit Nama"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <div className="text-gray-600 flex flex-wrap items-center mb-2 md:mb-0 md:gap-2">
                                        {userData.email}{" "}
                                        {userData.isEmailVerified ? (
                                            <Icon
                                                icon="tdesign:verified"
                                                width="18"
                                                height="18"
                                                style={{ color: "#06ff00" }}
                                            />
                                        ) : (
                                            <div
                                                onClick={
                                                    handleEmailVerification
                                                }
                                                className="p-1 border rounded-md border-red-500 text-gray-500 active:text-primary hover:cursor-pointer italic flex items-center"
                                            >
                                                Belum verifikasi{" "}
                                                <Icon
                                                    icon="ci:triangle-warning"
                                                    width="16"
                                                    height="16"
                                                    style={{ color: "#ff0000" }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-gray-600">
                                        Desa{" "}
                                        {userData?.subBranchId?.branchId?.name}
                                    </p>
                                    <p className="text-gray-600">
                                        Kelompok{" "}
                                        {userData?.subBranchId?.name || ""}
                                    </p>
                                </div>
                            )}
                            <div className="my-4">
                                <h2 className="text-base">Ubah Email</h2>
                                <div className="flex items-center justify-start">
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={handleEmailChange}
                                        placeholder="Email Baru"
                                        className={`grow mr-2 p-2 my-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 `}
                                    />
                                    <button
                                        type="button"
                                        className={`button-primary mt-0 py-2 inline-block ${
                                            isLoading || isSubmitting
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                        disabled={isLoading || isSubmitting}
                                        onClick={handleEmailUpdate}
                                    >
                                        {isLoading || isSubmitting ? (
                                            <LoadingCircle />
                                        ) : (
                                            "Ubah"
                                        )}
                                    </button>
                                </div>
                                {emailError && (
                                    <p className="text-red-500">{emailError}</p>
                                )}
                            </div>
                            {!isLoading &&
                                userData &&
                                userData.isEmailVerified && (
                                    <div className="mb-4 flex flex-col">
                                        <h2 className="text-base">
                                            Ubah Password
                                        </h2>
                                        <input
                                            type="password"
                                            value={oldPassword}
                                            onChange={handleOldPasswordChange}
                                            placeholder="Password Lama"
                                            className={`p-2 my-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 `}
                                        />
                                        <div className="relative">
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={password}
                                                onChange={handlePasswordChange}
                                                placeholder="Password Baru"
                                                className={`p-2 my-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 w-full`}
                                            />
                                            <span
                                                onClick={toggleShowPassword}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                            >
                                                {showPassword ? (
                                                    <Icon
                                                        icon="eva:eye-outline"
                                                        width="24"
                                                        height="24"
                                                        className="text-gray-400 hover:text-black transition-all duration-200"
                                                    />
                                                ) : (
                                                    <Icon
                                                        icon="eva:eye-off-outline"
                                                        width="24"
                                                        height="24"
                                                        className="text-gray-400 hover:text-black transition-all duration-200"
                                                    />
                                                )}
                                            </span>
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={
                                                handleConfirmPasswordChange
                                            }
                                            placeholder="Konfirmasi Password Baru"
                                            className={`p-2 my-1 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300 `}
                                        />
                                        {passwordError && (
                                            <p className="text-red-500">
                                                {passwordError}
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            className={`button-primary py-2 inline-block ${
                                                isLoading || isSubmitting
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                            disabled={isLoading || isSubmitting}
                                            onClick={handlePasswordUpdate}
                                        >
                                            {isLoading || isSubmitting ? (
                                                <LoadingCircle>
                                                    Processing...
                                                </LoadingCircle>
                                            ) : (
                                                "Update"
                                            )}
                                        </button>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
