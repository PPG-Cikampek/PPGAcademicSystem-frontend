import { motion, AnimatePresence } from "framer-motion";
import AttendanceRow from "./AttendanceRow";

const AttendanceTable = ({ attendances, classId, onEditAttendance, isExpanded }) => {
    if (!isExpanded) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                }}
                className="overflow-hidden bg-white"
            >
                <table className="w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-white">
                            <th className="border-t border-gray-300 p-2 text-left text-xs text-gray-500">
                                Nama
                            </th>
                            <th className="border-t border-gray-300 p-2 text-left text-xs text-gray-500">
                                Status
                            </th>
                            <th className="border-t border-gray-300 p-2 text-left text-xs text-gray-500">
                                Waktu
                            </th>
                            <th className="border-t border-gray-300 p-2 text-left text-xs text-gray-500">
                                Temuan
                            </th>
                            <th className="border-t border-gray-300 text-left text-xs text-gray-500"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendances.map((attendance) => (
                            <AttendanceRow
                                key={attendance._id}
                                attendance={attendance}
                                classId={classId}
                                onEdit={onEditAttendance}
                            />
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </AnimatePresence>
    );
};

export default AttendanceTable;
