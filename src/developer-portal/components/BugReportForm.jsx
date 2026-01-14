import { useEffect, useState, useRef } from "react";
import {
    validateBugReport,
    validateScreenshots,
    SEVERITY_LEVELS,
    SEVERITY_LABELS,
    CATEGORIES,
    CATEGORY_LABELS,
} from "../utilities/bugReportValidation";

const inputClass =
    "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-indigo-200";

const defaultValues = {
    title: "",
    description: "",
    severity: "",
    category: "other",
};

/**
 * BugReportForm Component
 * Form for submitting new bug reports
 * Follows FeatureForm.jsx pattern
 */
const BugReportForm = ({ onSubmit, onCancel, isSubmitting = false }) => {
    const [formState, setFormState] = useState(defaultValues);
    const [errors, setErrors] = useState({});
    const [screenshots, setScreenshots] = useState([]);
    const [screenshotPreviews, setScreenshotPreviews] = useState([]);
    const fileInputRef = useRef(null);

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            screenshotPreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [screenshotPreviews]);

    const handleChange = (key) => (event) => {
        const value = event.target.value;
        setFormState((prev) => ({
            ...prev,
            [key]: value,
        }));
        // Clear error when user starts typing
        if (errors[key]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files || []);

        // Validate files
        const validation = validateScreenshots(files);
        if (!validation.isValid) {
            setErrors((prev) => ({ ...prev, ...validation.errors }));
            return;
        }

        // Clear previous previews
        screenshotPreviews.forEach((url) => URL.revokeObjectURL(url));

        // Set new files and previews
        setScreenshots(files);
        setScreenshotPreviews(files.map((file) => URL.createObjectURL(file)));

        // Clear screenshot errors
        setErrors((prev) => {
            const next = { ...prev };
            delete next.screenshots;
            return next;
        });
    };

    const removeScreenshot = (index) => {
        URL.revokeObjectURL(screenshotPreviews[index]);
        setScreenshots((prev) => prev.filter((_, i) => i !== index));
        setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate form
        const {
            isValid,
            errors: validationErrors,
            values,
        } = validateBugReport({
            title: formState.title,
            description: formState.description,
            severity: formState.severity,
            category: formState.category,
        });

        // Validate screenshots
        const screenshotValidation = validateScreenshots(screenshots);

        if (!isValid || !screenshotValidation.isValid) {
            setErrors({ ...validationErrors, ...screenshotValidation.errors });
            return;
        }

        setErrors({});

        // Build FormData for file upload
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("severity", values.severity);
        formData.append("category", values.category);

        screenshots.forEach((file) => {
            formData.append("screenshots", file);
        });

        await onSubmit?.(formData);
    };

    return (
        <div className="rounded-md card-basic">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                <div className="flex flex-col gap-2">
                    <h2 className="font-semibold text-gray-900 text-xl">Laporkan Bug</h2>
                    <p className="text-gray-600 text-sm">
                        Laporkan bug yang Anda temukan. Pastikan untuk memberikan deskripsi yang
                        jelas dan langkah-langkah untuk mereproduksi bug tersebut.
                    </p>
                </div>

                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                    <label className="flex flex-col gap-2">
                        <span className="font-medium text-gray-700 text-sm">
                            Judul <span className="text-red-500">*</span>
                        </span>
                        <input
                            type="text"
                            value={formState.title}
                            onChange={handleChange("title")}
                            className={inputClass}
                            placeholder="Contoh: Tombol simpan tidak berfungsi"
                            maxLength={100}
                            required
                        />
                        {errors.title && (
                            <span className="text-red-500 text-xs">{errors.title}</span>
                        )}
                        <span className="text-gray-400 text-xs">
                            {formState.title.length}/100 karakter
                        </span>
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="font-medium text-gray-700 text-sm">
                            Tingkat Keparahan <span className="text-red-500">*</span>
                        </span>
                        <select
                            value={formState.severity}
                            onChange={handleChange("severity")}
                            className={inputClass}
                            required
                        >
                            <option value="">Pilih tingkat keparahan</option>
                            {SEVERITY_LEVELS.map((level) => (
                                <option key={level} value={level}>
                                    {SEVERITY_LABELS[level]}
                                </option>
                            ))}
                        </select>
                        {errors.severity && (
                            <span className="text-red-500 text-xs">{errors.severity}</span>
                        )}
                    </label>
                </div>

                <label className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm">
                        Deskripsi <span className="text-red-500">*</span>
                    </span>
                    <textarea
                        rows={5}
                        value={formState.description}
                        onChange={handleChange("description")}
                        className={`${inputClass} resize-none`}
                        placeholder="Jelaskan bug secara detail. Sertakan langkah-langkah untuk mereproduksi bug, perilaku yang diharapkan, dan perilaku aktual."
                        maxLength={2000}
                        required
                    />
                    {errors.description && (
                        <span className="text-red-500 text-xs">{errors.description}</span>
                    )}
                    <span className="text-gray-400 text-xs">
                        {formState.description.length}/2000 karakter
                    </span>
                </label>

                <label className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm">Kategori</span>
                    <select
                        value={formState.category}
                        onChange={handleChange("category")}
                        className={inputClass}
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {CATEGORY_LABELS[cat]}
                            </option>
                        ))}
                    </select>
                    {errors.category && (
                        <span className="text-red-500 text-xs">{errors.category}</span>
                    )}
                </label>

                <div className="flex flex-col gap-2">
                    <span className="font-medium text-gray-700 text-sm">
                        Screenshot (Opsional, maks. 3 gambar)
                    </span>
                    <div className="flex flex-wrap gap-3">
                        {screenshotPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={preview}
                                    alt={`Screenshot ${index + 1}`}
                                    className="border border-gray-200 rounded-md w-24 h-24 object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeScreenshot(index)}
                                    className="-top-2 -right-2 absolute flex justify-center items-center bg-red-500 hover:bg-red-600 rounded-full w-5 h-5 text-white text-xs"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {screenshots.length < 3 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex justify-center items-center border-2 border-gray-300 hover:border-primary border-dashed rounded-md w-24 h-24 text-gray-400 hover:text-primary transition-colors"
                            >
                                <svg
                                    className="w-8 h-8"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    {errors.screenshots && (
                        <span className="text-red-500 text-xs">{errors.screenshots}</span>
                    )}
                    <span className="text-gray-400 text-xs">
                        Format: PNG, JPG. Ukuran maks: 10MB per file.
                    </span>
                </div>

                <div className="flex sm:flex-row flex-col-reverse gap-3 pt-4 border-gray-200 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="button-primary-subtle-outline"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="button-primary"
                    >
                        {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BugReportForm;
