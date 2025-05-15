// ScannerView.jsx
import React, { useContext, useEffect, useState } from 'react';

import useHttp from '../../../shared/hooks/http-hook';

import { StudentAttendanceContext } from '../context/StudentAttendanceContext';
import { AuthContext } from '../../../shared/Components/Context/auth-context';

import QRCodeScanner from '../components/QRCodeScanner';
import StatusBar from '../components/StatusBar';
import AttendedStudents from '../components/AttendedStudents';
import SequentialAnimation from '../../shared/Components/Animation/SequentialAnimation';

import LoadingCircle from '../../../shared/Components/UIElements/LoadingCircle';
import { useNavigate, useParams } from 'react-router-dom';
import InfoCard from '../../shared/Components/UIElements/InfoCard';

const ScannerView = () => {
    const { error, sendRequest, setError } = useHttp();
    const [isLoading, setIsLoading] = useState(true);

    const { state, dispatch, fetchAttendanceData } = useContext(StudentAttendanceContext);

    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const classIds = auth.userClassIds;
    const classId = useParams().classId;

    useEffect(() => {
        setIsLoading(true);

        let attendanceDate
        attendanceDate = new Date().toLocaleDateString('en-CA');
        fetchAttendanceData(classId, attendanceDate, dispatch);

        setIsLoading(false);
    }, [classIds, classId]); // Added `attendanceCreated` to dependencies

    const createAttendanceHandler = async () => {
        setIsLoading(true);
        if (state.studentList.length === 0) {
            const url = `${import.meta.env.VITE_BACKEND_URL}/attendances/create-new-attendances`;
            const body = JSON.stringify({ classId });
            try {
                await sendRequest(url, 'POST', body, {
                    'Content-Type': 'application/json',
                });
                // After successful creation, fetch new data and navigate
                const attendanceDate = new Date().toLocaleDateString('en-CA');
                await fetchAttendanceData(classId, attendanceDate, dispatch);
                navigate(`/scan/class/${classId}`, { replace: true });
            } catch (err) {
                console.error(err);
            }
        }
        setIsLoading(false);
    };

    // console.log(state)

    return (
        <div className='flex flex-col pb-24'>
            <SequentialAnimation variant={2}>
                <StatusBar />
            </SequentialAnimation>

            {isLoading && (
                <div className={`flex justify-center mt-16 `}>
                    <LoadingCircle size={32} />
                </div>
            )}

            {!isLoading && (
                <SequentialAnimation variant={2}>
                    {state.studentList.length === 0 && !isLoading && (
                        <div className="card-basic m-4 justify-between items-center flex flex-col gap-2">
                            <button
                                onClick={() => createAttendanceHandler()}
                                className='btn-mobile-primary rounded-full w-full'
                                disabled={state.isTeachingGroupYearActivated === false}
                            >
                                Buat daftar hadir hari ini
                            </button>
                            {state.isTeachingGroupYearActivated === false ? (<span className='text-danger'>Tahun ajaran belum aktif, hubungi PJP Kelompok!</span>) : ''}
                        </div>
                    )}
                    {state.studentList.length !== 0 && !isLoading && (
                        <>
                            {state.isTeachingGroupYearActivated === true &&
                                (< div className='card-basic m-4'>
                                    <QRCodeScanner />
                                </div>)}
                            {state.isTeachingGroupYearActivated === false
                                ? (<InfoCard className={'mx-4 my-12'}>
                                    <p>Tahun ajaran belum aktif, hubungi PJP Kelompok!</p>
                                </InfoCard>)
                                : ''}
                        </>
                    )}
                    <AttendedStudents />
                </SequentialAnimation>
            )
            }
        </div >
    );
};

export default ScannerView;