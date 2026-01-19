// ScannerView.jsx
// Refactored to use explicit view state machine to prevent DOM reconciliation issues
// with AnimatePresence during async state transitions
import { useContext, useEffect, useReducer, useRef, useCallback, startTransition } from "react";

import { useCreateAttendanceMutation } from "../../../shared/queries";

import { StudentAttendanceContext } from "../context/StudentAttendanceContext";
import { AuthContext } from "../../../shared/Components/Context/auth-context";

import QRCodeScanner from "../organisms/QRCodeScanner";
import StatusBar from "../molecules/StatusBar";
import AttendedStudents from "../organisms/AttendedStudents";

import { useParams } from "react-router-dom";

import ErrorDisplay from "../molecules/ErrorDisplay";
import CreateAttendanceCard from "../molecules/CreateAttendanceCard";
import InactiveYearInfo from "../molecules/InactiveYearInfo";
import SkeletonLoader from "../../../shared/Components/UIElements/SkeletonLoader";
import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";

// View state machine to manage transitions atomically
// This prevents multiple derived boolean states from causing race conditions
const VIEW_STATES = {
    INITIALIZING: 'initializing',
    LOADING: 'loading',
    CREATE_ATTENDANCE: 'create_attendance',
    CREATING: 'creating',
    SCANNING: 'scanning',
    ERROR: 'error',
};

const viewStateReducer = (state, action) => {
    switch (action.type) {
        case 'INITIALIZE':
            return { ...state, viewState: VIEW_STATES.INITIALIZING };
        case 'SET_LOADING':
            return { ...state, viewState: VIEW_STATES.LOADING };
        case 'SHOW_CREATE_CARD':
            return { ...state, viewState: VIEW_STATES.CREATE_ATTENDANCE, error: null };
        case 'START_CREATING':
            return { ...state, viewState: VIEW_STATES.CREATING, error: null };
        case 'SHOW_SCANNER':
            return { ...state, viewState: VIEW_STATES.SCANNING, error: null };
        case 'SET_ERROR':
            return { ...state, viewState: VIEW_STATES.ERROR, error: action.payload };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        default:
            return state;
    }
};

const initialViewState = {
    viewState: VIEW_STATES.INITIALIZING,
    error: null,
};

const ScannerView = () => {
    const createAttendanceMutation = useCreateAttendanceMutation();

    const { state: attendanceState, dispatch: attendanceDispatch, refetchAttendance } = useContext(
        StudentAttendanceContext
    );

    const [localState, localDispatch] = useReducer(viewStateReducer, initialViewState);
    
    // Track mounted state to prevent state updates after unmount
    const isMountedRef = useRef(true);

    const auth = useContext(AuthContext);
    const { classId } = useParams();

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Initialize class context when classId is available
    useEffect(() => {
        if (classId) {
            const attendanceDate = new Date().toLocaleDateString("en-CA");
            attendanceDispatch({ type: "SET_CLASSID", payload: classId });
            attendanceDispatch({ type: "SET_ATTENDANCE_DATE", payload: attendanceDate });
        }
    }, [classId, attendanceDispatch]);

    // Sync view state with attendance context state
    // This effect determines the correct view state based on context
    useEffect(() => {
        if (!isMountedRef.current) return;

        // Handle error state from context
        if (attendanceState.error) {
            localDispatch({ type: 'SET_ERROR', payload: attendanceState.error });
            return;
        }

        // Handle loading state
        if (attendanceState.isLoading) {
            localDispatch({ type: 'SET_LOADING' });
            return;
        }

        // Determine view based on student list
        if (attendanceState.studentList.length === 0) {
            // Only show create card if not currently creating
            if (localState.viewState !== VIEW_STATES.CREATING) {
                localDispatch({ type: 'SHOW_CREATE_CARD' });
            }
        } else {
            localDispatch({ type: 'SHOW_SCANNER' });
        }
    }, [
        attendanceState.error,
        attendanceState.isLoading,
        attendanceState.studentList.length,
        localState.viewState,
    ]);

    const createAttendanceHandler = useCallback(async () => {
        // Prevent double execution
        if (createAttendanceMutation.isPending || attendanceState.studentList.length > 0) {
            return;
        }

        // Transition to creating state atomically
        localDispatch({ type: 'START_CREATING' });

        try {
            await createAttendanceMutation.mutateAsync({
                classId,
                subBranchId: auth.userSubBranchId,
                branchId: auth.userBranchId,
                branchYearId: auth.currentBranchYearId,
            });
            
            // Check if still mounted before continuing
            if (!isMountedRef.current) return;

            // Refetch will trigger the useEffect above to update view state
            await refetchAttendance();

        } catch (err) {
            console.error(err);
            if (!isMountedRef.current) return;
            
            // Use startTransition to batch these updates
            startTransition(() => {
                localDispatch({
                    type: 'SET_ERROR',
                    payload: err?.message || "Failed to create attendance",
                });
                attendanceDispatch({
                    type: "SET_ERROR",
                    payload: err?.message || "Failed to create attendance",
                });
            });
        }
    }, [
        createAttendanceMutation,
        attendanceState.studentList.length,
        classId,
        auth.userSubBranchId,
        auth.userBranchId,
        auth.currentBranchYearId,
        refetchAttendance,
        attendanceDispatch,
    ]);

    const handleRetry = useCallback(async () => {
        if (!isMountedRef.current) return;
        
        // Clear error and set loading atomically
        localDispatch({ type: 'SET_LOADING' });
        attendanceDispatch({ type: "SET_ERROR", payload: null });

        try {
            await refetchAttendance();
        } catch (err) {
            if (isMountedRef.current) {
                localDispatch({ 
                    type: 'SET_ERROR', 
                    payload: err?.message || "Failed to retry" 
                });
            }
        }
    }, [attendanceDispatch, refetchAttendance]);

    // Determine what to render based on view state
    const { viewState, error } = localState;
    const isCreatingOrLoading = viewState === VIEW_STATES.CREATING || viewState === VIEW_STATES.LOADING;
    const showCreateCard = viewState === VIEW_STATES.CREATE_ATTENDANCE;
    const showScanner = viewState === VIEW_STATES.SCANNING;
    const showError = viewState === VIEW_STATES.ERROR && error;
    const showLoading = viewState === VIEW_STATES.LOADING || viewState === VIEW_STATES.INITIALIZING;

    return (
        <div className="flex flex-col pb-40">
            {/* StatusBar - always visible, no animation wrapper */}
            <div className="animate-fade-in">
                <StatusBar />
            </div>

            {/* Loading state */}
            {showLoading && (
                <div className="flex justify-center mt-8">
                    <LoadingCircle />
                </div>
            )}

            {/* Error state */}
            {showError && (
                <ErrorDisplay error={error} onRetry={handleRetry} />
            )}

            {/* Create Attendance Card - rendered when no attendance exists */}
            {showCreateCard && (
                <div className="animate-fade-in">
                    <CreateAttendanceCard
                        onCreate={createAttendanceHandler}
                        isLoading={createAttendanceMutation.isPending}
                        isBranchYearActivated={attendanceState.isBranchYearActivated}
                    />
                </div>
            )}

            {/* Creating state - show skeleton while creating */}
            {viewState === VIEW_STATES.CREATING && (
                <SkeletonLoader
                    count={2}
                    variant="rectangular"
                    height="150px"
                    className="mx-4 mb-6"
                />
            )}

            {/* Scanner view - shown when attendance exists */}
            {showScanner && (
                <div className="animate-fade-in">
                    {attendanceState.isBranchYearActivated === true && (
                        <div className="m-4 card-basic">
                            <QRCodeScanner />
                        </div>
                    )}
                    {attendanceState.isBranchYearActivated === false && (
                        <InactiveYearInfo />
                    )}
                </div>
            )}

            {/* AttendedStudents - always rendered but handles empty state internally */}
            {!showLoading && !showError && (
                <div className="animate-fade-in">
                    <AttendedStudents />
                </div>
            )}
        </div>
    );
};

export default ScannerView;
