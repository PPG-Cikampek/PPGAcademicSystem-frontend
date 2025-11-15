import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, MoreVertical } from "lucide-react";

const FloatingMenu = ({
    boxWidth,
    style,
    label,
    buttons,
    horizontalStyle = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpen = (e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    };

    const handleButtonClick = (onClick) => {
        onClick?.();
        setIsOpen(false);
    };

    return (
        <div
            className="relative"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                className={style ? style : "p-1 hover:bg-gray-100 rounded-sm"}
                onClick={handleOpen}
            >
                {label ? (
                    label
                ) : horizontalStyle ? (
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                ) : (
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                )}
            </button>

            {isOpen && (
                <div
                    className={`absolute right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 ${
                        boxWidth ? boxWidth : "w-32"
                    } z-20`}
                >
                    {buttons.map((button, index) => (
                        <button
                            key={index}
                            onClick={() => handleButtonClick(button.onClick)}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2
                                ${
                                    button.variant === "danger"
                                        ? "text-red-600"
                                        : "text-gray-700"
                                }`}
                        >
                            {button.icon && <button.icon className="w-4 h-4 shrink-0" />}
                            {button.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FloatingMenu;
