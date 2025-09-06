import React from "react";

const BulkActionButton = ({ onClick, disabled, children, className }) => {
    return (
        <button onClick={onClick} className={className} disabled={disabled}>
            {children}
        </button>
    );
};

export default BulkActionButton;
