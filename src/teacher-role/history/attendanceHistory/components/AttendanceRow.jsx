import { useNavigate } from "react-router-dom";
import { Edit2 } from "lucide-react";

const AttendanceRow = ({ attendance, classId, onEdit }) => {
    const navigate = useNavigate();

    const handleRowClick = () => {
        navigate(`/attendance/history/class/${classId}/${attendance._id}`);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        onEdit(attendance._id);
    };

    const isToday = new Date().toLocaleDateString("en-CA") ===
        new Date(attendance.forDate).toLocaleDateString("en-CA");

    return (
        <tr
            onClick={handleRowClick}
            className="bg-white hover:bg-gray-100"
        >
            <td className="border-t border-gray-300 p-2 text-xs">
                {attendance.studentId.name}
            </td>
            <td className="border-t border-gray-300 p-2 text-xs">
                {attendance.status}
            </td>
            <td className="border-t border-gray-300 p-2 text-xs">
                {new Date(attendance.timestamp).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </td>
            <td className="border-t border-gray-300 p-2 text-xs">
                {Object.values(attendance?.violations || {}).filter(value => value === true).length || "0"}
            </td>
            {!isToday && (
                <td className="border-t border-gray-300 text-xs flex">
                    <button
                        onClick={handleEditClick}
                        className="p-1 rounded-full active:bg-gray-200 text-blue-500 active:text-blue-700 transition duration-300"
                    >
                        <Edit2 size={16} />
                    </button>
                </td>
            )}
        </tr>
    );
};

export default AttendanceRow;
