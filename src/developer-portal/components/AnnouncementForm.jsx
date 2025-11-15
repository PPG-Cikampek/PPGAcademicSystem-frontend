import { useEffect, useMemo, useState } from "react";
import {
    isoStringFromLocalInput,
    localInputFromIso,
    validateAnnouncement,
} from "../utilities/formValidation";

const inputClass =
    "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

const typeOptions = [
    { value: "maintenance", label: "Pemeliharaan" },
    { value: "beta", label: "Beta" },
    { value: "info", label: "Informasi" },
    { value: "warning", label: "Peringatan" },
];

const AnnouncementForm = ({
    mode = "create",
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
}) => {
    const [formState, setFormState] = useState(() => {
        const now = new Date();
        const pad = (num) => num.toString().padStart(2, "0");
        const localTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
            now.getHours()
        )}:${pad(now.getMinutes())}`;

        return {
            id: "",
            title: "",
            body: "",
            type: "info",
            publishedAtLocal: localTimestamp,
        };
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const nextState = {
            id: initialValues?.id || "",
            title: initialValues?.title || "",
            body: initialValues?.body || "",
            type: initialValues?.type || "info",
            publishedAtLocal: localInputFromIso(initialValues?.publishedAt) || "",
        };
        setFormState(nextState);
        setErrors({});
    }, [initialValues]);

    const titleText =
        mode === "edit" ? "Perbarui Pengumuman" : "Pengumuman Baru";

    const handleChange = (key) => (event) => {
        const value = event.target.value;
        setFormState((prev) => {
            if (key === "title" && mode !== "edit" && !prev.id) {
                const generatedId = value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "")
                    .slice(0, 48);

                return {
                    ...prev,
                    title: value,
                    id: generatedId,
                };
            }

            return { ...prev, [key]: value };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const publishedAtIso = isoStringFromLocalInput(
            formState.publishedAtLocal
        );

        const { isValid, errors: validationErrors, values } =
            validateAnnouncement({
                id: formState.id,
                title: formState.title,
                body: formState.body,
                type: formState.type,
                publishedAt: publishedAtIso,
            });

        if (!isValid) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});

        await onSubmit?.({
            id: values.id,
            title: values.title,
            body: values.body,
            type: values.type,
            publishedAt: values.publishedAt,
        });
    };

    const isEditMode = useMemo(() => mode === "edit", [mode]);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="font-semibold text-gray-900 text-xl">
                    {titleText}
                </h2>
                <p className="text-gray-600 text-sm">
                    {isEditMode
                        ? "Perbarui detail pengumuman yang ditampilkan pada portal."
                        : "Publikasikan pengumuman untuk pengguna aplikasi."}
                </p>
            </div>

            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm">
                        ID Pengumuman
                    </span>
                    <input
                        type="text"
                        value={formState.id}
                        onChange={handleChange("id")}
                        className={inputClass}
                        placeholder="Contoh: announce-123"
                        required
                        disabled={isEditMode}
                    />
                    {errors.id && (
                        <span className="text-red-500 text-xs">
                            {errors.id}
                        </span>
                    )}
                </label>

                <label className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm">
                        Tipe Pengumuman
                    </span>
                    <select
                        value={formState.type}
                        onChange={handleChange("type")}
                        className={inputClass}
                    >
                        {typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.type && (
                        <span className="text-red-500 text-xs">
                            {errors.type}
                        </span>
                    )}
                </label>
            </div>

            <label className="flex flex-col gap-2">
                <span className="font-medium text-gray-700 text-sm">
                    Judul
                </span>
                <input
                    type="text"
                    value={formState.title}
                    onChange={handleChange("title")}
                    className={inputClass}
                    placeholder="Contoh: Perawatan Sistem"
                    required
                />
                {errors.title && (
                    <span className="text-red-500 text-xs">{errors.title}</span>
                )}
            </label>

            <label className="flex flex-col gap-2">
                <span className="font-medium text-gray-700 text-sm">
                    Isi Pengumuman
                </span>
                <textarea
                    rows={6}
                    value={formState.body}
                    onChange={handleChange("body")}
                    className={`${inputClass} resize-none`}
                    placeholder="Tuliskan detail pengumuman di sini."
                    required
                />
                {errors.body && (
                    <span className="text-red-500 text-xs">{errors.body}</span>
                )}
            </label>

            <label className="flex flex-col gap-2">
                <span className="font-medium text-gray-700 text-sm">
                    Waktu Publikasi
                </span>
                <input
                    type="datetime-local"
                    value={formState.publishedAtLocal}
                    onChange={handleChange("publishedAtLocal")}
                    className={inputClass}
                    required
                />
                {errors.publishedAt && (
                    <span className="text-red-500 text-xs">
                        {errors.publishedAt}
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
                    {isSubmitting ? "Menyimpan..." : isEditMode ? "Simpan" : "Publikasikan"}
                </button>
            </div>
        </form>
    );
};

export default AnnouncementForm;
