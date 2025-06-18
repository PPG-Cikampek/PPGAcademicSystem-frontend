import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useHttp from '../../shared/hooks/http-hook'
import SkeletonLoader from '../../shared/Components/UIElements/SkeletonLoader'
import ErrorCard from '../../shared/Components/UIElements/ErrorCard'

const MunaqasyahClassList = () => {
    const [classes, setClasses] = useState()
    const { isLoading, error, sendRequest, setError } = useHttp()

    const subBranchYearId = useParams().subBranchYearId;


    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/scores/subBranchYear/${subBranchYearId}`);
                setClasses(responseData.classes);
                console.log(responseData)
                // console.log(JSON.stringify(responseData.classes))

            } catch (err) {
                // Error is handled by useHttp  
            }
        };
        fetchClasses();
    }, [sendRequest]);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <div className="max-w-6xl mx-auto">

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Kelas</h1>
                </div>

                {(!classes || isLoading) && (
                    <div className="space-y-4">
                        <SkeletonLoader variant="rectangular" width="100%" height={70} count={3} />
                    </div>
                )}

                {error && <ErrorCard error={error} />}

                {classes && !isLoading && (classes.map(cls => (
                    <div key={cls.classId._id}>
                        <Link
                            to={`/munaqasyah/class/${cls.classId._id}`}
                            state={{ subBranchYearId }}
                        >
                            <div className={`card-basic hover:bg-gray-100 active:bg-gray-100 hover:cursor-pointer rounded-md justify-start m-0 transition-all duration-200 my-4`}>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 h-fit">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg text-gray-900">{cls.classId.name}</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))

                )}
            </div>
        </div>
    )
}

export default MunaqasyahClassList