import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useHttp from "../../shared/hooks/http-hook";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
    const [formData, setFormData] = useState({});
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
            type: "tel",
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
            type: "tel",
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDateChange = (birthDate, name) => {
        birthDate = new Date(birthDate).toISOString();
        setFormData({ ...formData, [name]: birthDate });
    };

    const handleAddData = () => {
        const fields = isStudent ? studentFields : teacherFields;
        for (let field of fields) {
            if (!formData[field.name]) {
                setError(`${field.label} tidak boleh kosong!`);
                return;
            }
        }
        setDataList([...dataList, formData]);
        setFormData({});
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
                
                <div className="card-basic rounded-md flex flex-col w-full lg:basis-2/5">
                    <div className="p-2 flex flex-col justify-center items-center mb-4 mt-2">
                        <h2 className="text-2xl font-medium text-center">
                            {isStudent
                                ? "Peserta Didik Baru"
                                : "Tenaga Pendidik Baru"}
                        </h2>
                    </div>
                    <form className="flex flex-col gap-6 items-stretch mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            {fields.map((field) => (
                                <div
                                    key={field.name}
                                    className={`flex flex-col w-full ${
                                        field.name === "address"
                                            ? "md:col-span-2"
                                            : ""
                                    }`}
                                >
                                    <label
                                        htmlFor={field.name}
                                        className="block text-gray-700 pb-1"
                                    >
                                        {field.label}
                                    </label>
                                    {field.type === "select" ? (
                                        <select
                                            id={field.name}
                                            name={field.name}
                                            value={formData[field.name] || ""}
                                            onChange={handleInputChange}
                                            required={field.required}
                                            className="w-full p-2 border rounded-md shadow-xs hover:ring-secondary-subtle focus:outline-hidden focus:ring-2 focus:ring-secondary transition-all duration-300"
                                        >
                                            <option value="" disabled>
                                                {field.placeholder}
                                            </option>
                                            {field.options.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.type === "date" ? (
                                        <DatePicker
                                            selected={
                                                formData[field.name] || null
                                            }
                                            onChange={(birthDate) =>
                                                handleDateChange(
                                                    birthDate,
                                                    field.name
                                                )
                                            }
                                            className="w-full p-2 border rounded-md shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300"
                                            dateFormat="dd/MM/yyyy"
                                            wrapperClassName="w-full"
                                            showYearDropdown
                                            showMonthDropdown
                                            isClearable
                                        />
                                    ) : field.type === "textarea" ? (
                                        <textarea
                                            id={field.name}
                                            name={field.name}
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ""}
                                            onChange={handleInputChange}
                                            required={field.required}
                                            rows={3}
                                            className="w-full p-2 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300"
                                        />
                                    ) : (
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            value={formData[field.name] || ""}
                                            onChange={handleInputChange}
                                            required={field.required}
                                            className="w-full p-2 border rounded-[4px] shadow-xs hover:ring-1 hover:ring-primary focus:outline-hidden focus:ring-2 focus:ring-primary transition-all duration-300"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className={`button-primary ${
                                    isLoading
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                                onClick={handleAddData}
                                disabled={isLoading}
                            >
                                Tambah
                            </button>
                        </div>
                    </form>
                </div>

                {dataList.length > 0 && (
                    <div className="card-basic rounded-md flex flex-col grow w-full lg:basis-3/5">
                        <div>
                            <h3 className="text-lg mt-1 font-normal">
                                List akun yang akan dibuat:
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
                                                        className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-500 transition"
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
                                    "Buat Pendaftaran Akun"
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
