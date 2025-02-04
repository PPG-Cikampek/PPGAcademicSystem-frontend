import React, { useContext, useEffect, useState } from 'react'
import { GraduationCap, Presentation, Users, House, Gauge, UserRoundPlus, UserCog, Layers2, FolderCog, CalendarCog, ArrowRightLeft } from 'lucide-react';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';


const RequestAccountView = () => {

    const [teachers, setTeachers] = useState()


    const { isLoading, sendRequest } = useHttp();

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
    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className='max-w-6xl mx-auto'>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {teachers && (
                    <div className="bg-white shadow-sm rounded-md overflow-auto text-nowrap">
                        <table className="w-full">
                            <thead className=" border-b">
                                <tr>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Akun</th>
                                    <th className="p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teachers.map((teacher) => (
                                    <tr onClick={() => navigate(`/dashboard/teachers/${teacher._id}`)} key={teacher._id} className="hover:bg-gray-50 hover:cursor-pointer transition">
                                        <td className='p-2 md:p-4 '> <div className={`py-1 px-2 text-sm text-center w-min border rounded-md ${teacher.positionEndDate ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'}`}>{teacher.positionEndDate ? 'Tidak Aktif' : 'Aktif'}</div></td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{teacher.nid}</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{teacher.name}</td>
                                        <td className={`p-2 md:p-4 text-sm text-gray-900 ${teacher.isProfileComplete ? 'text-green-500' : 'text-red-500 hover:underline cursor-pointer'}`}>{teacher.isProfileComplete ? 'Lengkap' : 'Lengkapi'}</td>
                                    </tr>
                                ))}
                                {teachers.length === 0 && (
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
                <div className="flex flex-col justify-center md:flex-row my-12 gap-4 md:mr-24">
                    <div className='card-interactive md:min-h-64 md:min-w-96 min-h-36 rounded-md items-center md:mb-12 gap-4'>
                        <div className="mx-auto flex flex-col items-center gap-2 ">
                            <GraduationCap size={48} />
                            <div className='font-semibold'>Akun Guru</div>
                        </div>
                    </div>
                    <div className='card-interactive md:min-h-64 md:min-w-96 min-h-36 rounded-md items-center mb-12 gap-4'>
                        <div className="mx-auto flex flex-col items-center gap-2 ">
                            <Users size={48} />
                            <div className='font-semibold'>Akun Siswa</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default RequestAccountView