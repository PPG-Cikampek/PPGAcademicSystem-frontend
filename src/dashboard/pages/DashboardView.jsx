import React, { useContext, useEffect, useState } from 'react'

import { AuthContext } from '../../shared/Components/Context/auth-context'
import useHttp from '../../shared/hooks/http-hook'
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle'
import ErrorCard from '../../shared/Components/UIElements/ErrorCard'

import { GraduationCap, Presentation, Users, Gauge, Layers2, Layers } from 'lucide-react';


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
    // console.log(auth.userSubBranchId)

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                        {dashboardData.Desa &&
                            <div className='card-interactive rounded-md gap-4 md:gap-8 flex items-center justify-start border-0 border-b-4 border-secondary md:p-8 m-0 w-full h-full'>
                                <Layers className="size-8 md:size-10" />
                                <div className="flex flex-col">
                                    <h1 className="text-lg md:text-3xl font-bold">{dashboardData.Desa && dashboardData.Desa}</h1>
                                    <p className="">{"Desa"}</p>
                                </div>
                            </div>
                        }
                        {dashboardData.Kelompok &&
                            <div className='card-interactive rounded-md gap-4 md:gap-8 flex items-center justify-start border-0 border-b-4 border-secondary md:p-8 m-0 w-full h-full'>
                                <Layers2 className="size-8 md:size-10" />
                                <div className="flex flex-col">
                                    <h1 className="text-lg md:text-3xl font-bold">{dashboardData.Kelompok && dashboardData.Kelompok}</h1>
                                    <p className="">{"Kelompok"}</p>
                                </div>
                            </div>
                        }
                        {dashboardData.kelas &&
                            <div className='card-interactive rounded-md gap-4 md:gap-8 flex items-center justify-start border-0 border-b-4 border-secondary md:p-8 m-0 w-full h-full'>
                                <Presentation className="size-8 md:size-10" />
                                <div className="flex flex-col">
                                    <h1 className="text-lg md:text-3xl font-bold">{dashboardData.Kelas && dashboardData.Kelas}</h1>
                                    <p className="">{"Kelas"}</p>
                                </div>
                            </div>
                        }
                        <div className='card-interactive rounded-md gap-4 md:gap-8 flex items-center justify-start border-0 border-b-4 border-secondary md:p-8 m-0 w-full h-full'>
                            <Users className="size-8 md:size-10" />
                            <div className="flex flex-col">
                                <h1 className="text-lg md:text-3xl font-bold">{dashboardData["Peserta Didik"] && dashboardData["Peserta Didik"]}</h1>
                                <p className="">{"Peserta Didik"}</p>
                            </div>
                        </div>
                        <div className='card-interactive rounded-md gap-4 md:gap-8 flex items-center justify-start border-0 border-b-4 border-secondary md:p-8 m-0 w-full h-full'>
                            <GraduationCap className="size-8 md:size-10" />
                            <div className="flex flex-col">
                                <h1 className="text-lg md:text-3xl font-bold">{dashboardData["Tenaga Pendidik"] && dashboardData["Tenaga Pendidik"]}</h1>
                                <p className="">{"Tenaga Pendidik"}</p>
                            </div>
                        </div>
                        <div className='card-interactive rounded-md gap-4 md:gap-8 flex items-center justify-start border-0 border-b-4 border-secondary md:p-8 m-0 w-full h-full'>
                            <Gauge className="size-8 md:size-10" />
                            <div className="flex flex-col">
                                <h1 className="text-lg md:text-3xl font-bold">{dashboardData.Kehadiran && dashboardData.Kehadiran.toFixed(1)}{dashboardData.Kehadiran ? "%" : "-"}</h1>
                                <p className="">{"Kehadiran"}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default DashboardView