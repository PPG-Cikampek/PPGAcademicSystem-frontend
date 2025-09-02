import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useHttp from "../../shared/hooks/http-hook";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";

import Modal from "../../shared/Components/UIElements/ModalBottomClose";
import FileUpload from "../../shared/Components/FormElements/FileUpload";
import { Icon } from "@iconify-icon/react";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import generateBase64Thumbnail from "../../shared/Utilities/generateBase64Thumbnail";

const UpdateStudentView = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { isLoading, error, sendRequest, setError } = useHttp();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [loadedStudent, setLoadedStudent] = useState();
    const [loadedDate, setLoadedDate] = useState();
    const [croppedImage, setCroppedImage] = useState(null);
    const [fields, setFields] = useState([]);

    const fileInputRef = useRef();
    const auth = useContext(AuthContext);

    const studentId = useParams().studentId;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/students/${studentId}`
                );
                setLoadedStudent(responseData.student);

                // Safe date parsing with validation
                if (responseData.student.dateOfBirth) {
                    const date = new Date(responseData.student.dateOfBirth);
                    if (!isNaN(date.getTime())) {
                        setLoadedDate(date);
                    } else {
                        setLoadedDate(null);
                    }
                } else {
                    setLoadedDate(null);
                }
            } catch (err) {}
        };
        fetchStudent();
    }, [sendRequest, studentId]);

    useEffect(() => {
        if (auth.userRole === "admin") {
            setFields([
                {
                    name: "nis",
                    label: "NIS",
                    placeholder: "20100010",
                    type: "text",
                    required: false,
                    disabled: isLoading,
                    value: loadedStudent?.nis || "",
                },
                {
                    name: "name",
                    label: "Nama Lengkap",
                    placeholder: "Nama Lengkap",
                    type: "text",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoading,
                    value: loadedStudent?.name || "",
                },
                {
                    name: "dateOfBirth",
                    label: "Tanggal Lahir",
                    placeholder: "Desa",
                    type: "date",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoading,
                    value: loadedDate || null,
                },
                {
                    name: "gender",
                    label: "Jenis Kelamin",
                    type: "select",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoading,
                    value: loadedStudent?.gender || "",
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
                    disabled: isLoading,
                    value: loadedStudent?.parentName || "",
                },
                {
                    name: "parentPhone",
                    label: "Nomor WA Orang Tua/Wali",
                    type: "phone",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoading,
                    value: loadedStudent?.parentPhone || "",
                },
                {
                    name: "address",
                    label: "Alamat",
                    type: "textarea",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoading,
                    value: loadedStudent?.address || "",
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
                    disabled: isLoading,
                    value: loadedStudent?.name || "",
                },
                {
                    name: "dateOfBirth",
                    label: "Tanggal Lahir",
                    placeholder: "Desa",
                    type: "date",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoading,
                    value: loadedDate || null,
                },
                {
                    name: "gender",
                    label: "Jenis Kelamin",
                    type: "select",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoading,
                    value: loadedStudent?.gender || "",
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
                    disabled: isLoading,
                    value: loadedStudent?.parentName || "",
                },
                {
                    name: "parentPhone",
                    label: "Nomor WA Orang Tua/Wali",
                    type: "phone",
                    placeholder: "8123456789",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoading,
                    value: loadedStudent?.parentPhone || "",
                },
                {
                    name: "address",
                    label: "Alamat",
                    type: "textarea",
                    required: auth.userRole !== "admin" ? true : false,
                    disabled: isLoading,
                    value: loadedStudent?.address || "",
                },
            ]);
        }
    }, [loadedStudent]);

    const handleFormSubmit = async (data) => {
        // Prevent submission if student data isn't loaded
        if (!loadedStudent || !loadedStudent.id) {
            setError("Data siswa belum dimuat. Silakan tunggu...");
            return;
        }

        const url = `${import.meta.env.VITE_BACKEND_URL}/students/${studentId}`;
        const formData = new FormData();

        auth.userRole === "admin" && formData.append("nis", data.nis);
        formData.append(
            "name",
            data.name.replace(
                /\w\S*/g,
                (txt) =>
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            )
        );
        formData.append(
            "dateOfBirth",
            data.dateOfBirth instanceof Date
                ? data.dateOfBirth.toISOString().split("T")[0]
                : data.dateOfBirth
        );
        formData.append("gender", data.gender);
        formData.append("parentName", data.parentName);
        formData.append("parentPhone", data.parentPhone);
        formData.append("address", data.address);

        console.log(data);
        console.log(formData);

        if (croppedImage) {
            formData.append("image", croppedImage);
            // Generate and append base64 thumbnail
            try {
                const base64Thumb = await generateBase64Thumbnail(
                    croppedImage,
                    128
                );
                formData.append("thumbnail", base64Thumb);
            } catch (err) {
                setError("Gagal membuat thumbnail!");
                throw err;
            }
        } else {
            if (!loadedStudent?.image && auth.userRole !== "admin") {
                setError("Tidak ada foto yang dipilih!");
                throw new Error("Tidak ada foto yang dipilih!");
            }
        }

        let responseData;
        try {
            responseData = await sendRequest(url, "PATCH", formData);
        } catch (err) {}
        setModal({
            title: "Berhasil!",
            message: responseData.message,
            onConfirm: null,
        });
        setModalIsOpen(true);
    };

    const ModalFooter = () => (
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

            {!isLoading && fields && (
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
                                            loadedStudent?.image
                                                ? `${
                                                      import.meta.env
                                                          .VITE_BACKEND_URL
                                                  }/${loadedStudent.image}`
                                                : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                                        }
                                        onImageCropped={setCroppedImage}
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
                                    disabled: isLoading,
                                    value: loadedStudent?.name || "",
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
                                    disabled: isLoading,
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
                                    disabled: isLoading,
                                    value: loadedStudent?.gender || "",
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
                                    disabled: isLoading,
                                    value: loadedStudent?.parentName || "",
                                },
                                {
                                    name: "address",
                                    label: "Alamat",
                                    type: "textarea",
                                    required:
                                        auth.userRole !== "admin"
                                            ? true
                                            : false,
                                    disabled: isLoading,
                                    value: loadedStudent?.address || "",
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
                                        isLoading || !loadedStudent
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    disabled={isLoading || !loadedStudent}
                                >
                                    {isLoading ? (
                                        <LoadingCircle>
                                            Processing...
                                        </LoadingCircle>
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
            )}
        </div>
    );
};

export default UpdateStudentView;
