import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import useHttp from "../../../shared/hooks/http-hook";

import { StudentAttendanceContext } from "../context/StudentAttendanceContext";

import SelectAllCheckbox from "../atoms/SelectAllCheckbox";
import AttendedStudentsList from "../molecules/AttendedStudentsList";
import ActionBar from "./ActionBar";
import { GeneralContext } from "../../../shared/Components/Context/general-context";

const AttendedStudents = () => {
    const { state, dispatch } = useContext(StudentAttendanceContext);
    const { isLoading, error, sendRequest } = useHttp();
    const [showViolationsMenu, setShowViolationsMenu] = useState({});
    const [showNotesField, setShowNotesField] = useState({});

    const general = useContext(GeneralContext);
    const navigate = useNavigate();

    // Memoize unsaved changes to prevent unnecessary recalculations
    const unsavedChanges = useMemo(() => state.dirtyIds.size, [state.dirtyIds]);

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
                studentId: student.studentId,
                status: student.status,
                attributes: student.attributes,
                violations: student.violations,
                teachersNotes: student.teachersNotes,
                timestamp: student.timestamp,
            }));

        // Validate that students with status "Izin" have teachersNotes
        const invalidStudents = changedStatuses.filter(
            (student) =>
                student.status === "Izin" &&
                (!student.teachersNotes || student.teachersNotes.trim() === "")
        );

        if (invalidStudents.length > 0) {
            alert(
                `Siswa yang izin wajib disertai catatan alasan izin:\n${invalidStudents
                    .map(
                        (student) =>
                            `${student.studentId.nis} - ${student.studentId.name}`
                    )
                    .join("\n")}`
            );
            return;
        }

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

    const handleStatusChange = useCallback(
        (id, newStatus, timestamp = Date.now()) => {
            dispatch({
                type: "SET_STATUS",
                payload: { id, newStatus, timestamp },
            });
        },
        [dispatch]
    );

    const handleAttributesChange = useCallback(
        (id, newAttributes) => {
            dispatch({ type: "SET_ATTRIBUTE", payload: { id, newAttributes } });
        },
        [dispatch]
    );

    const handleViolationsChange = useCallback(
        (id, violationType) => {
            dispatch({
                type: "SET_VIOLATIONS",
                payload: { id, violationType },
            });
        },
        [dispatch]
    );

    const handleNotesChange = useCallback(
        (id, notes) => {
            dispatch({ type: "SET_NOTES", payload: { id, notes } });
        },
        [dispatch]
    );

    const handleCheckboxChange = useCallback(
        (id) => {
            dispatch({ type: "TOGGLE_SELECTED", payload: { id } });
        },
        [dispatch]
    );

    const handleSelectAll = useCallback(() => {
        dispatch({ type: "TOGGLE_SELECT_ALL" });
    }, [dispatch]);

    const applyBulkStatus = useCallback(
        (newStatus, timestamp = Date.now()) => {
            dispatch({
                type: "APPLY_BULK_STATUS",
                payload: { newStatus, timestamp },
            });
        },
        [dispatch]
    );

    const getBorderColor = useCallback((status) => {
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
    }, []);

    const toggleViolationsMenu = useCallback((nis) => {
        setShowViolationsMenu((prev) => ({ ...prev, [nis]: !prev[nis] }));
    }, []);

    const toggleNotesField = useCallback((nis) => {
        setShowNotesField((prev) => ({ ...prev, [nis]: !prev[nis] }));
    }, []);

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
