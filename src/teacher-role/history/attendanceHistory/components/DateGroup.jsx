import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import AttendanceTable from "./AttendanceTable";

const DateGroup = ({ date, attendances, isExpanded, onToggle, classId, onEditAttendance }) => {
    return (
        <AnimatePresence>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="shadow-xs border rounded-full"
        >
            <motion.button
                onClick={() => onToggle(date)}
                className={`w-full px-3 py-2 flex justify-between items-center bg-blue-100 hover:bg-blue-200 transition-colors ${
                    isExpanded ? "rounded-t-md" : "rounded-full"
                }`}
            >
                <span className="font-medium">{date}</span>
                <div className="flex items-center gap-2">
                    {isExpanded ? (
                        <ChevronUp size={16} />
                    ) : (
                        <ChevronDown size={16} />
                    )}
                </div>
            </motion.button>

            <AttendanceTable
                attendances={attendances}
                classId={classId}
                onEditAttendance={onEditAttendance}
                isExpanded={isExpanded}
            />
        </motion.div>
        </AnimatePresence>
    );
};

export default DateGroup;
