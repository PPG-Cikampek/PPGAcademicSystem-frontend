import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useHttp from '../../shared/hooks/http-hook'
import SkeletonLoader from '../../shared/Components/UIElements/SkeletonLoader'

const SelectMunaqasyahClassView = () => {
    const [classes, setClasses] = useState([])

    const { isLoading, error, sendRequest, setError } = useHttp()

    useEffect(() => {
        const fetchClasses = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/munaqasyahs/classes`
            try {
                const responseData = await sendRequest(url)
                console.log(responseData)
                setClasses(responseData)
            } catch (err) {
                // Error is handled by useHttp
            }
        }
        fetchClasses()
    }, [sendRequest])

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                <div className="flex md:flex-row flex-wrap justify-between md:justify-start gap-4 md:gap-8">
                    {isLoading ? (
                        // Skeleton loaders for loading state
                        [...Array(6)].map((_, index) => (
                            <div key={index} className="card-interactive justify-start min-h-16 min-w-40 max-w-42 md:min-h-40 md:min-w-80 md:max-w-96 rounded-md items-center md:p-8 m-0 gap-4">
                                <div className="mx-4 flex flex-col items-start gap-2 w-full">
                                    <SkeletonLoader variant="text" width="150px" height="24px" className="mb-2" />
                                    <SkeletonLoader variant="text" width="60px" height="16px" />
                                </div>
                            </div>
                        ))
                    ) : (
                        classes.map((cls) => (
                            <Link key={cls.grade} to={`/munaqasyah/question-bank/${cls.grade}`} className='card-interactive justify-start min-h-16 min-w-40 max-w-42 md:min-h-40 md:min-w-80 md:max-w-96 rounded-md items-center md:p-8 m-0 gap-4'>
                                <div className="mx-4 flex flex-col items-start gap-2 ">
                                    <h1 className="text-lg md:text-2xl font-bold">{cls.label.toUpperCase()}</h1>
                                    <p className="">{cls.questionCount} Soal</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}

export default SelectMunaqasyahClassView