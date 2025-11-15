const EmptyState = ({ message = "Nothing to display yet." }) => {
    return (
        <div className="bg-gray-50 p-6 border border-gray-200 border-dashed rounded-md text-center">
            <p className="text-gray-500 text-sm">{message}</p>
        </div>
    );
};

export default EmptyState;
