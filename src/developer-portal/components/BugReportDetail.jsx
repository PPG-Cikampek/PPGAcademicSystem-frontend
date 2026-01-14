import { useState } from "react";
import StatusBadge from "./StatusBadge";
import {
    SEVERITY_LABELS,
    CATEGORY_LABELS,
    STATUS_LABELS,
    REJECTION_REASONS
} from "../utilities/bugReportValidation";

const inputClass =
    "w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

/**
 * BugReportDetail Component
 * Full detail view with timeline, screenshots, and admin actions
 */
const BugReportDetail = ({
    report,
    isAdmin = false,
    onStatusChange,
    onAddUpdate,
    onClose,
    isUpdating = false
}) => {
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [statusAction, setStatusAction] = useState("");
    const [pointsAwarded, setPointsAwarded] = useState(report?.pointsAwarded || 0);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectionComment, setRejectionComment] = useState("");
    const [updateTitle, setUpdateTitle] = useState("");
    const [updateDescription, setUpdateDescription] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);

    if (!report) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getAvailableActions = () => {
        const transitions = {
            pending: [
                { value: "reviewing", label: "Mulai Tinjau" },
                { value: "rejected", label: "Tolak" }
            ],
            reviewing: [
                { value: "accepted", label: "Terima" },
                { value: "rejected", label: "Tolak" }
            ],
            accepted: [
                { value: "fixed", label: "Tandai Selesai" }
            ],
            rejected: [],
            fixed: []
        };
        return transitions[report.status] || [];
    };

    const handleStatusSubmit = async () => {
        if (!statusAction) return;

        const payload = {
            reportId: report.reportId,
            status: statusAction
        };

        if (statusAction === "accepted") {
            payload.pointsAwarded = pointsAwarded;
        }

        if (statusAction === "rejected") {
            if (!rejectionReason) {
                alert("Pilih alasan penolakan!");
                return;
            }
            payload.rejectionReason = rejectionReason;
            payload.rejectionComment = rejectionComment;
        }

        await onStatusChange?.(payload);
        setStatusAction("");
        setShowAdminPanel(false);
    };

    const handleAddUpdate = async () => {
        if (!updateTitle || !updateDescription) {
            alert("Judul dan deskripsi update wajib diisi!");
            return;
        }

        await onAddUpdate?.({
            reportId: report.reportId,
            title: updateTitle,
            description: updateDescription
        });

        setUpdateTitle("");
        setUpdateDescription("");
    };

    const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-gray-200 border-b">
                <div>
                    <span className="inline-block bg-gray-100 mb-2 px-2 py-0.5 rounded font-mono text-gray-500 text-xs">
                        {report.reportId}
                    </span>
                    <h2 className="font-semibold text-gray-900 text-xl">
                        {report.title}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6 overflow-y-auto">
                {/* Meta Section */}
                <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
                    <div>
                        <span className="block mb-1 text-gray-500 text-xs">Status</span>
                        <StatusBadge type="status" value={report.status} />
                    </div>
                    <div>
                        <span className="block mb-1 text-gray-500 text-xs">Keparahan</span>
                        <StatusBadge type="severity" value={report.severity} />
                    </div>
                    <div>
                        <span className="block mb-1 text-gray-500 text-xs">Kategori</span>
                        <span className="text-gray-900 text-sm">
                            {CATEGORY_LABELS[report.category] || report.category}
                        </span>
                    </div>
                    <div>
                        <span className="block mb-1 text-gray-500 text-xs">Tanggal Lapor</span>
                        <span className="text-gray-900 text-sm">
                            {formatDate(report.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Reporter Info */}
                {(report.reporterName || report.userId?.name) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="block mb-1 text-gray-500 text-xs">Pelapor</span>
                        <span className="font-medium text-gray-900 text-sm">
                            {report.reporterName || report.userId?.name}
                        </span>
                        {(report.reporterEmail || report.userId?.email) && (
                            <span className="ml-2 text-gray-500 text-xs">
                                ({report.reporterEmail || report.userId?.email})
                            </span>
                        )}
                    </div>
                )}

                {/* Description */}
                <div>
                    <h3 className="mb-2 font-medium text-gray-900">Deskripsi</h3>
                    <p className="bg-gray-50 p-4 rounded-lg text-gray-600 text-sm whitespace-pre-wrap">
                        {report.description}
                    </p>
                </div>

                {/* Screenshots */}
                {report.screenshots && report.screenshots.length > 0 && (
                    <div>
                        <h3 className="mb-2 font-medium text-gray-900">Screenshot</h3>
                        <div className="flex flex-wrap gap-3">
                            {report.screenshots.map((screenshot, index) => (
                                <img
                                    key={index}
                                    src={`${baseUrl}/${screenshot}`}
                                    alt={`Screenshot ${index + 1}`}
                                    className="hover:opacity-80 border border-gray-200 rounded-lg w-32 h-32 object-cover transition-opacity cursor-pointer"
                                    onClick={() => setSelectedImage(`${baseUrl}/${screenshot}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Points Info */}
                {report.status === "fixed" && report.pointsAwarded > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                        <span className="font-medium text-green-800">
                            ✓ Bug diperbaiki! Poin diberikan: +{report.pointsAwarded}
                        </span>
                    </div>
                )}

                {/* Rejection Info */}
                {report.status === "rejected" && report.rejectionReason && (
                    <div className="bg-red-50 p-4 rounded-lg">
                        <span className="block mb-1 text-red-600 text-xs">Alasan Penolakan</span>
                        <span className="block font-medium text-red-800">
                            {REJECTION_REASONS.find(r => r.value === report.rejectionReason)?.label || report.rejectionReason}
                        </span>
                        {report.rejectionComment && (
                            <p className="mt-2 text-red-700 text-sm">{report.rejectionComment}</p>
                        )}
                    </div>
                )}

                {/* Development Updates Timeline */}
                {report.updates && report.updates.length > 0 && (
                    <div>
                        <h3 className="mb-3 font-medium text-gray-900">Timeline Update</h3>
                        <div className="space-y-4 pl-4 border-indigo-200 border-l-2">
                            {report.updates.map((update, index) => (
                                <div key={update._id || index} className="relative">
                                    <div className="-left-[21px] absolute bg-indigo-500 rounded-full w-3 h-3"></div>
                                    <span className="block text-gray-500 text-xs">
                                        {formatDate(update.createdAt)}
                                    </span>
                                    <h4 className="font-medium text-gray-900">{update.title}</h4>
                                    <p className="text-gray-600 text-sm">{update.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Admin Panel */}
                {isAdmin && getAvailableActions().length > 0 && (
                    <div className="pt-6 border-gray-200 border-t">
                        <button
                            onClick={() => setShowAdminPanel(!showAdminPanel)}
                            className="font-medium text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                            {showAdminPanel ? "Tutup Panel Admin" : "Buka Panel Admin"}
                        </button>

                        {showAdminPanel && (
                            <div className="space-y-4 bg-indigo-50 mt-4 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900">Ubah Status</h4>
                                
                                <div className="flex flex-wrap gap-2">
                                    {getAvailableActions().map((action) => (
                                        <button
                                            key={action.value}
                                            onClick={() => setStatusAction(action.value)}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                                statusAction === action.value
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Points input for acceptance */}
                                {statusAction === "accepted" && (
                                    <label className="flex flex-col gap-2">
                                        <span className="font-medium text-gray-700 text-sm">
                                            Poin yang Akan Diberikan
                                        </span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={pointsAwarded}
                                            onChange={(e) => setPointsAwarded(parseInt(e.target.value) || 0)}
                                            className={inputClass}
                                            placeholder="Masukkan jumlah poin"
                                        />
                                    </label>
                                )}

                                {/* Rejection fields */}
                                {statusAction === "rejected" && (
                                    <>
                                        <label className="flex flex-col gap-2">
                                            <span className="font-medium text-gray-700 text-sm">
                                                Alasan Penolakan <span className="text-red-500">*</span>
                                            </span>
                                            <select
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className={inputClass}
                                                required
                                            >
                                                <option value="">Pilih alasan</option>
                                                {REJECTION_REASONS.map((reason) => (
                                                    <option key={reason.value} value={reason.value}>
                                                        {reason.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="flex flex-col gap-2">
                                            <span className="font-medium text-gray-700 text-sm">
                                                Komentar Tambahan
                                            </span>
                                            <textarea
                                                rows={3}
                                                value={rejectionComment}
                                                onChange={(e) => setRejectionComment(e.target.value)}
                                                className={`${inputClass} resize-none`}
                                                placeholder="Berikan penjelasan tambahan..."
                                            />
                                        </label>
                                    </>
                                )}

                                {statusAction && (
                                    <button
                                        onClick={handleStatusSubmit}
                                        disabled={isUpdating}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-md text-white transition-colors"
                                    >
                                        {isUpdating ? "Memproses..." : "Simpan Perubahan"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Add Update Section (for accepted/fixed reports) */}
                        {["accepted", "fixed"].includes(report.status) && (
                            <div className="space-y-4 bg-gray-50 mt-6 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900">Tambah Update</h4>
                                <label className="flex flex-col gap-2">
                                    <span className="font-medium text-gray-700 text-sm">Judul</span>
                                    <input
                                        type="text"
                                        value={updateTitle}
                                        onChange={(e) => setUpdateTitle(e.target.value)}
                                        className={inputClass}
                                        placeholder="Contoh: Investigating, Update, Resolved"
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="font-medium text-gray-700 text-sm">Deskripsi</span>
                                    <textarea
                                        rows={3}
                                        value={updateDescription}
                                        onChange={(e) => setUpdateDescription(e.target.value)}
                                        className={`${inputClass} resize-none`}
                                        placeholder="Jelaskan perkembangan terbaru..."
                                    />
                                </label>
                                <button
                                    onClick={handleAddUpdate}
                                    disabled={isUpdating || !updateTitle || !updateDescription}
                                    className="bg-gray-700 hover:bg-gray-800 disabled:opacity-50 px-4 py-2 rounded-md text-white transition-colors"
                                >
                                    {isUpdating ? "Menambahkan..." : "Tambah Update"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div
                    className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-75"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Screenshot full view"
                        className="max-w-[90vw] max-h-[90vh] object-contain"
                    />
                    <button
                        className="top-4 right-4 absolute text-white hover:text-gray-300"
                        onClick={() => setSelectedImage(null)}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default BugReportDetail;
