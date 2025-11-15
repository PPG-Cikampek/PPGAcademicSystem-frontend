const typeColors = {
    maintenance: "bg-yellow-100 text-yellow-700",
    beta: "bg-purple-100 text-purple-700",
    info: "bg-blue-100 text-blue-700",
    warning: "bg-red-100 text-red-700",
};

const typeLabels = {
    maintenance: "Pemeliharaan",
    beta: "Beta",
    info: "Informasi",
    warning: "Peringatan",
};

const AnnouncementManagementTable = ({ announcements = [], onEdit, onDelete }) => {
    if (!announcements.length) {
        return (
            <div className="bg-white p-8 border border-gray-200 border-dashed rounded-lg text-gray-500 text-sm text-center">
                Belum ada pengumuman. Buat pengumuman baru untuk memberi tahu pengguna.
            </div>
        );
    }

    return (
        <div className="admin-portal-table bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <table className="divide-y divide-gray-200 min-w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs text-left uppercase tracking-wide">
                            Pengumuman
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs text-left uppercase tracking-wide">
                            Tipe
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs text-left uppercase tracking-wide">
                            Dipublikasikan Pada
                        </th>
                        <th className="px-6 py-3 font-semibold text-gray-500 text-xs text-right uppercase tracking-wide">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {announcements.map((announcement) => (
                        <tr key={announcement.id} className="align-top">
                            <td className="px-6 py-4 text-gray-900 text-sm">
                                <div className="flex flex-col gap-2">
                                    <p className="font-medium text-gray-900">
                                        {announcement.title}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        {announcement.body}
                                    </p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span
                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                        typeColors[announcement.type] ||
                                        "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {typeLabels[announcement.type] || announcement.type}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-sm">
                                {announcement.publishedAt
                                    ? new Date(announcement.publishedAt).toLocaleString("id-ID", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      })
                                    : "-"}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        className="px-3 py-1 btn-primary-outline text-xs"
                                        onClick={() => onEdit?.(announcement)}
                                    >
                                        Ubah
                                    </button>
                                    <button
                                        type="button"
                                        className="px-3 py-1 btn-danger-outline text-xs"
                                        onClick={() => onDelete?.(announcement)}
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

export default AnnouncementManagementTable;
