import React from "react";
import BulkActionButton from "../atoms/BulkActionButton";

const BulkActions = ({ onBulkSakit, onBulkIzin, disabled }) => {
    return (
        <div className="flex gap-2">
            <BulkActionButton
                onClick={onBulkSakit}
                disabled={disabled}
                className="btn-mobile-secondary-outline rounded-full"
            >
                Sakit
            </BulkActionButton>
            <BulkActionButton
                onClick={onBulkIzin}
                disabled={disabled}
                className="btn-mobile-danger-outline rounded-full"
            >
                Izin
            </BulkActionButton>
        </div>
    );
};

export default BulkActions;
