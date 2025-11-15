const FeatureCard = ({ feature }) => {
    const statusColors = {
        "in-progress": "bg-blue-100 text-blue-800",
        planned: "bg-purple-100 text-purple-800",
        completed: "bg-green-100 text-green-800",
        deprecated: "bg-gray-100 text-gray-800",
    };

    const statusMapping = {
        "in-progress": "Sedang Berlangsung",
        planned: "Belum Dimulai",
        completed: "Selesai",
        deprecated: "Dihentikan",
    };

    const statusColor =
        statusColors[feature.status] || "bg-gray-100 text-gray-800";

    return (
        <div className="pb-4 last:pb-0 border-gray-200 last:border-0 border-b">
            <div className="flex justify-between md:justify-start items-start gap-4 mb-3">
                <h4 className="">
                    {feature.title}
                </h4>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor} text-nowrap`}
                >
                    {statusMapping[feature.status] || "Tidak Diketahui"}
                </span>
            </div>
            <p className="mb-4 text-gray-600 text-sm">{feature.description}</p>
            <div className="flex flex-wrap gap-2 text-gray-500 text-xs">
                {feature.eta && (
                    <span className="bg-gray-100 px-2 py-1 rounded">
                        Rencana: {feature.eta}
                    </span>
                )}
            </div>
            {feature.tags && feature.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                    {feature.tags.map((tag) => (
                        <span
                            key={tag}
                            className="bg-indigo-50 px-2 py-1 rounded-full text-indigo-700 text-xs"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeatureCard;
