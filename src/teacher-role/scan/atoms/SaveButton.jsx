import React from "react";
import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";

const SaveButton = ({ onClick, disabled, isLoading }) => {
    return (
        <button
            onClick={onClick}
            className="btn-round-primary"
            disabled={disabled}
        >
            {isLoading ? <LoadingCircle>Menyimpan...</LoadingCircle> : "Simpan"}
        </button>
    );
};

export default SaveButton;
