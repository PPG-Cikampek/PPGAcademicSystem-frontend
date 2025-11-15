const statusBadgeClasses = {
    "in-progress": "bg-blue-100 text-blue-700",
    planned: "bg-purple-100 text-purple-700",
    completed: "bg-green-100 text-green-700",
    deprecated: "bg-gray-100 text-gray-700",
};

const statusLabel = {
    "in-progress": "Sedang Berlangsung",
    planned: "Belum Dimulai",
    completed: "Selesai",
    deprecated: "Dihentikan",
};

const FeatureManagementTable = ({ features = [], onEdit, onDelete }) => {
    if (!features.length) {
        return (
            <div className="bg-white p-8 border border-gray-200 border-dashed rounded-lg text-gray-500 text-sm text-center">
                Belum ada fitur terdaftar. Tambahkan fitur baru untuk memulai.
            </div>
        );
    }

    return (
        <div className="admin-portal-table bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <table className="divide-y divide-gray-200 min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs text-left uppercase tracking-wide">
                            Fitur
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs text-left uppercase tracking-wide">
                            Status
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs text-left uppercase tracking-wide">
                            Target
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs text-right uppercase tracking-wide">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {features.map((feature) => (
                        <tr key={feature.id} className="align-top">
                            <td className="px-6 py-4 text-gray-900 text-sm">
                                <div className="flex flex-col gap-2">
                                    <p className="font-medium text-gray-900">
                                        {feature.title}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {feature.description}
                                    </p>
                                    {feature.tags && feature.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {feature.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="bg-indigo-50 px-2 py-1 rounded-full font-medium text-indigo-700 text-xs"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                        statusBadgeClasses[feature.status] ||
                                        "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {statusLabel[feature.status] || "Tidak Diketahui"}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-sm">
                                {feature.eta || "-"}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        className="px-3 py-1 btn-primary-outline text-xs"
                                        onClick={() => onEdit?.(feature)}
                                    >
                                        Ubah
                                    </button>
                                    <button
                                        type="button"
                                        className="px-3 py-1 btn-danger-outline text-xs"
                                        onClick={() => onDelete?.(feature)}
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FeatureManagementTable;
