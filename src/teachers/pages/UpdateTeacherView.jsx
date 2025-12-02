import {
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../../shared/Components/Context/auth-context";
import { useTeacher } from "../../shared/queries";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import FileUpload from "../../shared/Components/FormElements/FileUpload";

import { Icon } from "@iconify-icon/react";

const CANCEL_UPLOAD_MESSAGE = "Permintaan dibatalkan oleh pengguna.";
// Threshold for large file warning (in bytes) - adjust as needed
const LARGE_FILE_SIZE_THRESHOLD = 1 * 1024 * 1024; // 1 MB

const UpdateTeacherView = () => {
    const { modalState, openModal, closeModal } = useModal();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadedDate, setLoadedDate] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [uploadBytes, setUploadBytes] = useState({ loaded: null, total: null });
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    // Use refs for large binary data to avoid re-renders
    const croppedImageRef = useRef(null);
    const fileInputRef = useRef();
    const originalDataRef = useRef(null); // Store original data for comparison
    const activeRequestRef = useRef(null); // Store active XHR request

    const auth = useContext(AuthContext);

    const id = useParams().id;
    const navigate = useNavigate();

    // Use React Query for fetching teacher data
    const {
        data: loadedTeacher,
        isLoading: isLoadingTeacher,
        error: teacherError,
    } = useTeacher(id, auth.userRole, auth.userId);

    // Effect to set loadedDate and originalData when teacher data is loaded
    useEffect(() => {
        if (loadedTeacher) {
            // Store original data for comparison to detect changes
            originalDataRef.current = {
                name: loadedTeacher.name,
                phone: loadedTeacher.phone,
                position: loadedTeacher.position,
                gender: loadedTeacher.gender,
                address: loadedTeacher.address,
                dateOfBirth: loadedTeacher.dateOfBirth,
            };

            // Safe date parsing with validation - store as ISO string to reduce memory
            if (loadedTeacher.dateOfBirth) {
                const date = new Date(loadedTeacher.dateOfBirth);
                if (!isNaN(date.getTime())) {
                    setLoadedDate(date.toISOString().split("T")[0]);
                } else {
                    setLoadedDate(null);
                }
            } else {
                setLoadedDate(null);
            }
        }
    }, [loadedTeacher]);

    // Effect to handle teacher fetch error
    useEffect(() => {
        if (teacherError) {
            setError(teacherError.message || "Gagal memuat data guru.");
        }
    }, [teacherError]);

    // Memoized function to handle cropped image
    const handleImageCropped = useCallback((croppedImage) => {
        croppedImageRef.current = croppedImage;
    }, []);

    // Memoized function to detect if data has changed
    const hasDataChanged = useCallback((formData) => {
        if (!originalDataRef.current) return true;

        const original = originalDataRef.current;
        return (
            original.name !== formData.name ||
            original.phone !== formData.phone ||
            original.position !== formData.position ||
            original.gender !== formData.gender ||
            original.address !== formData.address ||
            original.dateOfBirth !==
                (formData.dateOfBirth instanceof Date
                    ? formData.dateOfBirth.toISOString().split("T")[0]
                    : formData.dateOfBirth) ||
            croppedImageRef.current !== null
        );
    }, []);

    const handleFormSubmit = async (data) => {
        // Prevent duplicate submissions
        if (isSubmitting) {
            return;
        }

        // Prevent submission if teacher data isn't loaded
        if (!loadedTeacher || !loadedTeacher.userId || !loadedTeacher.id) {
            setError("Data guru belum dimuat. Silakan tunggu...");
            return;
        }

        // Check if any data has actually changed
        if (!hasDataChanged(data)) {
            setError("Tidak ada perubahan data untuk disimpan.");
            return;
        }

        // Only append image if it has been changed
        if (!croppedImageRef.current) {
            if (!loadedTeacher?.image && auth.userRole !== "admin") {
                setError("Tidak ada foto yang dipilih!");
                return;
            }
        }

        // Store form data for use in confirmation callback
        const formDataSnapshot = { ...data };

        const confirmSubmit = async () => {
            setError(null);
            setIsSubmitting(true);
            setUploadProgress(0);

            try {
                const formData = new FormData();

                // Only append changed fields to reduce payload size
                const original = originalDataRef.current;

                if (original.name !== formDataSnapshot.name) {
                    formData.append("name", formDataSnapshot.name);
                }
                if (original.phone !== formDataSnapshot.phone) {
                    formData.append("phone", formDataSnapshot.phone);
                }

                const formattedDate =
                    formDataSnapshot.dateOfBirth instanceof Date
                        ? formDataSnapshot.dateOfBirth.toISOString().split("T")[0]
                        : formDataSnapshot.dateOfBirth;

                if (original.dateOfBirth !== formattedDate) {
                    formData.append("dateOfBirth", formattedDate);
                }
                if (original.gender !== formDataSnapshot.gender) {
                    formData.append("gender", formDataSnapshot.gender);
                }
                if (original.address !== formDataSnapshot.address) {
                    formData.append("address", formDataSnapshot.address);
                }
                if (original.position !== formDataSnapshot.position) {
                    formData.append("position", formDataSnapshot.position);
                }

                // Always include IDs for backend identification
                formData.append("userId", loadedTeacher.userId);
                formData.append("teacherId", loadedTeacher.id);

                // Only append image if it has been changed
                if (croppedImageRef.current) {
                    formData.append("image", croppedImageRef.current);
                }

                // Use XHR for progress tracking
                const url = `${import.meta.env.VITE_BACKEND_URL}/teachers/${id}`;
                
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
                setError(message);
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
            ? `Simpan perubahan data untuk ${loadedTeacher.name}?\n\nUkuran foto cukup besar (${fileSizeMB} MB), lanjutkan?`
            : `Simpan perubahan data untuk ${loadedTeacher.name}?`;

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
        setError(CANCEL_UPLOAD_MESSAGE);
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

            <div
                className={`pb-24 transition-opacity duration-300 ${
                    isTransitioning ? "opacity-0" : "opacity-100"
                }`}
            >
                <DynamicForm
                    customDescription={
                        <div className="relative">
                            <div className="">
                                <FileUpload
                                    ref={fileInputRef}
                                    accept=".jpg,.jpeg,.png"
                                    buttonLabel={
                                        isLoadingTeacher ? (
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
                                        isLoadingTeacher && "animate-pulse"
                                    } mt-2 rounded-md size-32 md:size-48 shrink-0`}
                                    defaultImageSrc={
                                        loadedTeacher?.image
                                            ? `${
                                                  import.meta.env
                                                      .VITE_BACKEND_URL
                                              }/${loadedTeacher.image}`
                                            : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                                    }
                                    onImageCropped={handleImageCropped}
                                />
                            </div>
                        </div>
                    }
                    subtitle={"Update Profile Tenaga Pendidik"}
                    fields={[
                        {
                            name: "name",
                            label: "Nama Lengkap",
                            placeholder: "Nama Lengkap",
                            type: "text",
                            required: true,
                            disabled: isLoadingTeacher,
                            value: loadedTeacher?.name || "",
                        },
                        {
                            name: "phone",
                            label: "Nomor WA Aktif",
                            placeholder: "8123456789",
                            type: "phone",
                            required: true,
                            disabled: isLoadingTeacher,
                            value: loadedTeacher?.phone || "",
                        },
                        {
                            name: "position",
                            label: "Posisi",
                            placeholder: "Guru",
                            type: "select",
                            required: true,
                            disabled: isLoadingTeacher,
                            value: loadedTeacher?.position || "",
                            options: [
                                { label: "MT Desa", value: "branchTeacher" },
                                {
                                    label: "MT Kelompok",
                                    value: "subBranchTeacher",
                                },
                                { label: "MS", value: "localTeacher" },
                                { label: "Asisten", value: "assistant" },
                            ],
                        },
                        {
                            name: "dateOfBirth",
                            label: "Tanggal Lahir",
                            placeholder: "Desa",
                            type: "date",
                            required: true,
                            disabled: isLoadingTeacher,
                            value: loadedDate || null,
                        },
                        {
                            name: "gender",
                            label: "Jenis Kelamin",
                            type: "select",
                            required: true,
                            disabled: isLoadingTeacher,
                            value: loadedTeacher?.gender || "",
                            options: [
                                { label: "Laki-Laki", value: "male" },
                                { label: "Perempuan", value: "female" },
                            ],
                        },
                        {
                            name: "address",
                            label: "Alamat",
                            type: "textarea",
                            required: true,
                            disabled: isLoadingTeacher,
                            value: loadedTeacher?.address || "",
                        },
                    ]}
                    onSubmit={handleFormSubmit}
                    disabled={isLoadingTeacher}
                    reset={false}
                    footer={false}
                    button={
                        <div className="flex flex-col justify-stretch mt-4">
                            <button
                                type="submit"
                                className={`button-primary ${
                                    isLoadingTeacher ||
                                    !loadedTeacher ||
                                    isSubmitting
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={
                                    isLoadingTeacher ||
                                    !loadedTeacher ||
                                    isSubmitting
                                }
                            >
                                {isLoadingTeacher ||
                                isSubmitting ? (
                                    <LoadingCircle>Processing...</LoadingCircle>
                                ) : (
                                    "Update"
                                )}
                            </button>
                            {error && (
                                <ErrorCard
                                    error={error}
                                    onClear={() => setError(null)}
                                />
                            )}
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default UpdateTeacherView;
