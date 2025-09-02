import React, { useMemo, useCallback } from "react";
import { List } from "react-window";
import AttendedStudentItem from "./AttendedStudentItem";

const VirtualizedAttendedStudentsList = ({
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
    height = 400, // Default height, can be customized
    itemHeight = 80, // Estimated height per item (min-h-20 = 80px)
}) => {
    // Memoize the Row component to prevent unnecessary re-renders
    const Row = useCallback(
        ({ index, style }) => {
            const student = students[index];

            return (
                <div style={style}>
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
                </div>
            );
        },
        [
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
        ]
    );

    // Calculate the optimal height for the list
    const listHeight = useMemo(() => {
        const maxHeight = height;
        const calculatedHeight = Math.min(
            students.length * itemHeight,
            maxHeight
        );
        return calculatedHeight;
    }, [students.length, itemHeight, height]);

    if (students.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <List
                height={listHeight}
                itemCount={students.length}
                itemSize={itemHeight}
                width="100%"
                style={{
                    outline: "none", // Remove focus outline
                }}
                overscanCount={5} // Render 5 extra items outside visible area for smoother scrolling
            >
                {Row}
            </List>
        </div>
    );
};

export default React.memo(VirtualizedAttendedStudentsList);
