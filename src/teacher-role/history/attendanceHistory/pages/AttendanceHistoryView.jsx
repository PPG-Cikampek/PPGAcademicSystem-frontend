import React, { useEffect, useState, useContext } from 'react'
import AttendanceList from '../components/AttendanceList'
import useHttp from '../../../../shared/hooks/http-hook'
import { AuthContext } from '../../../../shared/Components/Context/auth-context'

import LoadingCircle from '../../../../shared/Components/UIElements/LoadingCircle'

import { StudentAttendanceContext } from '../../../scan/context/StudentAttendanceContext';
import { useParams } from 'react-router-dom'
import AttendanceHistoryViewByClass from './AttendanceHistoryViewByClass'
import ClassCards from '../components/ClassCards'
import InfoCard from '../../../shared/Components/UIElements/InfoCard'

const AttendanceHistoryView = () => {
    const [loadedData, setLoadedData] = useState();
    const { isLoading, error, sendRequest, clearError } = useHttp();

    const auth = useContext(AuthContext)
    const classIds = auth.userClassIds


    useEffect(() => {
        const loadClasses = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/classes/get-by-ids`

            const body = JSON.stringify({
                classIds
            })

            console.log('fetching classes this teacher enrolled...')

            try {
                const responseData = await sendRequest(url, 'POST', body, {
                    'Content-Type': 'application/json'
                })
                setLoadedData(responseData)

                console.log('fetching classes complete...')
                console.log(responseData)


            } catch (err) { }
        };
        loadClasses();

    }, [sendRequest]);

    return (
        <div>
            {!loadedData && isLoading && (
                < div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}
            {error && (
                <InfoCard className={'mx-4 mt-12'}>
                    <p>Belum terdaftar di kelas manapun!</p>
                </InfoCard>
            )}

            {loadedData && <ClassCards data={loadedData} />}
        </div>
    );
};

export default AttendanceHistoryView