import { useEffect, useMemo, useState } from "react";
import { validateFeature } from "../utilities/formValidation";

const defaultValues = {
    title: "",
    description: "",
    status: "planned",
    eta: "",
    tagsInput: "",
    identifier: "",
};

const statusOptions = [
    { value: "planned", label: "Belum Dimulai" },
    { value: "in-progress", label: "Sedang Berlangsung" },
    { value: "completed", label: "Selesai" },
    { value: "deprecated", label: "Dihentikan" },
];

const inputClass =
    "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

const FeatureForm = ({
    mode = "create",
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
}) => {
    const [formState, setFormState] = useState(defaultValues);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const nextState = {
            title: initialValues?.title || "",
            description: initialValues?.description || "",
            status: initialValues?.status || "planned",
            eta: initialValues?.eta ? initialValues.eta.slice(0, 10) : "",
            tagsInput: Array.isArray(initialValues?.tags)
                ? initialValues.tags.join(", ")
                : initialValues?.tags || "",
            identifier: initialValues?.id || "",
        };
        setFormState(nextState);
        setErrors({});
    }, [initialValues]);

    const title = mode === "edit" ? "Perbarui Fitur" : "Tambah Fitur";

    const handleChange = (key) => (event) => {
        const value = event.target.value;
        setFormState((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const { isValid, errors: validationErrors, values } = validateFeature({
            title: formState.title,
            description: formState.description,
            status: formState.status,
            eta: formState.eta,
            tags: formState.tagsInput,
        });

        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        const payload = {
            ...values,
        };

        if (formState.identifier) {
            payload.id = formState.identifier;
        }

        await onSubmit?.(payload);
    };

    const isEditMode = useMemo(() => mode === "edit", [mode]);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="font-semibold text-gray-900 text-xl">{title}</h2>
                <p className="text-gray-600 text-sm">
                    {isEditMode
                        ? "Perbarui detail fitur yang ditampilkan pada portal informasi."
                        : "Tambahkan fitur baru beserta status perkembangannya."}
                </p>
            </div>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm">
                        Judul
                    </span>
                    <input
                        type="text"
                        value={formState.title}
                        onChange={handleChange("title")}
                        className={inputClass}
                        placeholder="Contoh: Dashboard Kehadiran Guru"
                        required
                    />
                    {errors.title && (
                        <span className="text-red-500 text-xs">
                            {errors.title}
                        </span>
                    )}
                </label>

                <label className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm">
                        Status
                    </span>
                    <select
                        value={formState.status}
                        onChange={handleChange("status")}
                        className={inputClass}
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.status && (
                        <span className="text-red-500 text-xs">
                            {errors.status}
                        </span>
                    )}
                </label>
            </div>

            <label className="flex flex-col gap-2">
                <span className="font-medium text-gray-700 text-sm">
                    Deskripsi
                </span>
                <textarea
                    rows={4}
                    value={formState.description}
                    onChange={handleChange("description")}
                    className={`${inputClass} resize-none`}
                    placeholder="Jelaskan ringkasan fitur dan manfaatnya."
                    required
                />
                {errors.description && (
                    <span className="text-red-500 text-xs">
                        {errors.description}
                    </span>
                )}
            </label>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm">
                        Target Rilis (Opsional)
                    </span>
                    <input
                        type="date"
                        value={formState.eta}
                        onChange={handleChange("eta")}
                        className={inputClass}
                    />
                    {errors.eta && (
                        <span className="text-red-500 text-xs">
                            {errors.eta}
                        </span>
                    )}
                </label>

                <label className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm">
                        ID Kustom (Opsional)
                    </span>
                    <input
                        type="text"
                        value={formState.identifier}
                        onChange={handleChange("identifier")}
                        className={inputClass}
                        placeholder="Contoh: feat-dashboard-guru"
                        disabled={isEditMode}
                    />
                </label>
            </div>

            <label className="flex flex-col gap-2">
                <span className="font-medium text-gray-700 text-sm">
                    Tag (Pisahkan dengan koma)
                </span>
                <input
                    type="text"
                    value={formState.tagsInput}
                    onChange={handleChange("tagsInput")}
                    className={inputClass}
                    placeholder="Contoh: dashboard, guru, produktivitas"
                />
            </label>

            <div className="flex flex-wrap justify-end gap-3">
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
                    {isSubmitting ? "Menyimpan..." : isEditMode ? "Simpan" : "Tambah"}
                </button>
            </div>
        </form>
    );
};

export default FeatureForm;
