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
import useHttp from "../../shared/hooks/http-hook";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import FileUpload from "../../shared/Components/FormElements/FileUpload";

import { Icon } from "@iconify-icon/react";

const UpdateTeacherView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadedTeacher, setLoadedTeacher] = useState();
    const [loadedDate, setLoadedDate] = useState();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use refs for large binary data to avoid re-renders
    const croppedImageRef = useRef(null);
    const fileInputRef = useRef();
    const originalDataRef = useRef(null); // Store original data for comparison

    const auth = useContext(AuthContext);

    const id = useParams().id;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTeacher = async () => {
            const url =
                auth.userRole !== "teacher"
                    ? `${import.meta.env.VITE_BACKEND_URL}/teachers/${id}`
                    : `${import.meta.env.VITE_BACKEND_URL}/teachers/user/${
                          auth.userId
                      }`;

            try {
                const responseData = await sendRequest(url);
                setLoadedTeacher(responseData.teacher);

                // Store original data for comparison to detect changes
                originalDataRef.current = {
                    name: responseData.teacher.name,
                    phone: responseData.teacher.phone,
                    position: responseData.teacher.position,
                    gender: responseData.teacher.gender,
                    address: responseData.teacher.address,
                    dateOfBirth: responseData.teacher.dateOfBirth,
                };

                // Safe date parsing with validation - store as ISO string to reduce memory
                if (responseData.teacher.dateOfBirth) {
                    const date = new Date(responseData.teacher.dateOfBirth);
                    if (!isNaN(date.getTime())) {
                        setLoadedDate(date.toISOString().split("T")[0]);
                    } else {
                        setLoadedDate(null);
                    }
                } else {
                    setLoadedDate(null);
                }
            } catch (err) {}
        };
        fetchTeacher();
    }, [sendRequest, id, auth.userRole, auth.userId]);

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

        setIsSubmitting(true);

        try {
            const url = `${import.meta.env.VITE_BACKEND_URL}/teachers/`;
            const formData = new FormData();

            // Only append changed fields to reduce payload size
            const original = originalDataRef.current;

            if (original.name !== data.name) {
                formData.append("name", data.name);
            }
            if (original.phone !== data.phone) {
                formData.append("phone", data.phone);
            }

            const formattedDate =
                data.dateOfBirth instanceof Date
                    ? data.dateOfBirth.toISOString().split("T")[0]
                    : data.dateOfBirth;

            if (original.dateOfBirth !== formattedDate) {
                formData.append("dateOfBirth", formattedDate);
            }
            if (original.gender !== data.gender) {
                formData.append("gender", data.gender);
            }
            if (original.address !== data.address) {
                formData.append("address", data.address);
            }
            if (original.position !== data.position) {
                formData.append("position", data.position);
            }

            // Always include IDs for backend identification
            formData.append("userId", loadedTeacher.userId);
            formData.append("teacherId", loadedTeacher.id);

            // Only append image if it has been changed
            if (croppedImageRef.current) {
                formData.append("image", croppedImageRef.current);
            } else {
                if (!loadedTeacher?.image && auth.userRole !== "admin") {
                    setError("Tidak ada foto yang dipilih!");
                    throw new Error("Tidak ada foto yang dipilih!");
                }
            }

            let responseData;
            try {
                responseData = await sendRequest(url, "PATCH", formData);
            } catch (err) {
                throw err;
            }
            setModal({
                title: "Berhasil!",
                message: responseData.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Memoized ModalFooter component to prevent unnecessary re-renders
    const ModalFooter = useMemo(
        () => () =>
            (
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => {
                            setModalIsOpen(false);
                            !error && navigate(-1);
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
            ),
        [modal.onConfirm, error, navigate]
    );

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
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
                                        <Icon
                                            icon="jam:upload"
                                            width="24"
                                            height="24"
                                        />
                                    }
                                    buttonClassName={`${
                                        isLoading && "hidden"
                                    } border border-gray-600 bg-gray-50 size-9 rounded-full absolute offset bottom-2 right-2 translate-x-1/2 translate-y-1/2`}
                                    imgClassName={`${
                                        isLoading && "animate-pulse"
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
                            disabled: isLoading,
                            value: loadedTeacher?.name || "",
                        },
                        {
                            name: "phone",
                            label: "Nomor WA Aktif",
                            placeholder: "8123456789",
                            type: "phone",
                            required: true,
                            disabled: isLoading,
                            value: loadedTeacher?.phone || "",
                        },
                        {
                            name: "position",
                            label: "Posisi",
                            placeholder: "Guru",
                            type: "select",
                            required: true,
                            disabled: isLoading,
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
                            disabled: isLoading,
                            value: loadedDate || null,
                        },
                        {
                            name: "gender",
                            label: "Jenis Kelamin",
                            type: "select",
                            required: true,
                            disabled: isLoading,
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
                            disabled: isLoading,
                            value: loadedTeacher?.address || "",
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
                                    isLoading || !loadedTeacher || isSubmitting
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={
                                    isLoading || !loadedTeacher || isSubmitting
                                }
                            >
                                {isLoading || isSubmitting ? (
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
