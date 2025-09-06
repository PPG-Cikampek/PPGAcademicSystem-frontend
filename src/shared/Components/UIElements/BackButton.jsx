import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GeneralContext } from "../Context/general-context";

import { ChevronLeft } from "lucide-react";

const BackButton = ({ label = "kembali", className = "" }) => {
    const general = useContext(GeneralContext);
    const navigate = useNavigate();

    return (
        <button
            onClick={() => {
                general.navigateBlockMessage
                    ? general.navigateBlockMessage !== true
                        ? alert(general.navigateBlockMessage)
                        : window.history.back()
                    : window.history.back();
            }}
            className={`btn-round-gray pl-2 m-0 ${className}`}
        >
            <span className="flex items-center">
                <ChevronLeft size={20} /> {label}
            </span>
        </button>
    );
};

export default BackButton;
