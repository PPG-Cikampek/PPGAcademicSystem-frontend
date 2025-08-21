import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StudentReportView from "../../../students/pages/StudentReportView";
import { AuthContext } from "../../../shared/Components/Context/auth-context";
import StudentInitial from "../../../shared/Components/UIElements/StudentInitial";

const StudentPerformanceCard = ({ data }) => {
    const auth = useContext(AuthContext);
    console.log(data);

    const getStatusColor = (status) => {
        const colors = {
            Hadir: "bg-emerald-100 text-emerald-800",
            Terlambat: "bg-amber-100 text-amber-800",
            Izin: "bg-blue-100 text-blue-800",
            Sakit: "bg-purple-100 text-purple-800",
            "Tanpa Keterangan": "bg-red-100 text-red-800",
            "Tidak Hadir": "bg-orange-100 text-orange-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const StatBadge = ({ status, percentage }) => (
        <span
            className={`px-2 py-1 rounded-full text-center ${getStatusColor(
                status
            )}`}
        >
            {status} {percentage}%
        </span>
    );
    return (
        <motion.div key={data.attendances.id}>
            <div className="card-basic rounded-md hover:cursor-pointer hover:bg-gray-50 hover:ring-1 hover:ring-primary flex-col transition-all duration-200">
                <div className="flex md:justify-between md:flex-row flex-col justify-start items-start gap-4 ">
                    <div className="flex gap-3 items-center">
                        {data.image ? (
                            <img
                                src={
                                    data.thumbnail
                                        ? data.thumbnail
                                        : `${
                                              import.meta.env.VITE_BACKEND_URL
                                          }/${data.image}`
                                }
                                alt={data.name}
                                className="size-14 rounded-full m-auto shrink-0 border border-gray-200 bg-white"
                            />
                        ) : (
                            <StudentInitial
                                studentName={data.name}
                                clsName={`size-14 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium m-auto shrink-0 grow-0`}
                            />
                        )}
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-medium">{data.name}</h3>
                            <h4 className="">{data.nis}</h4>
                        </div>
                    </div>
                    <div className="md:hidden flex flex-col md:flex-row gap-2 items-end md:items-end self-end">
                        <StatBadge key={"123"} />
                    </div>
                    <div className="hidden md:flex flex-col md:flex-row items-end gap-2 md:items-center">
                        <StatBadge key={"123"} />
                    </div>
                </div>
                {/* {auth.userRole === 'teacher' && expandStudentDetail === data.attendances.id && (
                    <div
                        className='mt-4'
                        onClick={(e) => e.stopPropagation()} // Prevents triggering parent onClick
                    >
                        <motion.div>
                            <StudentReportView data.attendancesData={data.attendances} attendanceData={calculateStats(data.attendances.attendances)} noCard={true} />
                        </motion.div>
                    </div>
                )} */}
            </div>
        </motion.div>
    );
};

export default StudentPerformanceCard;
