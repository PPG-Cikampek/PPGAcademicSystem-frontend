const ReleaseManagementTable = ({ releases = [], onEdit, onDelete }) => {
    if (!releases.length) {
        return (
            <div className="bg-white p-8 border border-gray-200 border-dashed rounded-lg text-gray-500 text-sm text-center">
                Belum ada catatan rilis. Tambahkan catatan rilis pertama Anda.
            </div>
        );
    }

    return (
        <div className="admin-portal-table bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <table className="divide-y divide-gray-200 min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs text-left uppercase tracking-wide">
                            Versi &amp; Sorotan
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs text-left uppercase tracking-wide">
                            Tanggal
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs text-right uppercase tracking-wide">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {releases.map((release) => (
                        <tr key={release.id || release.version} className="align-top">
                            <td className="px-6 py-4 text-gray-900 text-sm">
                                <div className="flex flex-col gap-2">
                                    <p className="font-medium text-gray-900">
                                        Versi {release.version}
                                    </p>
                                    {release.highlights && release.highlights.length > 0 && (
                                        <ul className="space-y-1 pl-5 text-gray-600 text-sm list-disc">
                                            {release.highlights.map((highlight, index) => (
                                                <li key={`${release.id}-highlight-${index}`}>
                                                    {highlight}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-sm">
                                {release.date || "-"}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        className="px-3 py-1 btn-primary-outline text-xs"
                                        onClick={() => onEdit?.(release)}
                                    >
                                        Ubah
                                    </button>
                                    <button
                                        type="button"
                                        className="px-3 py-1 btn-danger-outline text-xs"
                                        onClick={() => onDelete?.(release)}
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

export default ReleaseManagementTable;
