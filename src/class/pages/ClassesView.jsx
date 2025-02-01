import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../shared/Components/Context/auth-context'
import { attendanceCount } from '../../shared/Utilities/attendanceCount'
import useHttp from '../../shared/hooks/http-hook'
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle'


const ClassesView = () => {
    const [classes, setClasses] = useState()
    const { isLoading, error, sendRequest } = useHttp()

    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    console.log(auth.userTeachingGroupId)

    useEffect(() => {
        const url = auth.userRole === 'admin'
            ? `${import.meta.env.VITE_BACKEND_URL}/classes`
            : `${import.meta.env.VITE_BACKEND_URL}/classes/teaching-group/${auth.userTeachingGroupId}`;

        const fetchClasses = async () => {
            console.log(url)
            try {
                const responseData = await sendRequest(url);
                setClasses(responseData.classes);
                console.log(JSON.stringify(responseData.classes))
            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchClasses();
    }, [sendRequest]);


    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className='max-w-6xl mx-auto'>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Kelas</h1>
                </div>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {classes && (
                    <div className="bg-white shadow-sm rounded-md overflow-auto text-nowrap">
                        <table className="w-full">
                            <thead className=" border-b">
                                <tr>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Mulai</th>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guru</th>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Siswa</th>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertemuan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {classes.map((cls) => (
                                    <tr onClick={() => navigate(`/dashboard/classes/${cls._id}`)} key={cls._id} className="hover:bg-gray-50 hover:cursor-pointer transition">
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{cls.name}</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{cls.startTime}</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-500">{cls.teachers.length}</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-500">{cls.students.length}</td>
                                        <td className={`p-2 md:p-4 text-sm text-gray-900`}>{attendanceCount(cls)}</td>
                                    </tr>
                                ))}
                                {classes.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className='p-4 text-center italic text-gray-500'>
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClassesView