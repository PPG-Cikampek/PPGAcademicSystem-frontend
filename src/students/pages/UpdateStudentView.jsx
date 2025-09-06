import {
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
} from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useStudent, useUpdateStudentMutation } from "../../shared/queries";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import FileUpload from "../../shared/Components/FormElements/FileUpload";
import { Icon } from "@iconify-icon/react";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const UpdateStudentView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [localError, setLocalError] = useState(null);
    const [loadedDate, setLoadedDate] = useState();
    const [fields, setFields] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use refs for large binary data to avoid re-renders
    const croppedImageRef = useRef(null);
    const fileInputRef = useRef();
    const originalDataRef = useRef(null); // Store original data for comparison

    const auth = useContext(AuthContext);

    const studentId = useParams().studentId;
    const navigate = useNavigate();

    // React Query hooks
    const { data: studentData, isLoading: isLoadingStudent, error: studentError } = useStudent(studentId);
    const updateStudentMutation = useUpdateStudentMutation({
        onSuccess: (data) => {
            setModal({
                title: "Berhasil!",
                message: data.message,
                onConfirm: null,
            });
            setModalIsOpen(true);
            setIsSubmitting(false);
            setLocalError(null);
        },
        onError: (error) => {
            setIsSubmitting(false);
            setLocalError(error.message || "An error occurred while updating student");
        },
    });

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
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();

            // Only append changed fields to reduce payload size
            const original = originalDataRef.current;
            const formattedName = data.name.replace(
                /\w\S*/g,
                (txt) =>
                    txt.charAt(0).toUpperCase() +
                    txt.substr(1).toLowerCase()
            );
            const formattedDate =
                data.dateOfBirth instanceof Date
                    ? data.dateOfBirth.toISOString().split("T")[0]
                    : data.dateOfBirth;

            // Only append changed fields
            if (auth.userRole === "admin" && original.nis !== data.nis) {
                formData.append("nis", data.nis);
            }
            if (original.name !== formattedName) {
                formData.append("name", formattedName);
            }
            if (original.dateOfBirth !== formattedDate) {
                formData.append("dateOfBirth", formattedDate);
            }
            if (original.gender !== data.gender) {
                formData.append("gender", data.gender);
            }
            if (original.parentName !== data.parentName) {
                formData.append("parentName", data.parentName);
            }
            if (original.parentPhone !== data.parentPhone) {
                formData.append("parentPhone", data.parentPhone);
            }
            if (original.address !== data.address) {
                formData.append("address", data.address);
            }

            // Only append image if it has been changed
            if (croppedImageRef.current) {
                formData.append("image", croppedImageRef.current);
            } else {
                if (!studentData?.image && auth.userRole !== "admin") {
                    setLocalError("Tidak ada foto yang dipilih!");
                    setIsSubmitting(false);
                    return;
                }
            }

            // Use the mutation
            await updateStudentMutation.mutateAsync({
                studentId,
                formData,
            });
        } catch (err) {
            setIsSubmitting(false);
            // Error is handled by the mutation's onError
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
                            navigate(-1);
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
        [modal.onConfirm, navigate]
    );

    return (
        <div className="m-auto max-w-md mt-14 md:mt-8">
            <Modal
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                title={modal.title}
                footer={<ModalFooter />}
            >
                {isLoadingStudent && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {!isLoadingStudent && modal.message}
            </Modal>

            {studentError && (
                <ErrorCard
                    error={studentError.message || "Failed to load student data"}
                    onClear={() => {
                        // Optionally reset the query
                    }}
                />
            )}

            {!isLoadingStudent && !studentError && fields && (
                <div
                    className={`pb-24 transition-opacity duration-300`}
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
                                            isLoadingStudent && "hidden"
                                        } border border-gray-600 bg-gray-50 size-9 rounded-full absolute offset bottom-2 right-2 translate-x-1/2 translate-y-1/2`}
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
                                        isSubmitting ||
                                        updateStudentMutation.isPending
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    disabled={
                                        isLoadingStudent ||
                                        !studentData ||
                                        isSubmitting ||
                                        updateStudentMutation.isPending
                                    }
                                >
                                    {isLoadingStudent || isSubmitting || updateStudentMutation.isPending ? (
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
