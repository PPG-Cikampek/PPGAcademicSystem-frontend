import React, { useEffect, useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import useHttp from '../../../shared/hooks/http-hook'
import { AuthContext } from '../../../shared/Components/Context/auth-context'

import LoadingCircle from '../../../shared/Components/UIElements/LoadingCircle'

import InfoCard from '../../shared/Components/UIElements/InfoCard'

const SelectClassView = () => {
    const [loadedData, setLoadedData] = useState();
    const { isLoading, error, sendRequest, clearError } = useHttp();

    const auth = useContext(AuthContext)
    const classIds = auth.userClassIds
    const navigate = useNavigate()

    useEffect(() => {
        const loadClasses = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/classes/get-by-ids`
            const body = JSON.stringify({ classIds })
            console.log('fetching classes this teacher enrolled...')
            console.log(classIds)

            try {
                const responseData = await sendRequest(url, 'POST', body, {
                    'Content-Type': 'application/json'
                })
                setLoadedData(responseData)

                console.log('fetching classes complete...')
                console.log(responseData)

            } catch (err) { }
        };
        console.log(classIds)
        if (classIds.length === 0) {
            setLoadedData({ classes: [] })
        } else {
            loadClasses();
        }
    }, [sendRequest]);

    let activeClassCount = 0;

    return (
        <div>
            {!loadedData && isLoading && (
                < div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}
            {loadedData && (
                <div className='h-dvh'>
                    <div className="card-basic mt-24 mx-4 rounded-3xl justify-start items-stretch gap-2">
                        <ul className='flex flex-col gap-2 items-stretch w-full'>
                            <h2 className='text-lg my-2'>Absen Untuk Kelas:</h2>
                            {loadedData.classes.map((classItem) => {
                                const isClassInTeachingGroupYear = classItem?.teachingGroupYearId?.academicYearId?.isActive
                                if (isClassInTeachingGroupYear) {
                                    activeClassCount++
                                    return (
                                        <Link
                                            to={`/scan/class/${classItem._id}`}
                                            key={classItem._id}
                                            className='border border-gray-300 px-6 py-3 bg-white rounded-full active:bg-gray-200'
                                        >
                                            {classItem.name}
                                        </Link>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                    {activeClassCount === 0 && (
                        <InfoCard className={'mx-4 mt-12'}>
                            <p>Belum terdaftar di kelas manapun!</p>
                        </InfoCard>
                    )}
                </div>
            )}
        </div>
    );
};

export default SelectClassView