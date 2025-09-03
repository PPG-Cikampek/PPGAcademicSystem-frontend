// StudentAttendanceContext.jsx
// Performance Optimization: Uses Map for O(1) student lookups instead of O(n) array operations
// This significantly improves performance for QR code scanning and student state updates
import { createContext, useReducer, useEffect, useMemo } from "react";
import { useAttendanceData, useClassData } from "../../../shared/queries";

const StudentAttendanceContext = createContext();

// Helper function to convert array to Map
const arrayToMap = (studentArray) => {
    const map = new Map();
    studentArray.forEach((student) => {
        map.set(student.studentId.nis, student);
    });
    return map;
};

// Helper function to convert Map to array
const mapToArray = (studentMap) => {
    return Array.from(studentMap.values());
};

const initialState = {
    studentMap: new Map(), // Changed from studentList to studentMap for O(1) lookups
    selectAll: false,
    classId: null,
    attendanceDate: null, // Add attendanceDate to state
    classStartTime: null,
    isBranchYearActivated: null,
    dirtyIds: new Set(), // Track which students have unsaved changes
    isLoading: false,
    error: null,
    selectedCount: 0, // Track number of selected students
};

const reducer = (state, action) => {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "CLEAR_DIRTY_IDS":
            return { ...state, dirtyIds: new Set() };
        case "SET_CLASSID":
            return { ...state, classId: action.payload };
        case "SET_ATTENDANCE_DATE":
            return { ...state, attendanceDate: action.payload };
        case "SET_STUDENT_LIST":
            return {
                ...state,
                studentMap: arrayToMap(action.payload),
                dirtyIds: new Set(), // Clear dirty tracking when new data loads
                selectedCount: 0, // Reset selected count
            };
        case "SET_CLASS_START_TIME":
            return { ...state, classStartTime: action.payload };
        case "SET_IS_ACTIVE_YEAR_ACTIVATED":
            return { ...state, isBranchYearActivated: action.payload };
        case "SET_STATUS":
            const newDirtyIds = new Set(state.dirtyIds);
            newDirtyIds.add(action.payload.id);

            const newStudentMap = new Map(state.studentMap);
            const student = newStudentMap.get(action.payload.id);

            if (student) {
                const wasSelected = student.isSelected;
                const newIsSelected =
                    action.payload.newStatus === "Hadir" ||
                    action.payload.newStatus === "Terlambat"
                        ? false
                        : student.isSelected;
                const selectedCountDelta = newIsSelected
                    ? wasSelected
                        ? 0
                        : 1
                    : wasSelected
                    ? -1
                    : 0;

                newStudentMap.set(action.payload.id, {
                    ...student,
                    status: action.payload.newStatus,
                    timestamp: action.payload.timestamp,
                    isSelected: newIsSelected,
                });

                return {
                    ...state,
                    dirtyIds: newDirtyIds,
                    studentMap: newStudentMap,
                    selectedCount: state.selectedCount + selectedCountDelta,
                };
            }
            return state;
        case "SET_ATTRIBUTE":
            const attributeDirtyIds = new Set(state.dirtyIds);
            attributeDirtyIds.add(action.payload.id);

            const attributeStudentMap = new Map(state.studentMap);
            const attributeStudent = attributeStudentMap.get(action.payload.id);

            if (attributeStudent) {
                attributeStudentMap.set(action.payload.id, {
                    ...attributeStudent,
                    attributes: action.payload.newAttributes,
                });
            }

            return {
                ...state,
                dirtyIds: attributeDirtyIds,
                studentMap: attributeStudentMap,
            };
        case "SET_NOTES":
            const notesDirtyIds = new Set(state.dirtyIds);
            notesDirtyIds.add(action.payload.id);

            const notesStudentMap = new Map(state.studentMap);
            const notesStudent = notesStudentMap.get(action.payload.id);

            if (notesStudent) {
                notesStudentMap.set(action.payload.id, {
                    ...notesStudent,
                    teachersNotes: action.payload.notes,
                });
            }

            return {
                ...state,
                dirtyIds: notesDirtyIds,
                studentMap: notesStudentMap,
            };
        case "SET_VIOLATIONS":
            const violationsDirtyIds = new Set(state.dirtyIds);
            violationsDirtyIds.add(action.payload.id);

            const violationsStudentMap = new Map(state.studentMap);
            const violationsStudent = violationsStudentMap.get(
                action.payload.id
            );

            if (violationsStudent) {
                let updatedViolations;
                if (action.payload.violationType === "Attribute") {
                    updatedViolations = {
                        ...violationsStudent.violations,
                        attribute: !violationsStudent.violations.attribute,
                    };
                } else if (action.payload.violationType === "Attitude") {
                    updatedViolations = {
                        ...violationsStudent.violations,
                        attitude: !violationsStudent.violations.attitude,
                    };
                } else {
                    updatedViolations = {
                        ...violationsStudent.violations,
                        tidiness: !violationsStudent.violations.tidiness,
                    };
                }

                violationsStudentMap.set(action.payload.id, {
                    ...violationsStudent,
                    violations: updatedViolations,
                });
            }

            return {
                ...state,
                dirtyIds: violationsDirtyIds,
                studentMap: violationsStudentMap,
            };
        case "TOGGLE_SELECTED":
            const toggleStudentMap = new Map(state.studentMap);
            const toggleStudent = toggleStudentMap.get(action.payload.id);

            if (toggleStudent) {
                const wasSelected = toggleStudent.isSelected;
                toggleStudentMap.set(action.payload.id, {
                    ...toggleStudent,
                    isSelected: !wasSelected,
                });

                return {
                    ...state,
                    studentMap: toggleStudentMap,
                    selectedCount: state.selectedCount + (wasSelected ? -1 : 1),
                };
            }
            return state;
        case "TOGGLE_SELECT_ALL":
            const selectAllStudentMap = new Map();
            let newSelectedCount = 0;

            for (const [nis, student] of state.studentMap) {
                const isPresent =
                    student.status === "Hadir" ||
                    student.status === "Terlambat";

                const newIsSelected = isPresent
                    ? false // Present students cannot be selected
                    : !state.selectAll; // Toggle others

                selectAllStudentMap.set(nis, {
                    ...student,
                    isSelected: newIsSelected,
                });

                if (newIsSelected) newSelectedCount++;
            }

            return {
                ...state,
                selectAll: !state.selectAll,
                studentMap: selectAllStudentMap,
                selectedCount: newSelectedCount,
            };
        case "APPLY_BULK_STATUS":
            const bulkStatusStudentMap = new Map();

            for (const [nis, student] of state.studentMap) {
                if (student.isSelected && student.status !== "Hadir") {
                    bulkStatusStudentMap.set(nis, {
                        ...student,
                        status: action.payload.newStatus,
                        timestamp: action.payload.timestamp,
                    });
                } else {
                    bulkStatusStudentMap.set(nis, student);
                }
            }

            return {
                ...state,
                studentMap: bulkStatusStudentMap,
            };
        default:
            return state;
    }
};

const StudentAttendanceProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Use React Query hooks for data fetching
    const {
        data: attendanceData,
        isLoading: attendanceLoading,
        error: attendanceError,
        refetch: refetchAttendance,
    } = useAttendanceData(state.classId, state.attendanceDate);

    const {
        data: classData,
        isLoading: classLoading,
        error: classError,
    } = useClassData(state.classId);

    // Update state when attendance data is loaded
    useEffect(() => {
        if (attendanceData) {
            dispatch({ type: "SET_STUDENT_LIST", payload: attendanceData });
        }
    }, [attendanceData]);

    // Update state when class data is loaded
    useEffect(() => {
        if (classData) {
            dispatch({
                type: "SET_CLASS_START_TIME",
                payload: classData.class.startTime,
            });
            dispatch({
                type: "SET_IS_ACTIVE_YEAR_ACTIVATED",
                payload: classData.class.teachingGroupId.branchYearId.isActive,
            });
        }
    }, [classData]);

    // Update loading and error states
    useEffect(() => {
        dispatch({
            type: "SET_LOADING",
            payload: attendanceLoading || classLoading,
        });
    }, [attendanceLoading, classLoading]);

    useEffect(() => {
        const error = attendanceError || classError;
        dispatch({ type: "SET_ERROR", payload: error ? error.message : null });
    }, [attendanceError, classError]);

    // Helper function to get student list as array for components that need it
    const getStudentList = () => mapToArray(state.studentMap);

    // Memoized student list to avoid unnecessary conversions
    const studentList = useMemo(
        () => mapToArray(state.studentMap),
        [state.studentMap]
    );

    // Helper function to get a specific student by NIS
    const getStudent = (nis) => state.studentMap.get(nis);

    // Helper function to check if a student exists
    const hasStudent = (nis) => state.studentMap.has(nis);

    return (
        <StudentAttendanceContext.Provider
            value={{
                state: {
                    ...state,
                    studentList: studentList, // Use memoized array
                },
                dispatch,
                getStudentList,
                getStudent,
                hasStudent,
                refetchAttendance, // Expose refetch function for manual refetch if needed
            }}
        >
            {children}
        </StudentAttendanceContext.Provider>
    );
};

export { StudentAttendanceContext, StudentAttendanceProvider };
