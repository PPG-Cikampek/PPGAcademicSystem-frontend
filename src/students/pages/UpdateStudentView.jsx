import {
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useStudent } from "../../shared/queries";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import FileUpload from "../../shared/Components/FormElements/FileUpload";
import { Icon } from "@iconify-icon/react";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const CANCEL_UPLOAD_MESSAGE = "Permintaan dibatalkan oleh pengguna.";
// Threshold for large file warning (in bytes) - adjust as needed
const LARGE_FILE_SIZE_THRESHOLD = 1 * 1024 * 1024; // 1 MB

const UpdateStudentView = () => {
    const { modalState, openModal, closeModal } = useModal();
    const [localError, setLocalError] = useState(null);
    const [loadedDate, setLoadedDate] = useState();
    const [fields, setFields] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [uploadBytes, setUploadBytes] = useState({ loaded: null, total: null });
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    // Use refs for large binary data to avoid re-renders
    const croppedImageRef = useRef(null);
    const fileInputRef = useRef();
    const originalDataRef = useRef(null); // Store original data for comparison
    const activeRequestRef = useRef(null); // Store active XHR request

    const auth = useContext(AuthContext);

    const studentId = useParams().studentId;
    const navigate = useNavigate();

    // React Query hooks
    const {
        data: studentData,
        isLoading: isLoadingStudent,
        error: studentError,
    } = useStudent(studentId);

    // Handle student data loading and original data setup
    useEffect(() => {
        if (studentData) {
            // Store original data for comparison to detect changes
            originalDataRef.current = {
                nis: studentData.nis,
                name: studentData.name,
                dateOfBirth: studentData.dateOfBirth,
                gender: studentData.gender,
                parentName: studentData.parentName,
                parentPhone: studentData.parentPhone,
                address: studentData.address,
            };

            // Safe date parsing with validation - store as ISO string to reduce memory
            if (studentData.dateOfBirth) {
                const date = new Date(studentData.dateOfBirth);
                if (!isNaN(date.getTime())) {
                    setLoadedDate(date.toISOString().split("T")[0]);
                } else {
                    setLoadedDate(null);
                }
            } else {
                setLoadedDate(null);
            }
        }
    }, [studentData]);

    useEffect(() => {
        if (auth.userRole === "admin") {
            setFields([
                {
                    name: "nis",
                    label: "NIS",
                    placeholder: "20100010",
                    type: "text",
                    required: false,
                    disabled: isLoadingStudent,
                    value: studentData?.nis || "",
                },
                {
                    name: "name",
                    label: "Nama Lengkap",
                    placeholder: "Nama Lengkap",
                    type: "text",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: studentData?.name || "",
                },
                {
                    name: "dateOfBirth",
                    label: "Tanggal Lahir",
                    placeholder: "Desa",
                    type: "date",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: loadedDate || null,
                },
                {
                    name: "gender",
                    label: "Jenis Kelamin",
                    type: "select",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: studentData?.gender || "",
                    options: [
                        { label: "Laki-Laki", value: "male" },
                        { label: "Perempuan", value: "female" },
                    ],
                },
                {
                    name: "parentName",
                    label: "Nama Orang Tua/Wali",
                    type: "text",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: studentData?.parentName || "",
                },
                {
                    name: "parentPhone",
                    label: "Nomor WA Orang Tua/Wali",
                    type: "phone",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: studentData?.parentPhone || "",
                },
                {
                    name: "address",
                    label: "Alamat",
                    type: "textarea",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: studentData?.address || "",
                },
            ]);
        } else {
            setFields([
                {
                    name: "name",
                    label: "Nama Lengkap",
                    placeholder: "Nama Lengkap",
                    type: "text",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: studentData?.name || "",
                },
                {
                    name: "dateOfBirth",
                    label: "Tanggal Lahir",
                    placeholder: "Desa",
                    type: "date",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: loadedDate || null,
                },
                {
                    name: "gender",
                    label: "Jenis Kelamin",
                    type: "select",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: studentData?.gender || "",
                    options: [
                        { label: "Laki-Laki", value: "male" },
                        { label: "Perempuan", value: "female" },
                    ],
                },
                {
                    name: "parentName",
                    label: "Nama Orang Tua/Wali",
                    type: "text",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: studentData?.parentName || "",
                },
                {
                    name: "parentPhone",
                    label: "Nomor WA Orang Tua/Wali",
                    type: "phone",
                    placeholder: "8123456789",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: studentData?.parentPhone || "",
                },
                {
                    name: "address",
                    label: "Alamat",
                    type: "textarea",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoadingStudent,
                    value: studentData?.address || "",
                },
            ]);
        }
    }, [studentData, loadedDate, auth.userRole, isLoadingStudent]);

    // Memoized function to handle cropped image
    const handleImageCropped = useCallback((croppedImage) => {
        croppedImageRef.current = croppedImage;
    }, []);

    // Memoized function to detect if data has changed
    const hasDataChanged = useCallback(
        (formData) => {
            if (!originalDataRef.current) return true;

            const original = originalDataRef.current;
            const formattedDate =
                formData.dateOfBirth instanceof Date
                    ? formData.dateOfBirth.toISOString().split("T")[0]
                    : formData.dateOfBirth;

            return (
                (auth.userRole === "admin" && original.nis !== formData.nis) ||
                original.name !==
                    formData.name?.replace(
                        /\w\S*/g,
                        (txt) =>
                            txt.charAt(0).toUpperCase() +
                            txt.substr(1).toLowerCase()
                    ) ||
                original.dateOfBirth !== formattedDate ||
                original.gender !== formData.gender ||
                original.parentName !== formData.parentName ||
                original.parentPhone !== formData.parentPhone ||
                original.address !== formData.address ||
                croppedImageRef.current !== null
            );
        },
        [auth.userRole]
    );

    const handleFormSubmit = async (data) => {
        // Prevent duplicate submissions
        if (isSubmitting) {
            return;
        }

        // Prevent submission if student data isn't loaded
        if (!studentData || !studentData.id) {
            // Handle error - student data not loaded
            return;
        }

        // Check if any data has actually changed
        if (!hasDataChanged(data)) {
            setLocalError("Tidak ada perubahan data untuk disimpan.");
            return;
        }

        // Only append image if it has been changed
        if (!croppedImageRef.current) {
            if (!studentData?.image && auth.userRole !== "admin") {
                setLocalError("Tidak ada foto yang dipilih!");
                return;
            }
        }

        // Store form data for use in confirmation callback
        const formDataSnapshot = { ...data };

        const confirmSubmit = async () => {
            setLocalError(null);
            setIsSubmitting(true);
            setUploadProgress(0);

            try {
                const formData = new FormData();

                // Only append changed fields to reduce payload size
                const original = originalDataRef.current;
                const formattedName = formDataSnapshot.name.replace(
                    /\w\S*/g,
                    (txt) =>
                        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
                const formattedDate =
                    formDataSnapshot.dateOfBirth instanceof Date
                        ? formDataSnapshot.dateOfBirth.toISOString().split("T")[0]
                        : formDataSnapshot.dateOfBirth;

                // Only append changed fields
                if (auth.userRole === "admin" && original.nis !== formDataSnapshot.nis) {
                    formData.append("nis", formDataSnapshot.nis);
                }
                if (original.name !== formattedName) {
                    formData.append("name", formattedName);
                }
                if (original.dateOfBirth !== formattedDate) {
                    formData.append("dateOfBirth", formattedDate);
                }
                if (original.gender !== formDataSnapshot.gender) {
                    formData.append("gender", formDataSnapshot.gender);
                }
                if (original.parentName !== formDataSnapshot.parentName) {
                    formData.append("parentName", formDataSnapshot.parentName);
                }
                if (original.parentPhone !== formDataSnapshot.parentPhone) {
                    formData.append("parentPhone", formDataSnapshot.parentPhone);
                }
                if (original.address !== formDataSnapshot.address) {
                    formData.append("address", formDataSnapshot.address);
                }

                // Only append image if it has been changed
                if (croppedImageRef.current) {
                    formData.append("image", croppedImageRef.current);
                }

                // Use XHR for progress tracking
                const url = `${import.meta.env.VITE_BACKEND_URL}/students/${studentId}`;
                
                const sendWithProgress = () =>
                    new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        activeRequestRef.current = xhr;
                        xhr.open("PATCH", url);
                        xhr.setRequestHeader("Authorization", "Bearer " + auth.token);

                        xhr.upload.onprogress = (event) => {
                            if (event.lengthComputable && event.total > 0) {
                                const percent = Math.round(
                                    (event.loaded / event.total) * 100
                                );
                                setUploadProgress(percent);
                                setUploadBytes({ loaded: event.loaded, total: event.total });
                            }
                        };

                        xhr.onload = () => {
                            try {
                                const resData = JSON.parse(xhr.responseText || "{}");
                                if (xhr.status >= 200 && xhr.status < 300) {
                                    resolve(resData);
                                } else {
                                    reject(new Error(resData.message || "Gagal memperbarui data."));
                                }
                            } catch (err) {
                                reject(new Error("Respon tidak valid dari server."));
                            }
                        };

                        xhr.onerror = () => {
                            reject(new Error("Jaringan bermasalah."));
                        };

                        xhr.onabort = () => {
                            reject(new Error(CANCEL_UPLOAD_MESSAGE));
                        };

                        xhr.send(formData);
                    });

                const resData = await sendWithProgress();
                openModal(
                    resData.message,
                    "success",
                    () => {
                        navigate(-1);
                        return false;
                    },
                    "Berhasil!",
                    false
                );
            } catch (err) {
                const message = err.message || "Terjadi kesalahan saat memperbarui data.";
                setLocalError(message);
                if (message !== CANCEL_UPLOAD_MESSAGE) {
                    openModal(message, "error", null, "Gagal!", false);
                }
            } finally {
                setIsSubmitting(false);
                setUploadProgress(null);
                setUploadBytes({ loaded: null, total: null });
                activeRequestRef.current = null;
            }

            return false;
        };

        // Calculate total size for large file warning
        const imageSize = croppedImageRef.current?.size || 0;
        const isLargeFile = imageSize > LARGE_FILE_SIZE_THRESHOLD;
        const fileSizeMB = (imageSize / (1024 * 1024)).toFixed(2);
        
        const confirmMessage = isLargeFile
            ? `Simpan perubahan data untuk ${studentData.name}?\n\nUkuran foto cukup besar (${fileSizeMB} MB), lanjutkan?`
            : `Simpan perubahan data untuk ${studentData.name}?`;

        openModal(
            confirmMessage,
            "confirmation",
            confirmSubmit,
            "Konfirmasi Update",
            true
        );
    };

    const handleAttemptCloseModal = () => {
        if (isSubmitting && uploadProgress !== null && activeRequestRef.current) {
            setIsCancelModalOpen(true);
            return;
        }
        closeModal();
    };

    const handleConfirmCancelUpload = () => {
        const request = activeRequestRef.current;
        if (request) {
            request.abort();
            activeRequestRef.current = null;
        }
        setIsSubmitting(false);
        setUploadProgress(null);
        setIsCancelModalOpen(false);
        setLocalError(CANCEL_UPLOAD_MESSAGE);
        closeModal();
        return true;
    };

    return (
        <div className="m-auto mt-14 md:mt-8 max-w-md">
            <NewModal
                modalState={modalState}
                onClose={handleAttemptCloseModal}
                loadingVariant="bar"
                isLoading={isSubmitting}
                progress={uploadProgress}
                uploadedBytes={uploadBytes.loaded}
                totalBytes={uploadBytes.total}
            />
            <NewModal
                modalState={{
                    isOpen: isCancelModalOpen,
                    type: "warning",
                    title: "Batalkan Update?",
                    onConfirm: handleConfirmCancelUpload,
                    showCancel: true,
                    size: "md",
                }}
                onClose={() => setIsCancelModalOpen(false)}
                confirmText="Ya, batalkan"
                cancelText="Tidak"
            >
                <></>
            </NewModal>

            {studentError && (
                <ErrorCard
                    error={
                        studentError.message || "Failed to load student data"
                    }
                    onClear={() => {
                        // Optionally reset the query
                    }}
                />
            )}

            {!isLoadingStudent && !studentError && fields && (
                <div className={`pb-24 transition-opacity duration-300`}>
                    <DynamicForm
                        customDescription={
                            <div className="relative">
                                <div className="">
                                    <FileUpload
                                        ref={fileInputRef}
                                        accept=".jpg,.jpeg,.png"
                                        buttonLabel={
                                            isLoadingStudent ? (
                                                <div className="flex items-center">
                                                    <LoadingCircle size={16} />
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <Icon
                                                        icon="jam:upload"
                                                        width="24"
                                                        height="24"
                                                    />
                                                    Pilih Foto
                                                </div>
                                            )
                                        }
                                        buttonClassName={`btn-round-primary text-xs m-0 m-2 ml-1 p-2 pr-3 `}
                                        imgClassName={`${
                                            isLoadingStudent && "animate-pulse"
                                        } mt-2 rounded-md size-32 md:size-48 shrink-0`}
                                        defaultImageSrc={
                                            studentData?.image
                                                ? `${
                                                      import.meta.env
                                                          .VITE_BACKEND_URL
                                                  }/${studentData.image}`
                                                : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                                        }
                                        onImageCropped={handleImageCropped}
                                    />
                                </div>
                            </div>
                        }
                        subtitle={"Update Profile Peserta Didik"}
                        fields={
                            fields || [
                                {
                                    name: "name",
                                    label: "Nama Lengkap",
                                    placeholder: "Nama Lengkap",
                                    type: "text",
                                    required:
                                        auth.userRole !== "admin"
                                            ? true
                                            : false,
                                    disabled: isLoadingStudent,
                                    value: studentData?.name || "",
                                },
                                {
                                    name: "dateOfBirth",
                                    label: "Tanggal Lahir",
                                    placeholder: "Desa",
                                    type: "date",
                                    required:
                                        auth.userRole !== "admin"
                                            ? true
                                            : false,
                                    disabled: isLoadingStudent,
                                    value: loadedDate || null,
                                },
                                {
                                    name: "gender",
                                    label: "Jenis Kelamin",
                                    type: "select",
                                    required:
                                        auth.userRole !== "admin"
                                            ? true
                                            : false,
                                    disabled: isLoadingStudent,
                                    value: studentData?.gender || "",
                                    options: [
                                        { label: "Laki-Laki", value: "male" },
                                        { label: "Perempuan", value: "female" },
                                    ],
                                },
                                {
                                    name: "parentName",
                                    label: "Nama Orang Tua",
                                    type: "text",
                                    required:
                                        auth.userRole !== "admin"
                                            ? true
                                            : false,
                                    disabled: isLoadingStudent,
                                    value: studentData?.parentName || "",
                                },
                                {
                                    name: "address",
                                    label: "Alamat",
                                    type: "textarea",
                                    required:
                                        auth.userRole !== "admin"
                                            ? true
                                            : false,
                                    disabled: isLoadingStudent,
                                    value: studentData?.address || "",
                                },
                            ]
                        }
                        onSubmit={handleFormSubmit}
                        disabled={isLoadingStudent}
                        reset={false}
                        footer={false}
                        button={
                            <div className="flex flex-col justify-stretch mt-4">
                                <button
                                    type="submit"
                                    className={`button-primary ${
                                        isLoadingStudent ||
                                        !studentData ||
                                        isSubmitting
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    disabled={
                                        isLoadingStudent ||
                                        !studentData ||
                                        isSubmitting
                                    }
                                >
                                    {isLoadingStudent ||
                                    isSubmitting ? (
                                        <LoadingCircle>
                                            Processing...
                                        </LoadingCircle>
                                    ) : (
                                        "Update"
                                    )}
                                </button>
                                {localError && (
                                    <ErrorCard
                                        error={localError}
                                        onClear={() => setLocalError(null)}
                                    />
                                )}
                            </div>
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default UpdateStudentView;
