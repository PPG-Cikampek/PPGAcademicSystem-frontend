import React, { useContext, useEffect, useState } from 'react'

import { AuthContext } from '../../shared/Components/Context/auth-context'
import useHttp from '../../shared/hooks/http-hook'
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle'
import ErrorCard from '../../shared/Components/UIElements/ErrorCard'

const DashboardView = () => {
    const { isLoading, error, sendRequest, setError } = useHttp()
    const [dashboardData, setDashboardData] = useState()
    const auth = useContext(AuthContext)

    useEffect(() => {
        const fetchDashboard = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/dashboard`
            try {
                const responseData = await sendRequest(url, 'POST', JSON.stringify({}), {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token
                })
                setDashboardData(responseData.dashboardData)
                console.log(responseData.dashboardData)
            } catch (err) { }
        }
        fetchDashboard()
    }, [sendRequest])

    // console.log(auth.userId)
    // console.log(auth.userName)
    // console.log(auth.userRole)
    // console.log(auth.userTeachingGroupId)

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8">
            <main className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                </div>

                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {error && <ErrorCard error={error} onClear={() => setError(null)} />}

                {!isLoading && dashboardData && (
                    <div className="flex md:flex-row flex-wrap justify-between md:justify-start gap-4 md:gap-8">
                        {Object.entries(dashboardData).map(([key, value]) => (
                            <div key={key} className='card-interactive rounded-md border-0 border-b-4 border-secondary md:p-8 hover:cursor-default m-0 flex flex-col gap-4 min-h-16 min-w-40 max-w-[10.5rem] md:min-h-40 md:min-w-80 md:max-w-96 flex-grow'>

                                {key !== 'Kehadiran'
                                    ?
                                    <>
                                        <h1 className="text-lg md:text-3xl font-bold">{value}</h1>
                                        <p className="">{key}</p>
                                    </>
                                    : value > 0 ?
                                        <>
                                            <h1 className="text-lg md:text-3xl font-bold">{value.toFixed(2)}%</h1>
                                            <p className="">{key}</p>
                                        </>
                                        :
                                        <>
                                            <h1 className="text-2xl font-bold">Tidak ada data</h1>
                                            <p className="">{key}</p>
                                        </>
                                }

                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default DashboardView