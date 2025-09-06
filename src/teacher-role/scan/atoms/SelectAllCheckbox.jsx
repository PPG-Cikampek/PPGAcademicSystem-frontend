import React from "react";
import { SquareCheck } from "lucide-react";

const SelectAllCheckbox = ({ checked, onChange, label }) => {
    return (
        <div className="inline-flex items-center">
            <label
                className="flex items-center cursor-pointer relative"
                htmlFor="check-2"
            >
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="peer h-4 w-4 cursor-pointer transition-all appearance-none rounded-sm shadow-sm hover:shadow-md border border-slate-300 checked:bg-primary checked:border-primary"
                    id="check-2"
                />
                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <SquareCheck />
                </span>
            </label>
            <label
                className="cursor-pointer ml-2 my-2 text-sm"
                htmlFor="check-2"
            >
                {label}
            </label>
        </div>
    );
};

export default SelectAllCheckbox;
