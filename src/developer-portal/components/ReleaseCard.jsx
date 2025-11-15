const ReleaseCard = ({ release }) => {
    return (
        <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                        v{release.version}
                    </h3>
                    <p className="text-gray-500 text-sm">{release.date}</p>
                </div>
                <span className="bg-green-100 px-3 py-1 rounded-full font-medium text-green-800 text-xs">
                    Dirilis
                </span>
            </div>
            {release.highlights && release.highlights.length > 0 && (
                <div className="mt-4">
                    <h4>
                        Deskripsi:
                    </h4>
                    <ul className="space-y-1 mt-1 text-gray-600 text-sm">
                        {release.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start">
                                <span className="mr-2 text-green-500">✓</span>
                                <span>{highlight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ReleaseCard;
