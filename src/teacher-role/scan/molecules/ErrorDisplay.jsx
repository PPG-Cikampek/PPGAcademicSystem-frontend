import React from "react";

const ErrorDisplay = ({ error, onRetry }) => {
    if (!error) return null;

    return (
        <div className="mx-4 my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>Error: {error}</p>
            <button
                onClick={onRetry}
                className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Retry
            </button>
        </div>
    );
};

export default ErrorDisplay;
