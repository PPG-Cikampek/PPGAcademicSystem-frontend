import React, { useMemo, useCallback } from "react";
import { List } from "react-window";
import AttendedStudentItem from "./AttendedStudentItem";

const AdvancedVirtualizedAttendedStudentsList = ({
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
    height = 400,
    baseItemHeight = 80,
}) => {
    // Calculate item height based on expanded states
    const getItemSize = useCallback(
        (index) => {
            const student = students[index];
            if (!student || !student.studentId) {
                return baseItemHeight;
            }

            const nis = student.studentId.nis;
            let itemHeight = baseItemHeight;

            // Add height for expanded notes field
            if (showNotesField?.[nis]) {
                itemHeight += 60; // Approximate height for notes textarea
            }

            // Add height for expanded violations menu
            if (showViolationsMenu?.[nis]) {
                itemHeight += 120; // Approximate height for violations menu
            }

            return itemHeight;
        },
        [students, showNotesField, showViolationsMenu, baseItemHeight]
    );

    // Memoize the Row component to prevent unnecessary re-renders
    const Row = useCallback(
        ({ index, style }) => {
            const student = students[index];

            // Safety check
            if (!student || !student.studentId) {
                return <div style={style}>Loading...</div>;
            }

            return (
                <div style={style}>
                    <AttendedStudentItem
                        key={student.studentId.nis}
                        student={student}
                        onCheckboxChange={onCheckboxChange}
                        onStatusChange={onStatusChange}
                        showNotesField={
                            showNotesField?.[student.studentId.nis] || false
                        }
                        onToggleNotes={onToggleNotes}
                        onNotesChange={onNotesChange}
                        showViolationsMenu={
                            showViolationsMenu?.[student.studentId.nis] || false
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
        const totalHeight = students.reduce(
            (acc, _, index) => acc + getItemSize(index),
            0
        );
        return Math.min(totalHeight, height);
    }, [students, getItemSize, height]);

    // Create a ref for the list to reset cache when item sizes change
    const listRef = React.useRef();

    // Reset cache when expanded states change
    React.useEffect(() => {
        if (listRef.current) {
            listRef.current.resetAfterIndex(0);
        }
    }, [showNotesField, showViolationsMenu]);

    if (students.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <List
                ref={listRef}
                height={listHeight}
                itemCount={students.length}
                itemSize={getItemSize}
                width="100%"
                style={{
                    outline: "none",
                }}
                overscanCount={5}
            >
                {Row}
            </List>
        </div>
    );
};

export default React.memo(AdvancedVirtualizedAttendedStudentsList);
