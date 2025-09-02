// ScannerView.jsx
import { useContext, useEffect, useState } from "react";

import useHttp from "../../../shared/hooks/http-hook";

import { StudentAttendanceContext } from "../context/StudentAttendanceContext";
import { AuthContext } from "../../../shared/Components/Context/auth-context";

import QRCodeScanner from "../organisms/QRCodeScanner";
import StatusBar from "../organisms/StatusBar";
import AttendedStudents from "../organisms/AttendedStudents";
import SequentialAnimation from "../../shared/Components/Animation/SequentialAnimation";

import LoadingCircle from "../../../shared/Components/UIElements/LoadingCircle";
import { useNavigate, useParams } from "react-router-dom";
import InfoCard from "../../shared/Components/UIElements/InfoCard";

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

    // console.log(state)

    return (
        <div className="flex flex-col pb-40">
            <SequentialAnimation variant={2}>
                <StatusBar />
            </SequentialAnimation>

            {state.isLoading && (
                <div className={`flex justify-center mt-16 `}>
                    <LoadingCircle size={32} />
                </div>
            )}

            {state.error && (
                <div className="mx-4 my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p>Error: {state.error}</p>
                    <button
                        onClick={() => {
                            dispatch({ type: "SET_ERROR", payload: null });
                            const attendanceDate =
                                new Date().toLocaleDateString("en-CA");
                            fetchAttendanceData(
                                classId,
                                attendanceDate,
                                dispatch
                            );
                        }}
                        className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!state.isLoading && !state.error && (
                <SequentialAnimation variant={2}>
                    {state.studentList.length === 0 && !state.isLoading && (
                        <div className="card-basic m-4 justify-between items-center flex flex-col gap-2">
                            <button
                                onClick={() => createAttendanceHandler()}
                                className="btn-mobile-primary rounded-full w-full"
                                disabled={
                                    state.isLoading ||
                                    state.isBranchYearActivated === false
                                }
                            >
                                {state.isLoading
                                    ? "Membuat..."
                                    : "Buat daftar hadir hari ini"}
                            </button>
                            {state.isBranchYearActivated === false ? (
                                <span className="text-danger">
                                    PJP Desa belum mengaktifkan tahun ajaran!
                                </span>
                            ) : (
                                ""
                            )}
                        </div>
                    )}
                    {state.studentList.length !== 0 && !state.isLoading && (
                        <>
                            {state.isBranchYearActivated === true && (
                                <div className="card-basic m-4">
                                    <QRCodeScanner />
                                </div>
                            )}
                            {state.isBranchYearActivated === false ? (
                                <InfoCard className={"mx-4 my-12"}>
                                    <p>Tahun ajaran desa belum aktif</p>
                                </InfoCard>
                            ) : (
                                ""
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
