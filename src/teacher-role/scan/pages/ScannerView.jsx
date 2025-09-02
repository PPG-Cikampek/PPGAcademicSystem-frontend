// ScannerView.jsx
import { useContext, useEffect, useState } from "react";

import useHttp from "../../../shared/hooks/http-hook";

import { StudentAttendanceContext } from "../context/StudentAttendanceContext";
import { AuthContext } from "../../../shared/Components/Context/auth-context";

import QRCodeScanner from "../organisms/QRCodeScanner";
import StatusBar from "../molecules/StatusBar";
import AttendedStudents from "../organisms/AttendedStudents";
import SequentialAnimation from "../../shared/Components/Animation/SequentialAnimation";

import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";
import { useNavigate, useParams } from "react-router-dom";
import InfoCard from "../../shared/Components/UIElements/InfoCard";

import ErrorDisplay from "../molecules/ErrorDisplay";
import CreateAttendanceCard from "../molecules/CreateAttendanceCard";
import InactiveYearInfo from "../molecules/InactiveYearInfo";
import LoadingIndicator from "../molecules/LoadingIndicator";

const ScannerView = () => {
    const { error, sendRequest, setError } = useHttp();

    const { state, dispatch, fetchAttendanceData } = useContext(
        StudentAttendanceContext
    );

    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const classId = useParams().classId;

    useEffect(() => {
        const loadData = async () => {
            try {
                const attendanceDate = new Date().toLocaleDateString("en-CA");
                await fetchAttendanceData(classId, attendanceDate, dispatch);
            } catch (error) {
                console.error("Error loading attendance data:", error);
                setError(error?.message || "Failed to load attendance data");
            }
        };

        if (classId) {
            loadData();
        }
    }, [classId]); // Fixed: Removed unnecessary classIds dependency

    const createAttendanceHandler = async () => {
        if (state.isLoading || state.studentList.length > 0) return; // Prevent double execution

        dispatch({ type: "SET_LOADING", payload: true });
        const url = `${
            import.meta.env.VITE_BACKEND_URL
        }/attendances/create-new-attendances`;
        const body = JSON.stringify({
            classId,
            subBranchId: auth.userSubBranchId,
            branchId: auth.userBranchId,
            branchYearId: auth.currentBranchYearId,
        });
        try {
            await sendRequest(url, "POST", body, {
                "Content-Type": "application/json",
            });
            // After successful creation, fetch new data and navigate
            const attendanceDate = new Date().toLocaleDateString("en-CA");
            await fetchAttendanceData(classId, attendanceDate, dispatch);
            navigate(`/scan/class/${classId}`, { replace: true });
        } catch (err) {
            console.error(err);
            dispatch({
                type: "SET_ERROR",
                payload: err?.message || "Failed to create attendance",
            });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    const handleRetry = () => {
        dispatch({ type: "SET_ERROR", payload: null });
        const attendanceDate = new Date().toLocaleDateString("en-CA");
        fetchAttendanceData(classId, attendanceDate, dispatch);
    };

    // console.log(state)

    return (
        <div className="flex flex-col pb-40">
            <SequentialAnimation variant={2}>
                <StatusBar />
            </SequentialAnimation>

            {state.isLoading && <LoadingIndicator />}

            {state.error && (
                <ErrorDisplay error={state.error} onRetry={handleRetry} />
            )}

            {!state.isLoading && !state.error && (
                <SequentialAnimation variant={2}>
                    {state.studentList.length === 0 && !state.isLoading && (
                        <CreateAttendanceCard
                            onCreate={createAttendanceHandler}
                            isLoading={state.isLoading}
                            isBranchYearActivated={state.isBranchYearActivated}
                        />
                    )}
                    {state.studentList.length !== 0 && !state.isLoading && (
                        <>
                            {state.isBranchYearActivated === true && (
                                <div className="card-basic m-4">
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
        </div>
    );
};

export default ScannerView;
