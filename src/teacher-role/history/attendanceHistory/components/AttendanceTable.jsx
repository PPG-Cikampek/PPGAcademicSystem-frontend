import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Edit2 } from "lucide-react";
import DataTable from "../../../../shared/Components/UIElements/DataTable";

const AttendanceTable = ({ attendances, classId, onEditAttendance, isExpanded }) => {
    const navigate = useNavigate();

    if (!isExpanded) return null;

    const columns = [
        {
            key: 'studentName',
            label: 'Nama',
            render: (item) => item.studentId.name,
            sortable: true
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true
        },
        {
            key: 'timestamp',
            label: 'Waktu',
            cellAlign: 'center',
            headerAlign: 'center',
            render: (item) => new Date(item.timestamp).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            sortable: true
        },
        {
            key: 'violations',
            label: 'Temuan',
            cellAlign: 'center',
            headerAlign: 'center',
            render: (item) => Object.values(item?.violations || {}).filter(value => value === true).length || "0",
            sortable: true
        },
        {
            key: 'actions',
            label: 'Aksi',
            cellAlign: 'center',
            headerAlign: 'center',
            render: (item) => {
                const isToday = new Date().toLocaleDateString("en-CA") ===
                    new Date(item.forDate).toLocaleDateString("en-CA");
                if (isToday) return null;
                return (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditAttendance(item._id);
                        }}
                        className="p-1 rounded-full active:bg-gray-200 text-blue-500 active:text-blue-700 transition duration-300"
                    >
                        <Edit2 size={16} />
                    </button>
                );
            }
        }
    ];

    const handleRowClick = (item) => {
        navigate(`/attendance/history/class/${classId}/${item._id}`);
    };

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
                <DataTable
                    data={attendances}
                    columns={columns}
                    onRowClick={handleRowClick}
                    searchableColumns={['studentName', 'status']}
                    tableId="attendance-table"
                    config={{
                        showFilter: false,
                        showSearch: false,
                        showTopEntries: false,
                        showBottomEntries: false,
                        showPagination: false,
                        clickableRows: false,
                        entriesOptions: [5, 10, 25, 50, 100],
                    }}
                />
            </motion.div>
        </AnimatePresence>
    );
};

export default AttendanceTable;
