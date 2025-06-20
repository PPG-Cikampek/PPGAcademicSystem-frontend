import React, { useContext, useEffect, useState } from 'react'
import useHttp from '../../shared/hooks/http-hook'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SkeletonLoader from '../../shared/Components/UIElements/SkeletonLoader'
import ErrorCard from '../../shared/Components/UIElements/ErrorCard'
import { Eye, KeyRound, Layers2, Lock, LockOpen, MapPin, PlusIcon, Presentation, Trash } from 'lucide-react'
import DataTable from '../../shared/Components/UIElements/DataTable'
import { AuthContext } from '../../shared/Components/Context/auth-context'
import Modal from '../../shared/Components/Modal';
import ModalFooter from '../../shared/Components/ModalFooter';
import useModal from '../../shared/hooks/useModal';

const TeachingGroupsView = () => {
    const [teachingGroupData, setTeachingGroupData] = useState()

    const { sendRequest, isLoading, error, setError } = useHttp()

    const auth = useContext(AuthContext)
    const teachingGroupId = useParams().teachingGroupId

    const navigate = useNavigate()

    // Modal state using the new hook
    const {
        isOpen: modalIsOpen,
        modal,
        openModal,
        closeModal,
        setModal
    } = useModal({ title: '', message: '', onConfirm: null });

    useEffect(() => {
        const fetchTeachingGroupData = async () => {
            try {
                const responseData = await sendRequest(`${import.meta.env.VITE_BACKEND_URL}/teachingGroups/${teachingGroupId}`)

                setTeachingGroupData(responseData.identifiedTeachingGroup)
                console.log(responseData.identifiedTeachingGroup)
            } catch (err) {
                // setError(err.message || 'Failed to fetch teaching groups.')  
            }
        }
        fetchTeachingGroupData()
        // Expose fetchTeachingGroupData for use elsewhere
        TeachingGroupsView.fetchTeachingGroupData = fetchTeachingGroupData;
    }, [sendRequest])



    const subBranchColumns = [
        { key: 'name', label: 'Nama', sortable: true, headerAlign: 'left', cellAlign: 'left' },
        { key: 'address', label: 'Alamat Kegiatan', sortable: true, headerAlign: 'left', cellAlign: 'left' },
        { key: 'teacherCount', label: 'Jumlah Guru', sortable: true, headerAlign: 'center', cellAlign: 'center' },
        { key: 'studentCount', label: 'Jumlah Siswa', sortable: true, headerAlign: 'center', cellAlign: 'center' },
        { key: 'attendancePerformance', label: 'Kehadiran', sortable: true, headerAlign: 'center', cellAlign: 'center' },
        {
            key: 'action', label: 'Aksi', sortable: false, headerAlign: 'center', cellAlign: 'center', render: (item) => (

                <>
                    <Link to={`/dashboard/teaching-groups/${teachingGroupId}/sub-branches/${item._id}`}>
                        <button className="p-3 rounded-full hover:bg-gray-200 text-blue-500 hover:text-blue-700 transition opacity-50 disabled:hover:bg-white" disabled={true}>
                            <Eye size={20} />
                        </button>
                    </Link>
                    {teachingGroupData.branchYearId.academicYearId.isActive
                        && teachingGroupData.isLocked === false
                        && (<button
                            onClick={(e) => { e.stopPropagation(); removeSubBranchHandler(item.name, item._id); }}
                            className="p-3 rounded-full hover:bg-gray-200 text-red-500 hover:text-red-700 transition"
                        >
                            <Trash size={20} />
                        </button>)
                    }
                </>
            )
        }
    ];

    const classColumns = [
        { key: 'name', label: 'Nama', sortable: true, headerAlign: 'left', cellAlign: 'left' },
        { key: 'startTime', label: 'Waktu Mulai', sortable: true, headerAlign: 'center', cellAlign: 'center', cellStyle: () => 'text-center' },
        { key: 'endTime', label: 'Waktu Selesai', sortable: true, headerAlign: 'center', cellAlign: 'center' },
        {
            key: 'teacherCount', label: 'Jumlah Guru', sortable: true, headerAlign: 'center', cellAlign: 'center',
            render: (item) => item.teachers ? item.teachers.length : 0
        },
        {
            key: 'studentCount', label: 'Jumlah Siswa', sortable: true, headerAlign: 'center', cellAlign: 'center',
            render: (item) => item.students ? item.students.length : 0
        },
        { key: 'attendancePerformance', label: 'Kehadiran', sortable: true, headerAlign: 'center', cellAlign: 'center' },
        {
            key: 'isLocked', label: 'status', sortable: true, headerAlign: 'center', cellAlign: 'center',
            render: (item) => item.isLocked ? <Lock size={16} /> : <LockOpen size={16} />,
            cellStyle: (item) => `m-auto flex justify-center items-center p-1 border-2 rounded-md size-6 ${item.isLocked ? 'text-white bg-green-400 border-green-400' : 'text-white bg-red-400 border-red-400'}`
        },
        {
            key: 'action', label: 'Aksi', sortable: false, headerAlign: 'center', cellAlign: 'center', render: (item) => (
                <>
                    <Link to={`/dashboard/classes/${item._id}`}>
                        <button className="p-3 rounded-full hover:bg-gray-200 text-blue-500 hover:text-blue-700 transition">
                            <Eye size={20} />
                        </button>
                    </Link>
                    {auth.userRole === 'branchAdmin'
                        && teachingGroupData.branchYearId.academicYearId.isActive
                        && teachingGroupData.isLocked === false
                        && (<>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    item.isLocked ? lockClassHandler("unlock", item.name, item._id) : lockClassHandler("lock", item.name, item._id);
                                }}
                                className="p-3 rounded-full hover:bg-gray-200 text-yellow-500 hover:text-yellow-700 transition"
                            >
                                <KeyRound size={20} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeClassHandler(item.name, item._id); }}
                                className="p-3 rounded-full hover:bg-gray-200 text-red-500 hover:text-red-700 transition"
                            >
                                <Trash size={20} />
                            </button>
                        </>)
                    }
                </>
            )
        }
    ];

    const removeSubBranchHandler = (name, subBranchId) => {
        const confirmRemove = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/teachingGroups/remove-sub-branch/`;
            const body = JSON.stringify({ teachingGroupId, subBranchId })
            let responseData;
            try {
                responseData = await sendRequest(url, 'DELETE', body, {
                    'Content-Type': 'application/json'
                });
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
                // Refresh teaching group data after successful delete
                if (TeachingGroupsView.fetchTeachingGroupData) {
                    TeachingGroupsView.fetchTeachingGroupData();
                }
            } catch (err) {
                // Error is already handled by useHttp
            }
        };
        setModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus ${name} KBM ini?`,
            onConfirm: confirmRemove,
        });
        closeModal(); // Ensure modal is closed before opening
        openModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus ${name} KBM ini?`,
            onConfirm: confirmRemove,
        });
    }

    const lockClassHandler = (actionType, className, classId) => {
        console.log(actionType)
        const confirmLock = async () => {
            const url = actionType === 'lock'
                ? `${import.meta.env.VITE_BACKEND_URL}/classes/lock`
                : `${import.meta.env.VITE_BACKEND_URL}/classes/unlock`;
            const body = JSON.stringify({ classId })

            let responseData;
            try {
                responseData = await sendRequest(url, 'PATCH', body, {
                    'Content-Type': 'application/json'
                });

                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
                if (TeachingGroupsView.fetchTeachingGroupData) {
                    TeachingGroupsView.fetchTeachingGroupData();
                }

            } catch (err) {
                setModal({ title: 'Gagal!', message: err.message, onConfirm: null });
            }
        }
        closeModal()
        if (actionType === 'lock') {
            openModal({
                title: `Kunci kelas: ${className}?`,
                message: `Kelas tidak akan bisa di-edit lagi!`,
                onConfirm: confirmLock,
            });
        } else {
            openModal({
                title: `Buka Kunci kelas: ${className}?`,
                message: `Kelas akan bisa di-edit lagi`,
                onConfirm: confirmLock,
            });
        }
    }

    const removeClassHandler = (name, classId) => {
        const confirmRemove = async () => {
            const url = `${import.meta.env.VITE_BACKEND_URL}/teachingGroups/remove-class/`;
            const body = JSON.stringify({ teachingGroupId, classId })
            let responseData;
            try {
                responseData = await sendRequest(url, 'DELETE', body, {
                    'Content-Type': 'application/json'
                });
                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
                // Refresh teaching group data after successful delete
                if (TeachingGroupsView.fetchTeachingGroupData) {
                    TeachingGroupsView.fetchTeachingGroupData();
                }
            } catch (err) {
                // Error is already handled by useHttp
            }
        };
        setModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus ${name} dari KBM ini?`,
            onConfirm: confirmRemove,
        });
        closeModal(); // Ensure modal is closed before opening
        openModal({
            title: `Konfirmasi Penghapusan`,
            message: `Hapus ${name} dari KBM ini?`,
            onConfirm: confirmRemove,
        });
    }

    const lockTeachingGroupHandler = (actionType, teachingGroupId) => {
        console.log(actionType)
        const confirmLock = async () => {
            const url = actionType === 'lock'
                ? `${import.meta.env.VITE_BACKEND_URL}/teachingGroups/lock`
                : `${import.meta.env.VITE_BACKEND_URL}/teachingGroups/unlock`;
            const body = JSON.stringify({ teachingGroupId })

            let responseData;
            try {
                responseData = await sendRequest(url, 'PATCH', body, {
                    'Content-Type': 'application/json'
                });

                setModal({ title: 'Berhasil!', message: responseData.message, onConfirm: null });
                if (TeachingGroupsView.fetchTeachingGroupData) {
                    TeachingGroupsView.fetchTeachingGroupData();
                }

            } catch (err) {
                setModal({ title: 'Gagal!', message: err.message, onConfirm: null });
            }
        }
        closeModal()
        if (actionType === 'lock') {
            openModal({
                title: `Kunci KBM: ${teachingGroupData.name}?`,
                message: `KBM tidak akan bisa di-edit lagi!`,
                onConfirm: confirmLock,
            });
        } else {
            openModal({
                title: `Buka Kunci KBM: ${teachingGroupData.name}?`,
                message: `KBM akan bisa di-edit lagi`,
                onConfirm: confirmLock,
            });
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 md:p-8 pb-24">
            <div className="max-w-6xl mx-auto">

                {error && <ErrorCard error={error} onClear={() => setError(null)} />}

                {(!teachingGroupData || isLoading) && (
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


                {teachingGroupData && !isLoading && (
                    <>
                        <div className="mb-8">
                            <div className="flex flex-col gap-4">
                                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Detail KBM</h1>
                                <div className="card-basic flex-col md:flex-row justify-between md:items-center rounded-md m-0 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <h1 className="flex items-center gap-2 text-xl font-medium text-gray-900 mb-2">KBM {teachingGroupData.name}
                                            <span className={`inline-block p-1 rounded-md border-2 ${teachingGroupData.isLocked ? 'border-blue-500 text-blue-500' : 'border-red-500 text-red-500'}`}>{teachingGroupData.isLocked ? <Lock size={16} /> : <LockOpen size={16} />}</span>
                                        </h1>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <MapPin className="h-5 w-5" />
                                            <span>Tempat Kegiatan KBM: {teachingGroupData.address}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Layers2 className="h-5 w-5" />
                                            <span>Jumlah Kelompok: {teachingGroupData?.subBranches?.length || '0'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Presentation className="h-5 w-5" />
                                            <span>Jumlah Kelas: {teachingGroupData?.classes?.length || '0'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        {(teachingGroupData.branchYearId.isActive === false
                                            && teachingGroupData.branchYearId.academicYearId.isActive === true
                                            && auth.userRole === 'branchAdmin'
                                            && teachingGroupData.isLocked === true)
                                            && (
                                                <button
                                                    className='button-danger'
                                                    onClick={() => lockTeachingGroupHandler("unlock", teachingGroupId)}
                                                >
                                                    Buka KBM
                                                </button>
                                            )}

                                        {(teachingGroupData.branchYearId.isActive === false
                                            && teachingGroupData.branchYearId.academicYearId.isActive === true
                                            && teachingGroupData.isLocked === false
                                            && auth.userRole === 'branchAdmin')
                                            && (
                                                <button
                                                    className='button-primary'
                                                    onClick={() => lockTeachingGroupHandler("lock", teachingGroupId)}
                                                >
                                                    Kunci KBM
                                                </button>
                                            )}
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="mb-2 flex justify-between items-center">
                                <div className="flex gap-1 items-center">
                                    {/* <GraduationCap className="mr-2 h-5 w-5 text-gray-600" /> */}
                                    <h2 className="text-xl font-medium text-gray-800">Kelompok Terdaftar</h2>
                                </div>
                                {teachingGroupData.branchYearId.academicYearId.isActive
                                    && auth.userRole === 'branchAdmin'
                                    && teachingGroupData.isLocked === false
                                    && (
                                        <button
                                            className="button-primary pl-[11px] mt-0"
                                            onClick={() => {
                                                navigate(`/dashboard/teaching-groups/${teachingGroupId}/add-sub-branches/`, {
                                                    state: {
                                                        teachingGroupData: teachingGroupData,
                                                    }
                                                })
                                            }}>
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Tambah Kelompok
                                        </button>
                                    )}
                            </div>
                            <DataTable
                                data={teachingGroupData.subBranches || []}
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

                        <div className="mb-8">
                            <div className="mb-2 flex justify-between items-center">
                                <div className="flex gap-1 items-center">
                                    {/* <GraduationCap className="mr-2 h-5 w-5 text-gray-600" /> */}
                                    <h2 className="text-xl font-medium text-gray-800">Kelas Terdaftar</h2>
                                </div>
                                {auth.userRole === 'branchAdmin'
                                    && teachingGroupData.branchYearId.academicYearId.isActive
                                    && teachingGroupData.isLocked === false
                                    && (
                                        <Link to={`/dashboard/teaching-groups/${teachingGroupId}/add-class/`}>
                                            <button className="button-primary pl-[11px] mt-0">
                                                <PlusIcon className="w-4 h-4 mr-2" />
                                                Tambah Kelas
                                            </button>
                                        </Link>
                                    )}
                            </div>
                            <DataTable
                                data={teachingGroupData.classes || []}
                                columns={classColumns}
                                searchableColumns={['name']}
                                initialSort={{ key: 'name', direction: 'ascending' }}
                                initialEntriesPerPage={5}
                                // onRowClick={(row) => navigate(`/dashboard/classes/${row._id}`)}
                                config={{
                                    showSearch: false,
                                    showTopEntries: false,
                                    showBottomEntries: false,
                                    showPagination: false,
                                    clickableRows: false,
                                    entriesOptions: [5, 10, 20, 30]
                                }}
                                tableId={`teaching-group-classes-table-${teachingGroupId}`} // Unique table ID for this teaching group
                            />
                        </div>
                        <Modal
                            isOpen={modalIsOpen}
                            title={modal.title}
                            message={modal.message}
                            onClose={closeModal}
                            onConfirm={modal.onConfirm}
                            footer={<ModalFooter isLoading={isLoading} onClose={closeModal} onConfirm={modal.onConfirm} showConfirm={!!modal.onConfirm} />}
                        />
                    </>
                )}


            </div>
        </div >
    )
}

export default TeachingGroupsView