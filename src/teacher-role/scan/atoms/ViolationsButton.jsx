import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const ViolationsButton = ({ onClick, isOpen, hidden }) => {
    return (
        <button
            type="button"
            className={`border p-1 px-2 rounded-full active:ring-2 active:ring-blue-300 bg-white flex justify-between items-center ${
                hidden && "hidden"
            }`}
            onClick={onClick}
        >
            Temuan
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
    );
};

export default React.memo(ViolationsButton);
