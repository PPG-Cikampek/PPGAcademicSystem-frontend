import React from "react";
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
    const disabled =
        student.status === "Sakit" ||
        student.status === "Izin" ||
        student.status === "Tanpa Keterangan";

    return (
        <div className="flex flex-wrap gap-2">
            <StatusSelect
                value={student.status}
                onChange={(e) =>
                    onStatusChange(student.studentId.nis, e.target.value)
                }
            />
            <NotesField
                student={student}
                isOpen={showNotesField}
                onToggle={() => onToggleNotes(student.studentId.nis)}
                onChange={(e) =>
                    onNotesChange(student.studentId.nis, e.target.value)
                }
                value={student.teachersNotes}
            />
            <ViolationsMenu
                student={student}
                isOpen={showViolationsMenu}
                onToggle={() => onToggleViolations(student.studentId.nis)}
                onViolationChange={onViolationChange}
                disabled={disabled}
            />
        </div>
    );
};

export default StudentActions;
