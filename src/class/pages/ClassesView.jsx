import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DataTable from '../../shared/Components/UIElements/DataTable'

const ClassesView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const classes = location.state?.classes || [];
    console.log(classes)

    const columns = [
        { key: 'name', label: 'Nama Kelas', sortable: true },
        { key: 'startTime', label: 'Waktu Mulai', sortable: true },
        { key: 'teachingGroupId', label: 'Kelompok', sortable: true },
        { key: 'teachers', label: 'Guru', sortable: true, render: (row) => row.teachers },
        { key: 'students', label: 'Siswa', sortable: true, render: (row) => row.students },
        { key: 'attendances', label: 'Pertemuan', sortable: true, render: (row) => row.attendances },
    ];

    const filterOptions = [
        { key: 'name', label: 'Nama Kelas', options: Array.from(new Set(classes.map(c => c.name))) },
        { key: 'startTime', label: 'Waktu Mulai', options: Array.from(new Set(classes.map(c => c.startTime))) },
        { key: 'teachingGroupId', label: 'Kelompok', options: Array.from(new Set(classes.map(c => c.teachingGroupId))) },
    ];

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className='max-w-6xl mx-auto'>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Kelas</h1>
                </div>
                <DataTable
                    data={classes}
                    columns={columns}
                    onRowClick={(cls) => navigate(`/dashboard/classes/${cls._id}`)}
                    searchableColumns={['name', 'teachingGroupId']}
                    initialSort={{ key: 'name', direction: 'ascending' }}
                    isLoading={false}
                    filterOptions={filterOptions}
                    tableId="classes-by-academic-year"
                />
            </div>
        </div>
    )
}

export default ClassesView