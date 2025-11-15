const AnnouncementCard = ({ announcement }) => {
    const typeColors = {
        maintenance: "bg-orange-100 text-orange-800 border-orange-200",
        beta: "bg-blue-100 text-blue-800 border-blue-200",
        info: "bg-gray-100 text-gray-800 border-gray-200",
        warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    const typeColor =
        typeColors[announcement.type] || "bg-gray-100 text-gray-800 border-gray-200";
    const borderClass = typeColor.split(" ").find((c) => c.startsWith("border-")) || "border-gray-200";

    return (
        <div
            className={`rounded-md bg-white p-6 shadow-sm border ${borderClass}`}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">
                    {announcement.title}
                </h3>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${typeColor}`}
                >
                    {announcement.type}
                </span>
            </div>
            <p className="mb-3 text-gray-600 text-sm whitespace-pre-line">{announcement.body}</p>
            {announcement.publishedAt && (
                <p className="text-gray-400 text-xs">
                    Dipublikasikan:{" "}
                    {new Date(announcement.publishedAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            )}
        </div>
    );
};

export default AnnouncementCard;
