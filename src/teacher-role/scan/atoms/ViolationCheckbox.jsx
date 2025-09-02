import React from "react";
import { SquareCheck } from "lucide-react";

const ViolationCheckbox = ({ id, checked, onChange, label, disabled }) => {
    return (
        <div className="px-2 inline-flex items-center">
            <label
                className="flex items-center cursor-pointer p-2 relative"
                htmlFor={id}
            >
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="peer h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-primary checked:border-primary"
                    id={id}
                    disabled={disabled}
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <SquareCheck />
                </span>
            </label>
            <label className="cursor-pointer text-sm" htmlFor={id}>
                {label}
            </label>
        </div>
    );
};

export default ViolationCheckbox;
