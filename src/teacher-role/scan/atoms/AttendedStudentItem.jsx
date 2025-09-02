import React from "react";
import StudentCheckbox from "./StudentCheckbox";
import StudentHeader from "../molecules/StudentHeader";
import StudentActions from "../molecules/StudentActions";

const AttendedStudentItem = ({
    student,
    onCheckboxChange,
    onStatusChange,
    showNotesField,
    onToggleNotes,
    onNotesChange,
    showViolationsMenu,
    onToggleViolations,
    onViolationChange,
    getBorderColor,
}) => {
    return (
        <div
            className={`p-4 pr-0 -mx-4 min-h-20 flex items-center gap-4 border-b ${getBorderColor(
                student.status
            )} transition-all duration-500`}
        >
            <StudentCheckbox
                id={student.studentId.nis}
                checked={!!student.isSelected}
                onChange={() => onCheckboxChange(student.studentId.nis)}
                disabled={
                    student.status === "Hadir" || student.status === "Terlambat"
                }
            />
            <div className="flex-1 h-fit">
                <StudentHeader student={student} />
                <StudentActions
                    student={student}
                    onStatusChange={onStatusChange}
                    showNotesField={showNotesField}
                    onToggleNotes={onToggleNotes}
                    onNotesChange={onNotesChange}
                    showViolationsMenu={showViolationsMenu}
                    onToggleViolations={onToggleViolations}
                    onViolationChange={onViolationChange}
                />
            </div>
        </div>
    );
};

export default AttendedStudentItem;
