import React, { useContext, useEffect, useState } from 'react'
import useHttp from '../../shared/hooks/http-hook'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import SkeletonLoader from '../../shared/Components/UIElements/SkeletonLoader'
import ErrorCard from '../../shared/Components/UIElements/ErrorCard'
import { Eye, MapPin, PlusIcon } from 'lucide-react'
import DataTable from '../../shared/Components/UIElements/DataTable'
import { AuthContext } from '../../shared/Components/Context/auth-context'
import MunaqasyahCard from '../components/MunaqasyahCard'
import { render } from 'react-dom'
import getMunaqasyahStatusName from '../utilities/getMunaqasyahStatusName'

const BranchAdminMunaqasyahDetailView = () => {
    const [subBranchData, setSubBranchData] = useState([])

    const { sendRequest, isLoading, error, setError } = useHttp()

    const auth = useContext(AuthContext)
    const teachingGroupId = useParams().teachingGroupId

    const navigate = useNavigate()
    const location = useLocation()
    const state = location.state.year || {}
    console.log(state)

    useEffect(() => {
        const fetchSubBranchData = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/levels/branches/${auth.userBranchId}/sub-branches/`)

                setSubBranchData(responseData.subBranches)
                console.log(responseData)
            } catch (err) { }
        }
        fetchSubBranchData()
    }, [sendRequest, setError])

    const getMunaqasyahStatusStyle = (status) => {
        const statusClassMap = {
            notStarted: 'bg-gray-100 text-gray-600 px-2 py-1 rounded',
            inProgress: 'bg-yellow-400 text-white px-2 py-1 rounded',
            completed: 'bg-green-500 text-white px-2 py-1 rounded',
        };
        return statusClassMap[status] || 'bg-red-500 text-white px-2 py-1 rounded';
    };

    const subBranchColumns = [
        { key: 'name', label: 'Nama', sortable: true, headerAlign: 'left', cellAlign: 'left' },
        { key: 'munaqisyCount', label: 'Jumlah Munaqis', sortable: true, headerAlign: 'center', cellAlign: 'center' },
        { key: 'studentCount', label: 'Jumlah Siswa', sortable: true, headerAlign: 'center', cellAlign: 'center' },
        { key: 'progress', label: 'Penyelesaian', sortable: true, headerAlign: 'center', cellAlign: 'center' },
        { key: 'avgScore', label: 'Nilai Rata-Rata', sortable: true, headerAlign: 'center', cellAlign: 'center' },
        {
            key: 'munaqasyahStatus', label: 'Status', sortable: true, headerAlign: 'center', cellAlign: 'center',
            render: (item) => getMunaqasyahStatusName(item.munaqasyahStatus),
            cellStyle: (item) => getMunaqasyahStatusStyle(item.munaqasyahStatus)
        },
        {
            key: 'action', label: 'Aksi', sortable: false, headerAlign: 'center', cellAlign: 'center', render: (item) => (
                <Link to={`/dashboard/teaching-groups/${teachingGroupId}/sub-branches/${item._id}`}>
                    <button
                        className="btn-primary-outline disabled:opacity-50"
                        disabled={true}>
                        <Eye className="w-4 h-4 " />
                    </button>
                </Link>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8 pb-24">
            <div className="max-w-6xl mx-auto">

                {error && <ErrorCard error={error} onClear={() => setError(null)} />}

                {(!subBranchData || isLoading) && (
                    <div className="flex flex-col gap-6 mt-16 px-4">
                        <SkeletonLoader
                            variant="text"
                            width="200px"
                            height="32px"
                            className="mb-2"
                        />
                        <SkeletonLoader
                            variant="rectangular"
                            height="100px"
                            className="rounded-lg"
                            count={3}
                        />
                    </div>
                )}


                {subBranchData && !isLoading && state && (
                    <>
                        <div className="mb-8">
                            <div className="flex flex-col gap-4">
                                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Munaqosah Desa</h1>
                                <MunaqasyahCard year={state} isClickAble={false} />
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="mb-2 flex justify-between items-end">
                                <div className="flex gap-1 items-center">
                                    {/* <GraduationCap className="mr-2 h-5 w-5 text-gray-600" /> */}
                                    <h2 className="text-xl font-medium text-gray-800">Daftar Kelompok</h2>
                                </div>
                            </div>
                            <DataTable
                                data={subBranchData || []}
                                columns={subBranchColumns}
                                searchableColumns={['name']}
                                initialSort={{ key: 'name', direction: 'ascending' }}
                                initialEntriesPerPage={5}
                                onRowClick={(row) => { `/dashboard/teaching-groups/${teachingGroupId}/sub-branches/${row._id}` }}
                                config={{
                                    showSearch: false,
                                    showTopEntries: false,
                                    showBottomEntries: false,
                                    showPagination: false,
                                    clickableRows: false,
                                    entriesOptions: [5, 10, 20, 30]
                                }}
                                tableId={`teaching-group-sub-branches-table-${teachingGroupId}`} // Unique table ID for this teaching group
                            />
                        </div>
                    </>
                )}


            </div>
        </div >
    )
}

export default BranchAdminMunaqasyahDetailView