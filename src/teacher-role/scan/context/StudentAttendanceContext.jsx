// StudentAttendanceContext.jsx
// Performance Optimization: Uses Map for O(1) student lookups instead of O(n) array operations
// This significantly improves performance for QR code scanning and student state updates
import { createContext, useReducer, useEffect } from "react";

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
    classStartTime: null,
    isBranchYearActivated: null,
    dirtyIds: new Set(), // Track which students have unsaved changes
    isLoading: false,
    error: null,
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
        case "SET_STUDENT_LIST":
            return {
                ...state,
                studentMap: arrayToMap(action.payload),
                dirtyIds: new Set(), // Clear dirty tracking when new data loads
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
                newStudentMap.set(action.payload.id, {
                    ...student,
                    status: action.payload.newStatus,
                    timestamp: action.payload.timestamp,
                    isSelected:
                        action.payload.newStatus === "Hadir" ||
                        action.payload.newStatus === "Terlambat"
                            ? false
                            : student.isSelected,
                });
            }

            return {
                ...state,
                dirtyIds: newDirtyIds,
                studentMap: newStudentMap,
            };
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
                toggleStudentMap.set(action.payload.id, {
                    ...toggleStudent,
                    isSelected: !toggleStudent.isSelected,
                });
            }

            return {
                ...state,
                studentMap: toggleStudentMap,
            };
        case "TOGGLE_SELECT_ALL":
            const selectAllStudentMap = new Map();

            for (const [nis, student] of state.studentMap) {
                const isPresent =
                    student.status === "Hadir" ||
                    student.status === "Terlambat";

                selectAllStudentMap.set(nis, {
                    ...student,
                    isSelected: isPresent
                        ? false // Present students cannot be selected
                        : !state.selectAll, // Toggle others
                });
            }

            return {
                ...state,
                selectAll: !state.selectAll,
                studentMap: selectAllStudentMap,
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

// Function to fetch attendance data from the backend
const fetchAttendanceData = async (classId, attendanceDate, dispatch) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    const attendanceUrl = `${
        import.meta.env.VITE_BACKEND_URL
    }/attendances/${classId}`;

    const body = JSON.stringify({ date: attendanceDate });

    try {
        const response = await fetch(attendanceUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                    JSON.parse(localStorage.getItem("userData")).token
                }`,
            },
            body: body,
        });
        if (!response.ok) {
            throw new Error("Failed to fetch attendance data");
        }
        const data = await response.json();
        const formattedData = data.map((obj) => ({
            ...obj,
            isSelected: false, // Add isSelected property to each object
        }));
        dispatch({ type: "SET_STUDENT_LIST", payload: formattedData });
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        dispatch({ type: "SET_ERROR", payload: error.message });
    }

    const classUrl = `${
        import.meta.env.VITE_BACKEND_URL
    }/classes/${classId}?populate=branchYear`;

    try {
        const response = await fetch(classUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${
                    JSON.parse(localStorage.getItem("userData")).token
                }`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch class data");
        }
        const data = await response.json();

        console.log(data);

        dispatch({
            type: "SET_CLASS_START_TIME",
            payload: data.class.startTime,
        });
        dispatch({
            type: "SET_IS_ACTIVE_YEAR_ACTIVATED",
            payload: data.class.teachingGroupId.branchYearId.isActive,
        });
    } catch (error) {
        console.error("Error fetching class data:", error);
        dispatch({ type: "SET_ERROR", payload: error.message });
    } finally {
        dispatch({ type: "SET_LOADING", payload: false });
    }
};

const StudentAttendanceProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Helper function to get student list as array for components that need it
    const getStudentList = () => mapToArray(state.studentMap);

    // Helper function to get a specific student by NIS
    const getStudent = (nis) => state.studentMap.get(nis);

    // Helper function to check if a student exists
    const hasStudent = (nis) => state.studentMap.has(nis);

    return (
        <StudentAttendanceContext.Provider
            value={{
                state: {
                    ...state,
                    studentList: getStudentList(), // Maintain backward compatibility
                },
                dispatch,
                fetchAttendanceData,
                getStudentList,
                getStudent,
                hasStudent,
            }}
        >
            {children}
        </StudentAttendanceContext.Provider>
    );
};

export { StudentAttendanceContext, StudentAttendanceProvider };
