import { useMemo, useState } from "react";
import DynamicForm from "../../shared/Components/UIElements/DynamicForm";

const categoryOptions = [
    { value: "", label: "Pilih kategori" },
    { value: "general", label: "Umum" },
    { value: "technical", label: "Teknis" },
    { value: "usage", label: "Penggunaan" },
];

const FAQForm = ({
    mode = "create",
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
}) => {
    const [formError, setFormError] = useState(null);

    const fields = useMemo(() => {
        const defaults = {
            question: initialValues?.question || "",
            answer: initialValues?.answer || "",
            category: initialValues?.category || "",
            order:
                typeof initialValues?.order === "number"
                    ? initialValues.order
                    : initialValues?.order
                    ? Number(initialValues.order)
                    : 0,
        };

        return [
            {
                name: "question",
                type: "textarea",
                label: "Pertanyaan",
                textAreaRows: 3,
                required: "Pertanyaan wajib diisi",
                value: defaults.question,
                validation: {
                    minLength: {
                        value: 10,
                        message: "Pertanyaan minimal terdiri dari 10 karakter",
                    },
                    maxLength: {
                        value: 200,
                        message: "Pertanyaan maksimal 200 karakter",
                    },
                },
            },
            {
                name: "answer",
                type: "textarea",
                label: "Jawaban",
                textAreaRows: 6,
                required: "Jawaban wajib diisi",
                value: defaults.answer,
                validation: {
                    minLength: {
                        value: 20,
                        message: "Jawaban minimal terdiri dari 20 karakter",
                    },
                    maxLength: {
                        value: 2000,
                        message: "Jawaban maksimal 2000 karakter",
                    },
                },
            },
            {
                name: "category",
                type: "select",
                label: "Kategori",
                value: defaults.category,
                options: categoryOptions,
            },
            {
                name: "order",
                type: "number",
                label: "Urutan Tampilan",
                required: "Urutan tampilan wajib diisi",
                value: defaults.order,
                min: 0,
                step: 1,
            },
        ];
    }, [initialValues]);

    const handleSubmit = (values) => {
        setFormError(null);

        const orderValue = Number(values.order);
        if (Number.isNaN(orderValue)) {
            setFormError("Urutan tampilan harus berupa angka.");
            return;
        }

        const payload = {
            question: values.question?.trim(),
            answer: values.answer?.trim(),
            category: values.category || null,
            order: orderValue,
        };

        onSubmit?.(payload);
    };

    const titleText =
        mode === "edit" ? "Perbarui Pertanyaan" : "Pertanyaan Baru";
    const descriptionText =
        mode === "edit"
            ? "Modifikasi konten FAQ untuk memastikan informasi tetap akurat."
            : "Tambahkan pertanyaan baru untuk membantu pengguna menyelesaikan kendala.";

    return (
        <div className="">
            <DynamicForm
                title={titleText}
                subtitle={descriptionText}
                fields={fields}
                onSubmit={handleSubmit}
                footer={false}
                button={
                    <>
                        {formError && (
                            <p className="mt-2 text-red-500 text-sm">
                                {formError}
                            </p>
                        )}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="btn-round-gray"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="btn-round-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Menyimpan..."
                                    : mode === "edit"
                                    ? "Simpan Perubahan"
                                    : "Simpan FAQ"}
                            </button>
                        </div>
                    </>
                }
            />
        </div>
    );
};

export default FAQForm;
