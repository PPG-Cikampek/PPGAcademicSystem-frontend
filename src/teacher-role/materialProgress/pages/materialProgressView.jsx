import React, { useContext, useEffect, useState } from 'react'
import FloatingMenu from '../../../shared/Components/UIElements/FloatingMenu';

import { Pencil, Trash, ChevronLeft, ChevronRight } from "lucide-react"
import FloatingButton from '../../shared/Components/UIElements/FloatingButton';
import useHttp from '../../../shared/hooks/http-hook';
import { AuthContext } from '../../../shared/Components/Context/auth-context';
import ErrorCard from '../../../shared/Components/UIElements/ErrorCard';
import SkeletonLoader from '../../../shared/Components/UIElements/SkeletonLoader';
import InfoCard from '../../shared/Components/UIElements/InfoCard';

const getMonday = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
};

const MaterialProgressView = () => {
    const [progressData, setProgressData] = useState()
    const [currentWeek, setCurrentWeek] = useState(getMonday(new Date()))
    const [showDatePicker, setShowDatePicker] = useState(false)
    const { isLoading, error, sendRequest, setError } = useHttp()

    const auth = useContext(AuthContext)

    useEffect(() => {
        const fetchProgresses = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/materialProgress/${auth.userId}?week=${currentWeek.toISOString()}`
            console.log(url)
            try {
                const responseData = await sendRequest(url);
                setProgressData(responseData.progresses);
                console.log(responseData)
            } catch (err) {
                // handled by useHttp
            }
        }
        fetchProgresses();
    }, [sendRequest, currentWeek])

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Jakarta'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('id-ID', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
    };

    const handleWeekChange = (direction) => {
        const newDate = new Date(currentWeek);
        newDate.setDate(currentWeek.getDate() + direction * 7);
        setCurrentWeek(newDate);
    };

    const handleDateChange = (event) => {
        setCurrentWeek(new Date(event.target.value));
        setShowDatePicker(false);
    };

    return (
        <>
            {error && (
                <div className='m-2'>
                    <ErrorCard error={error} onClear={() => setError(null)} />
                </div>
            )}

            <div className="flex justify-between items-center m-5 px-10">
                <button onClick={() => handleWeekChange(-1)}>
                    <div className='p-2 border-2 rounded-full bg-white active:bg-gray-400'>
                        <ChevronLeft size={24} />
                    </div>
                </button>
                <div className="relative">
                    <button onClick={() => setShowDatePicker(!showDatePicker)}>
                        {formatDate(currentWeek)}
                    </button>
                    {showDatePicker && (
                        <input
                            type="month"
                            className="absolute top-full -left-4 mt-1 border rounded-full px-4 py-2"
                            onChange={handleDateChange}
                        />
                    )}
                </div>
                <button onClick={() => handleWeekChange(1)}>
                    <div className='p-2 border-2 rounded-full bg-white active:bg-gray-400'>
                        <ChevronRight size={24} />
                    </div>
                </button>
            </div>

            {isLoading && (
                <div className="flex flex-col gap-4 mt-16 mx-4">
                    <SkeletonLoader 
                        variant="rectangular"
                        height="120px"
                        className="rounded-lg"
                        count={3}
                    />
                </div>
            )}

            {progressData && !isLoading && (
                <>

                    {/* <h1 className='text-2xl font-medium m-5'>Jurnal Saya</h1> */}
                    {progressData.length >= 1 && progressData.map((progress) => (
                        <div className="card-basic mx-4 rounded-3xl shadow-sm justify-start">
                            <div className="flex justify-between w-full">
                                <div className="flex flex-col">
                                    <div className="flex flex-col">
                                        <h3 className='text-xs text-gray-400 font-medium uppercase'>{formatDate(progress.forDate)}</h3>
                                        <h3 className='text-xs text-gray-400 font-medium uppercase'>{formatTime(progress.forDate)}</h3>
                                        <h2 className='my-2 text-xl text-gray-700 font-medium'>{progress.category}</h2>
                                        <h4 className='text-base text-black font-normal text-justify'>{progress.material}</h4>
                                    </div>
                                </div>
                                <FloatingMenu
                                    style="flex items-center gap-2 p-2 border border-gray-300 bg-white hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
                                    buttons={[
                                        {
                                            icon: Pencil,
                                            label: 'Edit',
                                        },
                                        {
                                            icon: Trash,
                                            label: 'Delete',
                                            variant: 'danger',
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    ))}
                    {progressData.length === 0 && (
                        <InfoCard className='mx-4'>
                            <h3 className='text-gray-500 italic'>Tidak ada data</h3>
                        </InfoCard>
                    )}
                    <FloatingButton link={'/materialProgress/new'} />
                </>
            )}
        </>
    )
}

export default MaterialProgressView