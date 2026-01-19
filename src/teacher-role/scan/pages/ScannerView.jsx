// ScannerView.jsx
import { useContext, useEffect, useState, useRef, useCallback } from "react";

import { useCreateAttendanceMutation } from "../../../shared/queries";

import { StudentAttendanceContext } from "../context/StudentAttendanceContext";
import { AuthContext } from "../../../shared/Components/Context/auth-context";

import QRCodeScanner from "../organisms/QRCodeScanner";
import StatusBar from "../molecules/StatusBar";
import AttendedStudents from "../organisms/AttendedStudents";
import SequentialAnimation from "../../shared/Components/Animation/SequentialAnimation";

import { useNavigate, useParams } from "react-router-dom";

import ErrorDisplay from "../molecules/ErrorDisplay";
import CreateAttendanceCard from "../molecules/CreateAttendanceCard";
import InactiveYearInfo from "../molecules/InactiveYearInfo";
import SkeletonLoader from "../../../shared/Components/UIElements/SkeletonLoader";
import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";

const ScannerView = () => {
    const createAttendanceMutation = useCreateAttendanceMutation();

    const { state, dispatch, refetchAttendance } = useContext(
        StudentAttendanceContext
    );

    const [isRefetching, setIsRefetching] = useState(false);
    
    // Track mounted state to prevent state updates after unmount
    const isMountedRef = useRef(true);

    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const classId = useParams().classId;

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (classId) {
            const attendanceDate = new Date().toLocaleDateString("en-CA");
            dispatch({ type: "SET_CLASSID", payload: classId });
            dispatch({ type: "SET_ATTENDANCE_DATE", payload: attendanceDate });
        }
    }, [classId, dispatch]);

    const createAttendanceHandler = useCallback(async () => {
        if (createAttendanceMutation.isPending || state.studentList.length > 0)
            return; // Prevent double execution

        try {
            await createAttendanceMutation.mutateAsync({
                classId,
                subBranchId: auth.userSubBranchId,
                branchId: auth.userBranchId,
                branchYearId: auth.currentBranchYearId,
            });
            
            // Check if still mounted before updating state
            if (!isMountedRef.current) return;
            setIsRefetching(true);

            await refetchAttendance();

            // Check again before final state update
            if (!isMountedRef.current) return;
            setIsRefetching(false);
        } catch (err) {
            console.error(err);
            if (!isMountedRef.current) return;
            dispatch({
                type: "SET_ERROR",
                payload: err?.message || "Failed to create attendance",
            });
            setIsRefetching(false);
        }
    }, [createAttendanceMutation, state.studentList.length, classId, auth.userSubBranchId, auth.userBranchId, auth.currentBranchYearId, refetchAttendance, dispatch]);

    const handleRetry = useCallback(async () => {
        dispatch({ type: "SET_ERROR", payload: null });
        if (!isMountedRef.current) return;
        setIsRefetching(true);

        try {
            await refetchAttendance();
        } catch (err) {
            // Handle error if needed
        } finally {
            if (isMountedRef.current) {
                setIsRefetching(false);
            }
        }
    }, [dispatch, refetchAttendance]);

    // Derive visibility states to prevent flicker during transitions
    const showCreateCard = state.studentList.length === 0 && !state.isLoading && !isRefetching;
    const showScanner = state.studentList.length !== 0 && !state.isLoading;

    return (
        <div className="flex flex-col pb-40">
            <SequentialAnimation variant={2}>
                <StatusBar />
            </SequentialAnimation>

            {state.isLoading && <LoadingCircle />}

            {state.error && (
                <ErrorDisplay error={state.error} onRetry={handleRetry} />
            )}

            {!state.isLoading && !state.error && (
                <SequentialAnimation variant={2} mode="wait">
                    {showCreateCard && (
                        <CreateAttendanceCard
                            onCreate={createAttendanceHandler}
                            isLoading={
                                createAttendanceMutation.isPending ||
                                isRefetching
                            }
                            isBranchYearActivated={state.isBranchYearActivated}
                        />
                    )}
                    {showScanner && (
                        <>
                            {state.isBranchYearActivated === true && (
                                <div className="m-4 card-basic">
                                    <QRCodeScanner />
                                </div>
                            )}
                            {state.isBranchYearActivated === false && (
                                <InactiveYearInfo />
                            )}
                        </>
                    )}
                    <AttendedStudents />
                </SequentialAnimation>
            )}
            {isRefetching && (
                <SkeletonLoader
                    count={2}
                    variant="rectangular"
                    height="150px"
                    className="mx-4 mb-6"
                />
            )}
        </div>
    );
};

export default ScannerView;
