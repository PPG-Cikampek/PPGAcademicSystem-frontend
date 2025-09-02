import React from "react";

const StatusSelect = ({ value, onChange, disabled }) => {
    return (
        <select
            value={value || ""}
            onChange={onChange}
            className="border p-1 bg-white rounded-full active:ring-2 active:ring-blue-300 h-min"
            disabled={disabled}
        >
            <option value={null}>Tanpa Keterangan</option>
            <option value="Hadir">Hadir</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Sakit">Sakit</option>
            <option value="Izin">Izin</option>
        </select>
    );
};

export default React.memo(StatusSelect);
