import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useHttp from "../../../shared/hooks/http-hook";
import useListVirtualization from "../hooks/useListVirtualization";

import { StudentAttendanceContext } from "../context/StudentAttendanceContext";

import SelectAllCheckbox from "../atoms/SelectAllCheckbox";
import AttendedStudentsList from "../molecules/AttendedStudentsList";
import VirtualizedAttendedStudentsList from "../molecules/VirtualizedAttendedStudentsList";
import AdvancedVirtualizedAttendedStudentsList from "../molecules/AdvancedVirtualizedAttendedStudentsList";
import ActionBar from "./ActionBar";
import { GeneralContext } from "../../../shared/Components/Context/general-context";

const AttendedStudents = () => {
    const { state, dispatch } = useContext(StudentAttendanceContext);
    const { isLoading, error, sendRequest } = useHttp();
    const [showViolationsMenu, setShowViolationsMenu] = useState({});
    const [showNotesField, setShowNotesField] = useState({});

    const general = useContext(GeneralContext);
    const navigate = useNavigate();

    // Use the custom virtualization hook
    const { strategy, config } = useListVirtualization(
        state.studentList.length,
        { showNotesField, showViolationsMenu },
        4 // threshold - virtualization kicks in at 5+ items
    );

    // Track unsaved changes using dirtyIds from context
    const unsavedChanges = state.dirtyIds.size;

    // Update general message based on unsaved changes
    useEffect(() => {
        if (unsavedChanges > 0) {
            general.setMessage(
                `Perubahan untuk ${unsavedChanges} siswa belum disimpan!`
            );
        } else {
            general.setMessage(false);
        }
    }, [unsavedChanges, general]);

    // Add event listener for page reload/close
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (unsavedChanges > 0) {
                e.preventDefault();
                e.returnValue =
                    "You have unsaved changes. Are you sure you want to leave?";
                return e.returnValue;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [unsavedChanges]);

    function BlockNavigation() {
        useEffect(() => {
            window.history.pushState(
                null,
                document.title,
                window.location.href
            );

            const handlePopState = () => {
                window.history.pushState(
                    null,
                    document.title,
                    window.location.href
                );
                alert(
                    `Perubahan untuk ${unsavedChanges} siswa belum disimpan!`
                );
            };

            window.addEventListener("popstate", handlePopState);
            return () => window.removeEventListener("popstate", handlePopState);
        }, []);

        return null;
    }

    const handleSave = async () => {
        // Get changed students based on dirtyIds
        const changedStatuses = state.studentList
            .filter((student) => state.dirtyIds.has(student.studentId.nis))
            .map((student) => ({
                attendanceId: student._id,
                status: student.status,
                attributes: student.attributes,
                violations: student.violations,
                teachersNotes: student.teachersNotes,
                timestamp: student.timestamp,
            }));

        if (changedStatuses.length > 0) {
            try {
                const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/`;
                const body = JSON.stringify({ updates: changedStatuses });

                const response = await sendRequest(url, "PATCH", body, {
                    "Content-Type": "application/json",
                });

                // Clear dirty tracking after successful save
                dispatch({ type: "CLEAR_DIRTY_IDS" });
                general.setMessage(false);
            } catch (error) {
                console.error("Error updating statuses:", error);
            }
        }
    };

    const handleStatusChange = (id, newStatus, timestamp = Date.now()) => {
        dispatch({ type: "SET_STATUS", payload: { id, newStatus, timestamp } });
    };

    const handleAttributesChange = (id, newAttributes) => {
        dispatch({ type: "SET_ATTRIBUTE", payload: { id, newAttributes } });
    };

    const handleViolationsChange = (id, violationType) => {
        dispatch({ type: "SET_VIOLATIONS", payload: { id, violationType } });
    };

    const handleNotesChange = (id, notes) => {
        dispatch({ type: "SET_NOTES", payload: { id, notes } });
    };

    const handleCheckboxChange = (id) => {
        dispatch({ type: "TOGGLE_SELECTED", payload: { id } });
    };

    const handleSelectAll = () => {
        dispatch({ type: "TOGGLE_SELECT_ALL" });
    };

    const applyBulkStatus = (newStatus, timestamp = Date.now()) => {
        dispatch({
            type: "APPLY_BULK_STATUS",
            payload: { newStatus, timestamp },
        });
    };

    const getBorderColor = (status) => {
        switch (status) {
            case "Hadir":
                return "bg-blue-500/50";
            case "Terlambat":
                return "bg-yellow-500/50";
            case "Sakit":
                return "bg-violet-500/50";
            case "Izin":
                return "bg-orange-500/50";
            default:
                return "bg-red-500/50";
        }
    };

    const toggleViolationsMenu = (nis) => {
        setShowViolationsMenu((prev) => ({ ...prev, [nis]: !prev[nis] }));
    };

    const toggleNotesField = (nis) => {
        setShowNotesField((prev) => ({ ...prev, [nis]: !prev[nis] }));
    };

    return (
        <div className="card-basic mx-4 mb-8 flex-col box-border">
            {unsavedChanges > 0 && <BlockNavigation />}
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-medium">Daftar Hadir</h1>
            </div>
            {state.studentList.length !== 0 &&
            state.isBranchYearActivated === true ? (
                <SelectAllCheckbox
                    checked={state.selectAll}
                    onChange={handleSelectAll}
                    label="Pilih Semua"
                />
            ) : (
                <div className="italic text-gray-500 mt-2">
                    Daftar hadir kosong
                </div>
            )}
            <div
                className={`flex flex-col ${
                    state.studentList.length !== 0 &&
                    state.isBranchYearActivated === true
                        ? "mb-4"
                        : ""
                } `}
            >
                {state.isBranchYearActivated === true && (
                    <>
                        {strategy.shouldVirtualize ? (
                            strategy.useVariableHeight ? (
                                // Use variable height list when items have different heights
                                <AdvancedVirtualizedAttendedStudentsList
                                    students={state.studentList}
                                    onCheckboxChange={handleCheckboxChange}
                                    onStatusChange={handleStatusChange}
                                    showNotesField={showNotesField}
                                    onToggleNotes={toggleNotesField}
                                    onNotesChange={handleNotesChange}
                                    showViolationsMenu={showViolationsMenu}
                                    onToggleViolations={toggleViolationsMenu}
                                    onViolationChange={handleViolationsChange}
                                    getBorderColor={getBorderColor}
                                    height={config.defaultListHeight}
                                    baseItemHeight={config.baseItemHeight}
                                />
                            ) : (
                                // Use fixed height list for better performance when no items are expanded
                                <VirtualizedAttendedStudentsList
                                    students={state.studentList}
                                    onCheckboxChange={handleCheckboxChange}
                                    onStatusChange={handleStatusChange}
                                    showNotesField={showNotesField}
                                    onToggleNotes={toggleNotesField}
                                    onNotesChange={handleNotesChange}
                                    showViolationsMenu={showViolationsMenu}
                                    onToggleViolations={toggleViolationsMenu}
                                    onViolationChange={handleViolationsChange}
                                    getBorderColor={getBorderColor}
                                    height={config.defaultListHeight}
                                    itemHeight={config.baseItemHeight}
                                />
                            )
                        ) : (
                            // Use regular list for small lists (better UX, no virtualization overhead)
                            <AttendedStudentsList
                                students={state.studentList}
                                onCheckboxChange={handleCheckboxChange}
                                onStatusChange={handleStatusChange}
                                showNotesField={showNotesField}
                                onToggleNotes={toggleNotesField}
                                onNotesChange={handleNotesChange}
                                showViolationsMenu={showViolationsMenu}
                                onToggleViolations={toggleViolationsMenu}
                                onViolationChange={handleViolationsChange}
                                getBorderColor={getBorderColor}
                            />
                        )}
                    </>
                )}
            </div>
            {/* Fixed action buttons at bottom */}
            {state.isBranchYearActivated === true &&
                state.studentList.length !== 0 && (
                    <ActionBar
                        students={state.studentList}
                        isLoading={isLoading}
                        error={error}
                        unsavedChanges={unsavedChanges}
                        onBulkSakit={() => applyBulkStatus("Sakit")}
                        onBulkIzin={() => applyBulkStatus("Izin")}
                        onSave={handleSave}
                    />
                )}
        </div>
    );
};

export default AttendedStudents;
