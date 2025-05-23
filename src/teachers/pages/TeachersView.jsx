import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';

import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import WarningCard from '../../shared/Components/UIElements/WarningCard';
import DataTable from '../../shared/Components/UIElements/DataTable';
import getTeacherPositionName from '../../shared/Utilities/getTeacherPositionName';

const TeachersView = () => {
    const [teachers, setTeachers] = useState()
    const { isLoading, sendRequest } = useHttp();


    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    useEffect(() => {
        const url = auth.userRole === 'admin'
            ? `${import.meta.env.VITE_BACKEND_URL}/teachers`
            : `${import.meta.env.VITE_BACKEND_URL}/teachers/teaching-group/${auth.userTeachingGroupId}`;

        console.log(url)
        const fetchTeachers = async () => {
            try {
                const responseData = await sendRequest(url);
                setTeachers(responseData.teachers);
                console.log(responseData.teachers)
                console.log(auth.userTeachingGroupId)

            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchTeachers();
    }, [sendRequest]);

    const getInitials = (gender) => {
        return gender
            ?.split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const columns = [
        {
            key: 'image',
            label: '',
            render: (teacher) => (
                teacher.image ? (
                    <img
                        src={teacher.thumbnail ? teacher.thumbnail : `${import.meta.env.VITE_BACKEND_URL}/${teacher.image}`}
                        alt={teacher.name}
                        className="size-10 rounded-full m-auto min-w-10 border border-gray-200 bg-white"
                    />
                ) : (
                    <div className="size-10 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium m-auto">
                        {getInitials(teacher.name)}
                    </div>
                )
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (teacher) => teacher.positionEndDate ? 'Tidak Aktif' : 'Aktif',
            cellStyle: (teacher) => `py-1 px-2 text-sm text-center w-min border rounded-md ${teacher.positionEndDate ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'
                }`
        },
        {
            key: 'position',
            label: 'Dapukan',
            sortable: true,
            render: (teacher) => getTeacherPositionName(teacher.position),
        },
        { key: 'nig', label: 'NIG', sortable: true },
        { key: 'name', label: 'Nama', sortable: true },
        ...(auth.userRole === 'admin' ? [
            {
                key: 'branch',
                label: 'Desa',
                sortable: true,
                render: (teacher) => teacher?.userId?.teachingGroupId?.branchId?.name
            },
            {
                key: 'group',
                label: 'Kelompok',
                sortable: true,
                render: (teacher) => teacher?.userId?.teachingGroupId?.name
            }
        ] : []),
        {
            key: 'isProfileComplete',
            label: 'Profile',
            render: (teacher) => teacher.isProfileComplete ? 'Lengkap' : 'Lengkapi',
            cellStyle: (teacher) => `${teacher.isProfileComplete ? 'text-green-500' : 'text-red-500 hover:underline cursor-pointer'}`
        }
    ];

    const filterOptions = [
        {
            key: 'status',
            label: 'Status',
            options: ['Aktif', 'Tidak Aktif']
        },
        {
            key: 'isProfileComplete',
            label: 'Kelengkapan Profil',
            options: ['Lengkap', 'Lengkapi']
        }
    ];

    if (auth.userRole === 'admin' && teachers?.length > 0) {
        const branches = [...new Set(teachers.map(t => t?.userId?.teachingGroupId?.branchId?.name).filter(Boolean))];
        const groups = [...new Set(teachers.map(t => t?.userId?.teachingGroupId?.name).filter(Boolean))];

        filterOptions.push(
            {
                key: 'branch',
                label: 'Desa',
                options: branches
            },
            {
                key: 'group',
                label: 'Kelompok',
                options: groups
            }
        );

        console.log(filterOptions)
    }

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className='max-w-6xl mx-auto'>
                <div className="flex flex-col justify-between items-start gap-2 mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Tenaga Pendidik</h1>
                    <WarningCard className="items-center justify-start" warning="Penambahan tenaga pendidik baru dapat dilakukan melalui fitur Permintaan Akun." onClear={() => setError(null)} />
                </div>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {teachers && (
                    <DataTable
                        data={teachers}
                        columns={columns}
                        onRowClick={(teacher) => navigate(`/dashboard/teachers/${teacher._id}`)}
                        searchableColumns={['name', 'nig']}
                        initialSort={{ key: 'name', direction: 'ascending' }}
                        isLoading={isLoading}
                        filterOptions={filterOptions}
                        tableId="teachers-table" // <-- Add unique tableId
                    />
                )}
            </div>
        </div>
    );
};

export default TeachersView;