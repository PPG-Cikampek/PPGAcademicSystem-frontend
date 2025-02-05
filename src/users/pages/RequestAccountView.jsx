import React, { useContext, useEffect, useState } from 'react'
import { GraduationCap, Users } from 'lucide-react';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';
import useHttp from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/Components/Context/auth-context';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate } from '../../shared/Utilities/formatDateToLocal';

const RequestAccountView = () => {
    const [tickets, setTickets] = useState()
    const { isLoading, sendRequest } = useHttp();

    const navigate = useNavigate()
    const auth = useContext(AuthContext);

    useEffect(() => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/users/account-requests/${auth.userId}`;

        console.log(url)
        const fetchTickets = async () => {
            try {
                const responseData = await sendRequest(url);
                setTickets(responseData);
                console.log(responseData)

            } catch (err) {
                // Error is handled by useHttp
            }
        };
        fetchTickets();
    }, [sendRequest]);
    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <h2 className='text-xl font-bold mb-4'>Daftar Permintaan Akun</h2>
            <div className='max-w-6xl mx-auto'>
                {isLoading && (
                    <div className="flex justify-center mt-16">
                        <LoadingCircle size={32} />
                    </div>
                )}
                {tickets && (
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
                                {tickets.tickets.map((ticket) => (
                                    <tr onClick={() => navigate(`/settings/requestAccount/ticket/${ticket.ticketId}`)} key={ticket.ticketId} className="hover:bg-gray-50 hover:cursor-pointer transition">
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{ticket.ticketId.slice(0, 8)}</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{formatDate(ticket.createdTime)}</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{ticket.accountList.length}</td>
                                        <td className="p-2 md:p-4 text-sm text-gray-900">{ticket.status}</td>
                                    </tr>
                                ))}
                                {tickets.tickets.length === 0 && (
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
                <h2 className='text-xl font-bold my-12 mb-4'>Buat Permintaan Akun</h2>
                <div className="flex flex-col justify-center md:flex-row gap-4">
                    <Link to="/settings/requestAccount/teacher" className='card-interactive md:min-h-64 md:min-w-96 min-h-36 rounded-md items-center md:mb-12 gap-4'>
                        <div className="mx-auto flex flex-col items-center gap-2 ">
                            <GraduationCap size={48} />
                            <div className='font-semibold'>Permintaan Akun Guru</div>
                        </div>
                    </Link>
                    <Link to="/settings/requestAccount/student" className='card-interactive md:min-h-64 md:min-w-96 min-h-36 rounded-md items-center mb-12 gap-4'>
                        <div className="mx-auto flex flex-col items-center gap-2 ">
                            <Users size={48} />
                            <div className='font-semibold'>Permintaan Akun Siswa</div>
                        </div>
                    </Link>
                </div>
            </div>

        </div>
    )
}

export default RequestAccountView