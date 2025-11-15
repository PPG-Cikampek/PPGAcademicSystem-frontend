import { useEffect, useMemo, useState } from "react";
import { validateRelease } from "../utilities/formValidation";

const inputClass =
    "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

const ReleaseForm = ({
    mode = "create",
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
}) => {
    const [formState, setFormState] = useState(() => ({
        version: "",
        date: new Date().toISOString().slice(0, 10),
        highlightsText: "",
    }));
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const nextState = {
            version: initialValues?.version || initialValues?.id || "",
            date: initialValues?.date || "",
            highlightsText: Array.isArray(initialValues?.highlights)
                ? initialValues.highlights.join("\n")
                : initialValues?.highlightsText || "",
        };
        setFormState(nextState);
        setErrors({});
    }, [initialValues]);

    const title = mode === "edit" ? "Perbarui Catatan Rilis" : "Catatan Rilis Baru";

    const handleChange = (key) => (event) => {
        const value = event.target.value;
        setFormState((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const { isValid, errors: validationErrors, values } = validateRelease({
            version: formState.version,
            date: formState.date,
            highlightsText: formState.highlightsText,
        });

        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});

        await onSubmit?.({
            id: values.id,
            version: values.version,
            date: values.date,
            highlights: values.highlights,
        });
    };

    const isEditMode = useMemo(() => mode === "edit", [mode]);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="font-semibold text-gray-900 text-xl">{title}</h2>
                <p className="text-gray-600 text-sm">
                    {isEditMode
                        ? "Perbarui informasi versi aplikasi dan sorotan rilis."
                        : "Tulis catatan rilis baru untuk versi aplikasi."}
                </p>
            </div>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm">
                        Versi
                    </span>
                    <input
                        type="text"
                        value={formState.version}
                        onChange={handleChange("version")}
                        className={inputClass}
                        placeholder="Contoh: 1.5.57"
                        required
                        disabled={isEditMode}
                    />
                    {errors.version && (
                        <span className="text-red-500 text-xs">
                            {errors.version}
                        </span>
                    )}
                </label>

                <label className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm">
                        Tanggal Rilis
                    </span>
                    <input
                        type="date"
                        value={formState.date}
                        onChange={handleChange("date")}
                        className={inputClass}
                        required
                    />
                    {errors.date && (
                        <span className="text-red-500 text-xs">
                            {errors.date}
                        </span>
                    )}
                </label>
            </div>

            <label className="flex flex-col gap-2">
                <span className="font-medium text-gray-700 text-sm">
                    Sorotan (Pisahkan per baris)
                </span>
                <textarea
                    rows={6}
                    value={formState.highlightsText}
                    onChange={handleChange("highlightsText")}
                    className={`${inputClass} resize-none`}
                    placeholder={"Perbaikan bug pada modul presensi\nPeningkatan performa pada portal guru"}
                    required
                />
                {errors.highlights && (
                    <span className="text-red-500 text-xs">
                        {errors.highlights}
                    </span>
                )}
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

export default ReleaseForm;
