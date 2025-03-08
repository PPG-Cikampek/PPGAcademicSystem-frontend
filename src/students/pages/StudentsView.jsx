import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import StudentInitial from '../../shared/Components/UIElements/StudentInitial';
import WarningCard from '../../shared/Components/UIElements/WarningCard';
import DataTable from '../../shared/Components/UIElements/DataTable';

const StudentsView = () => {
    const [students, setStudents] = useState([]);
    const { isLoading, sendRequest } = useHttp();
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    useEffect(() => {
        const url = auth.userRole === 'admin'
            ? `${import.meta.env.VITE_BACKEND_URL}/students`
            : `${import.meta.env.VITE_BACKEND_URL}/students/teaching-group/${auth.userTeachingGroupId}`;

        const fetchStudents = async () => {
            try {
                const responseData = await sendRequest(url);
                setStudents(responseData.students);
                console.log(responseData.students);
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchStudents();
    }, [sendRequest]);

    const columns = [
        {
            key: 'image',
            label: '',
            sortable: false,
            render: (student) => (
                student.image ? (
                    <img
                        src={`${import.meta.env.VITE_BACKEND_URL}/${student.image}`}
                        alt={student.name}
                        className="size-10 rounded-full m-auto shrink-0"
                    />
                ) : (
                    <StudentInitial 
                        studentName={student.name} 
                        clsName={`size-10 shrink-0 rounded-full bg-blue-200 text-blue-500 flex items-center justify-center font-medium m-auto`} 
                    />
                )
            )
        },
        ...(auth.userRole !== 'admin' ? [{
            key: 'isActive',
            label: 'Status',
            sortable: true,
            render: (student) => (
                <div className={`py-1 px-2 text-sm text-center w-min border rounded-md ${
                    !student.isActive ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'
                }`}>
                    {!student.isActive ? 'Tidak Aktif' : 'Aktif'}
                </div>
            )
        }] : []),
        { key: 'nis', label: 'NIS', sortable: true },
        { key: 'name', label: 'Nama', sortable: true },
        ...(auth.userRole === 'admin' ? [
            { 
                key: 'branch',
                label: 'Desa',
                sortable: true,
                render: (student) => student.userId.teachingGroupId.branchId.name
            },
            {
                key: 'group',
                label: 'Kelompok',
                sortable: true,
                render: (student) => student.userId.teachingGroupId.name
            }
        ] : []),
        {
            key: 'isProfileComplete',
            label: 'Profile',
            sortable: true,
            render: (student) => (
                <span className={student.isProfileComplete ? 'text-green-500' : 'text-red-500 hover:underline cursor-pointer'}>
                    {student.isProfileComplete ? 'Lengkap' : 'Lengkapi'}
                </span>
            )
        }
    ];

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className='max-w-6xl mx-auto'>
                <div className="flex flex-col justify-between items-stretch gap-2 mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Peserta Didik</h1>
                    <WarningCard 
                        className="items-center justify-start" 
                        warning="Penambahan Peserta Didik Baru Supaya Menghubungi Daerah!" 
                        onClear={() => setError(null)} 
                    />
                </div>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {students && (
                    <DataTable
                        data={students}
                        columns={columns}
                        onRowClick={(student) => navigate(`/dashboard/students/${student._id}`)}
                        searchableColumns={['name', 'nis']}
                        initialSort={{ key: 'name', direction: 'ascending' }}
                    />
                )}
            </div>
        </div>
    );
};

export default StudentsView;
