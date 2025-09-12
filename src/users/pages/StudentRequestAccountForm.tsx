import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import useHttp from "../../shared/hooks/http-hook";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import { Trash, Pencil } from "lucide-react";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import { formatDate } from "../../shared/Utilities/formatDateToLocal";
import NewModal from "../../shared/Components/Modal/NewModal";
import useModal from "../../shared/hooks/useNewModal";
import { studentFields, StudentAccount, AccountField } from "../config/requestAccountConfig";

interface ResponseData {
    message: string;
}

interface AccountFieldWithValue extends AccountField {
    value?: any;
}

const StudentRequestAccountForm: React.FC = () => {
    const { modalState, openModal, closeModal } = useModal();
    const [dataList, setDataList] = useState<StudentAccount[]>([]);
    const [formKey, setFormKey] = useState<number>(0);
    const [editingIndex, setEditingIndex] = useState<number>(-1);
    const { isLoading, error, sendRequest, setError } = useHttp();

    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const handleDeleteData = (index: number): void => {
        const updatedDataList = dataList.filter((_, i) => i !== index);
        setDataList(updatedDataList);
    };

    const handleSubmit = async (): Promise<void> => {
        const updatedData = {
            subBranchId: auth.userSubBranchId,
            accountList: dataList.map((account) => ({
                ...account,
                accountRole: "student" as const,
            })),
        };

        const url = `${(import.meta as any).env.VITE_BACKEND_URL}/users/requestAccounts`;
        const body = JSON.stringify(updatedData);

        console.log(body);

        let responseData: ResponseData;
        try {
            responseData = await sendRequest(url, "POST", body, {
                "Content-Type": "application/json",
                Authorization: "Bearer " + auth.token,
            });
        } catch {
            // handled by useHttp
            return;
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

    const fields: AccountField[] = studentFields;

    const handleAddFromDynamicForm = (data: Record<string, any>): void => {
        // convert date fields to ISO if Date objects or strings
        const normalized: Record<string, any> = { ...data };
        for (const f of fields) {
            if (f.type === "date" && normalized[f.name]) {
                const d = new Date(normalized[f.name]);
                normalized[f.name] = d.toISOString();
            }
        }

        if (editingIndex >= 0) {
            // update existing entry
            setDataList((prev) =>
                prev.map((item, i) => (i === editingIndex ? normalized as StudentAccount : item))
            );
            setEditingIndex(-1);
        } else {
            setDataList((prev) => [...prev, normalized as StudentAccount]);

            // After adding a new item, if on mobile, scroll to the list
            try {
                // use 1024px as breakpoint matching lg in Tailwind (lg: 1024px)
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    const el = document.getElementById("list-pendaftaran");
                    if (el && el.scrollIntoView) {
                        // small timeout to ensure DOM updated after state change
                        setTimeout(() => {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 120);
                    }
                }
            } catch (e) {
                // fail silently; scrolling is optional
            }
        }

        // increment formKey to force DynamicForm remount and clear values
        setFormKey((k) => k + 1);
    };

    const handleEditData = (index: number): void => {
        const item = dataList[index];
        if (!item) return;

        // prepare fields with value so DynamicForm will set them
        const populatedFields: AccountFieldWithValue[] = fields.map((f) => {
            const copy: AccountFieldWithValue = { ...f };
            // if date field, convert ISO string to Date object
            if (f.type === "date") {
                copy.value = item[f.name] ? new Date(item[f.name]) : null;
            } else {
                copy.value = item[f.name] !== undefined ? item[f.name] : "";
            }
            return copy;
        });

        // force DynamicForm to use these fields by changing key and fields reference
        setFormKey((k) => k + 1);
        setEditingIndex(index);
    };

    const handleCancelEdit = (): void => {
        setEditingIndex(-1);
        setFormKey((k) => k + 1);
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col items-center-safe">
            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={isLoading}
            >
                <></>
            </NewModal>
            {error && (
                <div className="mx-2 mt-12 w-full">
                    <ErrorCard error={error} onClear={() => setError(null)} />
                </div>
            )}

            <div className="flex flex-col lg:flex-row w-full gap-6 px-2 mt-10">
                <div className="flex flex-col w-full lg:basis-2/5">
                    <DynamicForm
                        key={formKey}
                        title="Form Tambah Peserta Didik"
                        fields={
                            editingIndex >= 0
                                ? // populate fields with current data for editing
                                  fields.map((f) => {
                                      const copy: AccountFieldWithValue = { ...f };
                                      const value =
                                          dataList[editingIndex]?.[f.name];
                                      if (f.type === "date") {
                                          copy.value = value
                                              ? new Date(value)
                                              : null;
                                      } else {
                                          copy.value =
                                              value !== undefined ? value : "";
                                      }
                                      return copy;
                                  })
                                : fields
                        }
                        onSubmit={(data) => handleAddFromDynamicForm(data)}
                        button={
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className={`button-primary ${
                                        isLoading
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                    disabled={isLoading}
                                >
                                    {editingIndex >= 0 ? "Update" : "Tambah"}
                                </button>
                                {editingIndex >= 0 && (
                                    <button
                                        type="button"
                                        className="button-secondary"
                                        onClick={handleCancelEdit}
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        }
                        footer={false}
                        logo={null}
                        subtitle=""
                        customDescription=""
                        helpButton={null}
                        className=""
                    />
                </div>

                {dataList.length > 0 && (
                    <div
                        id="list-pendaftaran"
                        className="card-basic rounded-md flex flex-col grow w-full h-full lg:basis-3/5"
                    >
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
                                                KELAS
                                            </th>
                                            <th className="border border-gray-200 p-2 text-left font-normal text-gray-500">
                                                AKSI
                                            </th>
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
                                                    {data.className}
                                                </td>
                                                <td className="border border-gray-200 p-2">
                                                    <div className="flex gap-2 items-center">
                                                        <button
                                                            type="button"
                                                            className="btn-icon-primary"
                                                            onClick={() =>
                                                                handleEditData(
                                                                    index
                                                                )
                                                            }
                                                            aria-label="Edit"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
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
                                                    </div>
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

export default StudentRequestAccountForm;