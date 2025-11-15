const PortalHeader = ({ title, description }) => {
    return (
        <header className="mb-6">
            <h1 className="font-bold text-gray-900 text-3xl">{title}</h1>
            {description && (
                <p className="mt-2 text-gray-600">{description}</p>
            )}
        </header>
    );
};

export default PortalHeader;
