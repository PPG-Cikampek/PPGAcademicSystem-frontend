import React, { useCallback, useMemo } from "react";
import StatusSelect from "../atoms/StatusSelect";
import NotesField from "./NotesField";
import ViolationsMenu from "./ViolationsMenu";

const StudentActions = ({
    student,
    onStatusChange,
    showNotesField,
    onToggleNotes,
    onNotesChange,
    showViolationsMenu,
    onToggleViolations,
    onViolationChange,
}) => {
    const disabled = useMemo(
        () =>
            student.status === "Sakit" ||
            student.status === "Izin" ||
            student.status === "Tanpa Keterangan",
        [student.status]
    );

    const handleStatusChange = useCallback(
        (e) => {
            onStatusChange(student.studentId.nis, e.target.value);
        },
        [onStatusChange, student.studentId.nis]
    );

    const handleNotesToggle = useCallback(() => {
        onToggleNotes(student.studentId.nis);
    }, [onToggleNotes, student.studentId.nis]);

    const handleNotesChange = useCallback(
        (e) => {
            onNotesChange(student.studentId.nis, e.target.value);
        },
        [onNotesChange, student.studentId.nis]
    );

    const handleViolationsToggle = useCallback(() => {
        onToggleViolations(student.studentId.nis);
    }, [onToggleViolations, student.studentId.nis]);

    return (
        <div className="flex flex-wrap gap-2">
            <StatusSelect
                value={student.status}
                onChange={handleStatusChange}
            />
            <NotesField
                student={student}
                isOpen={showNotesField}
                onToggle={handleNotesToggle}
                onChange={handleNotesChange}
                value={student.teachersNotes}
            />
            <ViolationsMenu
                student={student}
                isOpen={showViolationsMenu}
                onToggle={handleViolationsToggle}
                onViolationChange={onViolationChange}
                disabled={disabled}
            />
        </div>
    );
};

export default StudentActions;
