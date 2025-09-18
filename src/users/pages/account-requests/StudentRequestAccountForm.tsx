import { useContext, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useHttp from "../../../shared/hooks/http-hook";
import DynamicForm from "../../../shared/Components/UIElements/DynamicForm";
import ErrorCard from "../../../shared/Components/UIElements/ErrorCard";
import { Trash, Pencil } from "lucide-react";
import { AuthContext } from "../../../shared/Components/Context/auth-context";
import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";
import { formatDate } from "../../../shared/Utilities/formatDateToLocal";
import NewModal from "../../../shared/Components/Modal/NewModal";
import useModal from "../../../shared/hooks/useNewModal";
import { studentFields, StudentAccount, AccountField } from "../../config";
import FileUpload from "../../../shared/Components/FormElements/FileUpload";
// create an any-typed alias to bypass TS prop constraints for existing JS component
const FileUploadAny: any = FileUpload;
import { Icon } from "@iconify-icon/react";

interface ResponseData {
    message: string;
}

interface AccountFieldWithValue extends AccountField {
    value?: any;
}

// Extend StudentAccount locally to hold image File (not sent inside JSON string)
interface StudentAccountWithImage extends StudentAccount {
    _imageFile?: File; // transient
    _thumbnailDataUrl?: string; // if FileUpload provides base64 preview
}

const StudentRequestAccountForm: React.FC = () => {
    const { modalState, openModal, closeModal } = useModal();
    const [dataList, setDataList] = useState<StudentAccountWithImage[]>([]);
    const [formKey, setFormKey] = useState<number>(0);
    const [editingIndex, setEditingIndex] = useState<number>(-1);
    const { isLoading, error, sendRequest, setError, setIsLoading } = useHttp();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const pendingImageRef = useRef<File | null>(null);

    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const handleDeleteData = (index: number): void => {
        const updatedDataList = dataList.filter((_, i) => i !== index);
        setDataList(updatedDataList);
    };

    const handleSubmit = async (): Promise<void> => {
        setError(null);
        setIsLoading(true);
        if (dataList.length === 0) return;
        // Require image for every entry
        for (const entry of dataList) {
            if (!entry._imageFile) {
                setError(`Foto belum dipilih untuk akun '${entry.name}'.`);
                return;
            }
        }
        const accountsPayload = dataList.map(
            ({ _imageFile, _thumbnailDataUrl, ...rest }) => ({
                ...rest,
                accountRole: "student" as const,
            })
        );
        const formData = new FormData();
        formData.append("subBranchId", auth.userSubBranchId);
        formData.append("accountList", JSON.stringify(accountsPayload));
        dataList.forEach((entry) => {
            if (entry._imageFile) formData.append("images", entry._imageFile);
        });
        const url = `${
            (import.meta as any).env.VITE_BACKEND_URL
        }/users/requestAccounts`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { Authorization: "Bearer " + auth.token },
                body: formData,
            });
            const resData: ResponseData = await response.json();
            if (!response.ok) {
                throw new Error(
                    resData.message || "Gagal mengirim permintaan."
                );
            }
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
        } catch (e: any) {
            setError(e.message || "Gagal mengirim permintaan.");
        } finally {
            setIsLoading(false);
        }
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
                prev.map((item, i) =>
                    i === editingIndex
                        ? {
                              ...(normalized as StudentAccountWithImage),
                              _imageFile:
                                  pendingImageRef.current || item._imageFile,
                          }
                        : item
                )
            );
            setEditingIndex(-1);
        } else {
            setDataList((prev) => [
                ...prev,
                {
                    ...(normalized as StudentAccountWithImage),
                    _imageFile: pendingImageRef.current || undefined,
                },
            ]);
        }
        pendingImageRef.current = null; // reset after use

        // increment formKey to force DynamicForm remount and clear values
        setFormKey((k) => k + 1);
    };

    const handleImageCropped = useCallback((file: File) => {
        pendingImageRef.current = file;
    }, []);

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
                                      const copy: AccountFieldWithValue = {
                                          ...f,
                                      };
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
                        helpButton={null}
                        customDescription={
                            <div className="relative">
                                <FileUploadAny
                                    className="flex flex-col items-center"
                                    ref={fileInputRef as any}
                                    accept={".jpg,.jpeg,.png"}
                                    buttonLabel={
                                        isLoading ? (
                                            <div className="flex items-center">
                                                <LoadingCircle size={16}>
                                                    Memproses
                                                </LoadingCircle>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <Icon
                                                    icon="jam:upload"
                                                    width="24"
                                                    height="24"
                                                />
                                                Foto Profil
                                            </div>
                                        )
                                    }
                                    buttonClassName={`btn-round-primary text-xs m-2 p-2 pr-3`}
                                    imgClassName={`mt-2 rounded-md size-24 shrink-0`}
                                    defaultImageSrc={
                                        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                                    }
                                    onImageCropped={handleImageCropped as any}
                                />
                                {editingIndex >= 0 &&
                                    dataList[editingIndex]?._imageFile && (
                                        <p className="text-xs mt-1 text-gray-500">
                                            Foto tersimpan untuk entri ini.
                                        </p>
                                    )}
                            </div>
                        }
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
