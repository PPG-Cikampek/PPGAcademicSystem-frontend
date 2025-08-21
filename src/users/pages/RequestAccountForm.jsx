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
import Modal from "../../shared/Components/UIElements/ModalBottomClose";

const RequestAccountForm = () => {
    const [modal, setModal] = useState({
        title: "",
        message: "",
        onConfirm: null,
    });
    const [modalIsOpen, setModalIsOpen] = useState(false);
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
        } catch (err) {}
        console.log(responseData);
        setModal({
            title: "Berhasil!",
            message: responseData.message,
            onConfirm: null,
        });
        setModalIsOpen(true);
    };

    const fields = isStudent ? studentFields : teacherFields;

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
        <>
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
                <div className="mx-2 mt-12">
                    <ErrorCard error={error} onClear={() => setError(null)} />
                </div>
            )}
            <div className="card-basic rounded-md items-stretch flex-col m-2">
                <div className="pb-24 transition-opacity duration-300">
                    <div className="flex flex-col p-2 justify-center items-center my-6">
                        <h2 className="text-2xl mt-4 font-medium text-center">
                            {isStudent
                                ? "Akun Peserta Didik"
                                : "Akun Tenaga Pendidik"}
                        </h2>
                    </div>
                    <form className="flex flex-col md:flex-row gap-4 items-end mb-12">
                        {fields.map((field) => (
                            <div
                                key={field.name}
                                className="flex flex-col w-full"
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
                                        selected={formData[field.name] || null}
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
                        <button
                            type="button"
                            className={`button-primary ${
                                isLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            onClick={handleAddData}
                            disabled={isLoading}
                        >
                            Tambah
                        </button>
                    </form>
                    {dataList.length > 0 && (
                        <>
                            <div>
                                <h3 className="text-lg mt-1 font-normal">
                                    List akun yang akan dibuat:
                                </h3>
                                <table className="min-w-full mt-4 border-collapse border border-gray-200">
                                    <thead>
                                        <tr>
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
                                            <tr key={index}>
                                                <td className="border border-gray-200 p-2">
                                                    {data.name}
                                                </td>
                                                <td className="border border-gray-200 p-2">
                                                    {formatDate(
                                                        data.dateOfBirth
                                                    )}
                                                </td>
                                                <td className="border border-gray-200 p-2">
                                                    {isStudent
                                                        ? data.className
                                                        : data.email}
                                                </td>
                                                <td className="border border-gray-200 p-2">
                                                    <button
                                                        type="button"
                                                        className="p-3 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-500 transition"
                                                        onClick={() =>
                                                            handleDeleteData(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                                    "Buat Permintaan Akun"
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default RequestAccountForm;
