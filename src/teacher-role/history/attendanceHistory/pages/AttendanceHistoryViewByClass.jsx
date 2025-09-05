import { useParams, useNavigate } from "react-router-dom";
import { useAttendancesByClass, useDeleteAttendanceMutation } from "../../../../shared/queries";

import LoadingCircle from "../../../../shared/Components/UIElements/LoadingCircle";
import { motion, AnimatePresence } from "framer-motion";
import ErrorCard from "../../../../shared/Components/UIElements/ErrorCard";
import NewModal from "../../../../shared/Components/Modal/NewModal";
import useNewModal from "../../../../shared/hooks/useNewModal";

import { groupAttendancesByDate } from "../utilities/attendanceGrouping";
import { useExpandedDates } from "../hooks/useExpandedDates";
import CollapseAllButton from "../components/CollapseAllButton";
import DateGroup from "../components/DateGroup";

const AttendanceHistoryViewByClass = () => {
    const classId = useParams().classId;
    const { modalState, openModal, closeModal } = useNewModal();
    const navigate = useNavigate();
    const { expandedDates, toggleExpand, collapseAll } = useExpandedDates();

    const { data: loadedData, isLoading, error } = useAttendancesByClass(classId);
    const deleteAttendanceMutation = useDeleteAttendanceMutation();

    const editAttendanceHandler = (attendanceId) => {
        console.log("edit attendance", attendanceId);
        navigate(`/attendance/history/class/${classId}/${attendanceId}/edit`);
    };

    const deleteAttendanceHandler = (studentName, attendanceId) => {
        const confirmDelete = async () => {
            try {
                const response = await deleteAttendanceMutation.mutateAsync({
                    attendanceId,
                    studentName,
                    classId,
                });
                openModal(response.message, "success", null, "Berhasil!");
            } catch (err) {
                openModal(err.message, "error", null, "Gagal!");
            }
        };
        openModal(
            `Hapus absen siswa: ${studentName}?`,
            "confirmation",
            confirmDelete,
            "Konfirmasi Penghapusan",
            true
        );
    };

    const groupedData = groupAttendancesByDate(loadedData);

    console.log(loadedData);
    console.log(groupedData);

    const dateCount = groupedData ? Object.keys(groupedData).length : 0;

    return (
        <div className="p-4 space-y-4 mb-24">
            {isLoading && !loadedData && (
                <div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}

            <NewModal
                modalState={modalState}
                onClose={closeModal}
                isLoading={isLoading}
            />

            {error && <ErrorCard error={error} />}

            <CollapseAllButton
                onClick={collapseAll}
                isVisible={expandedDates.length > 1 && dateCount > 1}
            />

            <AnimatePresence>
                {groupedData &&
                    Object.entries(groupedData).map(([date, attendances]) => (
                        <DateGroup
                            key={date}
                            date={date}
                            attendances={attendances}
                            isExpanded={expandedDates.includes(date)}
                            onToggle={toggleExpand}
                            classId={classId}
                            onEditAttendance={editAttendanceHandler}
                        />
                    ))}
            </AnimatePresence>
        </div>
    );
};

export default AttendanceHistoryViewByClass;
