// StudentAttendanceContext.jsx
import { createContext, useReducer, useEffect } from "react";

const StudentAttendanceContext = createContext();

const initialState = {
    studentList: [],
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
                studentList: action.payload,
                dirtyIds: new Set(), // Clear dirty tracking when new data loads
            };
        case "SET_CLASS_START_TIME":
            return { ...state, classStartTime: action.payload };
        case "SET_IS_ACTIVE_YEAR_ACTIVATED":
            return { ...state, isBranchYearActivated: action.payload };
        case "SET_STATUS":
            const newDirtyIds = new Set(state.dirtyIds);
            newDirtyIds.add(action.payload.id);
            return {
                ...state,
                dirtyIds: newDirtyIds,
                studentList: state.studentList.map((student) => {
                    if (student.studentId.nis === action.payload.id) {
                        return {
                            ...student,
                            status: action.payload.newStatus,
                            timestamp: action.payload.timestamp,
                            isSelected:
                                action.payload.newStatus === "Hadir" ||
                                action.payload.newStatus === "Terlambat"
                                    ? false
                                    : student.isSelected,
                        };
                    }
                    return student;
                }),
            };
        case "SET_ATTRIBUTE":
            const attributeDirtyIds = new Set(state.dirtyIds);
            attributeDirtyIds.add(action.payload.id);
            return {
                ...state,
                dirtyIds: attributeDirtyIds,
                studentList: state.studentList.map((student) =>
                    student.studentId.nis === action.payload.id
                        ? {
                              ...student,
                              attributes: action.payload.newAttributes,
                          }
                        : student
                ),
            };
        case "SET_NOTES":
            const notesDirtyIds = new Set(state.dirtyIds);
            notesDirtyIds.add(action.payload.id);
            return {
                ...state,
                dirtyIds: notesDirtyIds,
                studentList: state.studentList.map((student) =>
                    student.studentId.nis === action.payload.id
                        ? { ...student, teachersNotes: action.payload.notes }
                        : student
                ),
            };
        case "SET_VIOLATIONS":
            const violationsDirtyIds = new Set(state.dirtyIds);
            violationsDirtyIds.add(action.payload.id);
            return {
                ...state,
                dirtyIds: violationsDirtyIds,
                studentList: state.studentList.map((student) =>
                    student.studentId.nis === action.payload.id
                        ? action.payload.violationType === "Attribute"
                            ? {
                                  ...student,
                                  violations: {
                                      ...student.violations,
                                      attribute: !student.violations.attribute,
                                  },
                              }
                            : action.payload.violationType === "Attitude"
                            ? {
                                  ...student,
                                  violations: {
                                      ...student.violations,
                                      attitude: !student.violations.attitude,
                                  },
                              }
                            : {
                                  ...student,
                                  violations: {
                                      ...student.violations,
                                      tidiness: !student.violations.tidiness,
                                  },
                              }
                        : student
                ),
            };
        case "TOGGLE_SELECTED":
            return {
                ...state,
                studentList: state.studentList.map((student) =>
                    student.studentId.nis === action.payload.id
                        ? { ...student, isSelected: !student.isSelected }
                        : student
                ),
            };
        case "TOGGLE_SELECT_ALL":
            return {
                ...state,
                selectAll: !state.selectAll,
                studentList: state.studentList.map((student) => {
                    const isPresent =
                        student.status === "Hadir" ||
                        student.status === "Terlambat";
                    return isPresent
                        ? { ...student, isSelected: false } // Present students cannot be selected
                        : { ...student, isSelected: !state.selectAll }; // Toggle others
                }),
            };
        case "APPLY_BULK_STATUS":
            return {
                ...state,
                studentList: state.studentList.map((student) =>
                    student.isSelected && student.status !== "Hadir"
                        ? {
                              ...student,
                              status: action.payload.newStatus,
                              timestamp: action.payload.timestamp,
                          }
                        : student
                ),
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

    return (
        <StudentAttendanceContext.Provider
            value={{ state, dispatch, fetchAttendanceData }}
        >
            {children}
        </StudentAttendanceContext.Provider>
    );
};

export { StudentAttendanceContext, StudentAttendanceProvider };
