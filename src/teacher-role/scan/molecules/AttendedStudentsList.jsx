import React from "react";
import AttendedStudentItem from "./AttendedStudentItem";

const AttendedStudentsList = ({
    students,
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
        <div className="flex flex-col">
            {students.map((student) => (
                <AttendedStudentItem
                    key={student.studentId.nis}
                    student={student}
                    onCheckboxChange={onCheckboxChange}
                    onStatusChange={onStatusChange}
                    showNotesField={showNotesField[student.studentId.nis]}
                    onToggleNotes={onToggleNotes}
                    onNotesChange={onNotesChange}
                    showViolationsMenu={
                        showViolationsMenu[student.studentId.nis]
                    }
                    onToggleViolations={onToggleViolations}
                    onViolationChange={onViolationChange}
                    getBorderColor={getBorderColor}
                />
            ))}
        </div>
    );
};

export default AttendedStudentsList;
