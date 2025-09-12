import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useHttp from "../../shared/hooks/http-hook";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { Trash } from "lucide-react";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import { formatDate } from "../../shared/Utilities/formatDateToLocal";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";

const RequestAccountForm = () => {
    const { modalState, openModal, closeModal } = useModal();
    const [isStudent, setIsStudent] = useState(false);
    const [dataList, setDataList] = useState([]);
    const { isLoading, error, sendRequest, setError } = useHttp();

    const navigate = useNavigate();
    const accountType = useParams().accountType;
    const auth = useContext(AuthContext);

    const teacherFields = [
        {
            name: "name",
            label: "Nama",
            placeholder: "Nama Lengkap",
            type: "text",
            required: true,
        },
        {
            name: "dateOfBirth",
            label: "Tanggal Lahir",
            placeholder: "Tanggal Lahir",
            type: "date",
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
            name: "phone",
            label: "Nomor WA Aktif",
            placeholder: "8123456789",
            type: "phone",
            required: true,
        },
        {
            name: "position",
            label: "Posisi",
            placeholder: "Pilih Posisi",
            type: "select",
            required: true,
            options: [
                { label: "MT Desa", value: "branchTeacher" },
                { label: "MT Kelompok", value: "subBranchTeacher" },
                { label: "MS", value: "localTeacher" },
                { label: "Asisten", value: "assistant" },
            ],
        },
        {
            name: "gender",
            label: "Jenis Kelamin",
            type: "select",
            placeholder: "Pilih Jenis Kelamin",
            required: true,
            options: [
                { label: "Laki-Laki", value: "male" },
                { label: "Perempuan", value: "female" },
            ],
        },
        {
            name: "address",
            label: "Alamat",
            placeholder: "Alamat Lengkap",
            type: "textarea",
            required: true,
        },
    ];

    const studentFields = [
        {
            name: "name",
            label: "Nama",
            placeholder: "Nama Lengkap",
            type: "text",
            required: true,
        },
        {
            name: "dateOfBirth",
            label: "Tanggal Lahir",
            placeholder: "Tanggal Lahir",
            type: "date",
            required: true,
        },
        {
            name: "className",
            label: "Kelas",
            placeholder: "Pilih Kelas",
            type: "select",
            required: true,
            options: [
                { label: "Kelas PRA-PAUD", value: "Kelas PRA-PAUD" },
                { label: "Kelas PAUD", value: "Kelas PAUD" },
                { label: "Kelas 1", value: "Kelas 1" },
                { label: "Kelas 2", value: "Kelas 2" },
                { label: "Kelas 3", value: "Kelas 3" },
                { label: "Kelas 4", value: "Kelas 4" },
                { label: "Kelas 5", value: "Kelas 5" },
                { label: "Kelas 6", value: "Kelas 6" },
            ],
        },
        {
            name: "gender",
            label: "Jenis Kelamin",
            type: "select",
            placeholder: "Pilih Jenis Kelamin",
            required: true,
            options: [
                { label: "Laki-Laki", value: "male" },
                { label: "Perempuan", value: "female" },
            ],
        },
        {
            name: "parentName",
            label: "Nama Orang Tua/Wali",
            placeholder: "Nama Orang Tua/Wali",
            type: "text",
            required: true,
        },
        {
            name: "parentPhone",
            label: "Nomor WA Orang Tua/Wali",
            placeholder: "8123456789",
            type: "phone",
            required: true,
        },
        {
            name: "address",
            label: "Alamat",
            placeholder: "Alamat Lengkap",
            type: "textarea",
            required: true,
        },
    ];

    useEffect(() => {
        if (accountType === "student") {
            setIsStudent(true);
        } else {
            setIsStudent(false);
        }
    }, [accountType]);

    // DynamicForm will handle local input state; we'll receive validated data in onAdd

    const handleAddData = () => {
        // kept for compatibility if called directly; prefer using onAdd from DynamicForm
    };

    const handleDeleteData = (index) => {
        const updatedDataList = dataList.filter((_, i) => i !== index);
        setDataList(updatedDataList);
    };

    const handleSubmit = async () => {
        const updatedData = {
            subBranchId: auth.userSubBranchId,
            accountList: dataList.map((account) => ({
                ...account,
                accountRole: accountType === "student" ? "student" : "teacher",
            })),
        };

        const url = `${import.meta.env.VITE_BACKEND_URL}/users/requestAccounts`;
        const body = JSON.stringify(updatedData);

        console.log(body);

        let responseData;
        try {
            responseData = await sendRequest(url, "POST", body, {
                "Content-Type": "application/json",
                Authorization: "Bearer " + auth.token,
            });
        } catch {
            // handled by useHttp
        }
        console.log(responseData);
        openModal(
            responseData.message,
            "success",
            () => {
                navigate(-1);
                return false; // Prevent immediate redirect
            },
            "Berhasil!",
            false
        );
    };

    const fields = isStudent ? studentFields : teacherFields;

    const handleAddFromDynamicForm = (data) => {
        // convert date fields to ISO if Date objects or strings
        const normalized = { ...data };
        for (const f of fields) {
            if (f.type === "date" && normalized[f.name]) {
                const d = new Date(normalized[f.name]);
                normalized[f.name] = d.toISOString();
            }
        }
        setDataList((prev) => [...prev, normalized]);
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col items-center-safe">
            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={isLoading}
            />
            {error && (
                <div className="mx-2 mt-12 w-full">
                    <ErrorCard error={error} onClear={() => setError(null)} />
                </div>
            )}

            <div className="flex flex-col lg:flex-row w-full gap-6 px-2 mt-10">
                <div className="flex flex-col w-full lg:basis-2/5">
                    <DynamicForm
                        title={`Form Tambah ${
                            isStudent ? "Peserta Didik" : "Tenaga Pendidik"
                        }`}
                        fields={fields}
                        onSubmit={(data) => handleAddFromDynamicForm(data)}
                        button={
                            <button
                                type="submit"
                                className={`button-primary ${
                                    isLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                disabled={isLoading}
                            >
                                Tambah
                            </button>
                        }
                        footer={false}
                    />
                </div>

                {dataList.length > 0 && (
                    <div className="card-basic rounded-md flex flex-col grow w-full h-full lg:basis-3/5">
                        <div>
                            <h3 className="text-lg mt-1 font-normal">
                                List Pendaftaran
                            </h3>
                            <div className="overflow-x-auto mt-4">
                                <table className="min-w-full border-collapse border border-gray-200 text-sm">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-200 p-2 text-left font-normal text-gray-500">
                                                NAMA
                                            </th>
                                            <th className="border border-gray-200 p-2 text-left font-normal text-gray-500">
                                                TANGGAL LAHIR
                                            </th>
                                            <th className="border border-gray-200 p-2 text-left font-normal text-gray-500">
                                                {isStudent ? "KELAS" : "EMAIL"}
                                            </th>
                                            <th className="border border-gray-200 p-2 text-left font-normal text-gray-500"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataList.map((data, index) => (
                                            <tr
                                                key={index}
                                                className="odd:bg-white even:bg-gray-50"
                                            >
                                                <td className="border border-gray-200 p-2 whitespace-nowrap">
                                                    {data.name}
                                                </td>
                                                <td className="border border-gray-200 p-2 whitespace-nowrap">
                                                    {formatDate(
                                                        data.dateOfBirth
                                                    )}
                                                </td>
                                                <td className="border border-gray-200 p-2 whitespace-nowrap">
                                                    {isStudent
                                                        ? data.className
                                                        : data.email}
                                                </td>
                                                <td className="border border-gray-200 p-2">
                                                    <button
                                                        type="button"
                                                        className="btn-icon-danger"
                                                        onClick={() =>
                                                            handleDeleteData(
                                                                index
                                                            )
                                                        }
                                                        aria-label="Hapus"
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                type="button"
                                className={`button-primary ${
                                    isLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <LoadingCircle>Processing...</LoadingCircle>
                                ) : (
                                    "Kirim Pendaftaran"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestAccountForm;
