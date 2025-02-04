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
                                    <tr className="hover:bg-gray-50 hover:cursor-pointer transition">
                                        <td className="p-2 md:p-4 text-sm text-gray-900">1234</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">1 Februari 2024</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">3</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">Pending</td>
                                    </tr>
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
                <h2 className='text-2xl font-bold my-12 mb-4'>Buat Permintaan Akun</h2>
                <div className="flex flex-col justify-center md:flex-row gap-4">
                    <div className='card-interactive md:min-h-64 md:min-w-96 min-h-36 rounded-md items-center md:mb-12 gap-4'>
                        <div className="mx-auto flex flex-col items-center gap-2 ">
                            <GraduationCap size={48} />
                            <div className='font-semibold'>Permintaan Akun Guru</div>
                        </div>
                    </div>
                    <div className='card-interactive md:min-h-64 md:min-w-96 min-h-36 rounded-md items-center mb-12 gap-4'>
                        <div className="mx-auto flex flex-col items-center gap-2 ">
                            <Users size={48} />
                            <div className='font-semibold'>Permintaan Akun Siswa</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default RequestAccountView