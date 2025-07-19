import React, { useEffect, useState } from 'react'
import useHttp from '../../shared/hooks/http-hook'
import { useParams } from 'react-router-dom'
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle'
import { formatDate } from '../../shared/Utilities/formatDateToLocal'

const RequestAccountTicketDetail = () => {
    const [data, setData] = useState()

    const { isLoading, error, sendRequest, setError } = useHttp()

    const ticketId = useParams().ticketId

    console.log(ticketId)

    useEffect(() => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/users/account-requests/ticket/${ticketId}`;

        const fetchTicketData = async () => {
            try {
                const responseData = await sendRequest(url);
                setData(responseData[0].accountList);
                console.log(JSON.stringify(responseData))
            } catch (err) { }
        };
        fetchTicketData();
    }, [sendRequest, ticketId])

    return (
        <div className="min-h-screen px-4 py-8 md:p-8">
            <div className='max-w-6xl mx-auto'>
                <div className="flex flex-col justify-between items-start gap-2 mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Permintaan Akun</h1>
                    {data && console.log(data)}
                    {!isLoading && data && (
                        <>
                            <div className="w-full bg-white shadow-xs rounded-md overflow-auto text-nowrap mt-4">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-200 p-2 text-left font-normal text-gray-500">NAMA</th>
                                            <th className="border border-gray-200 p-2 text-left font-normal text-gray-500">TANGGAL LAHIR</th>
                                            <th className="border border-gray-200 p-2 text-left font-normal text-gray-500">{data.accountRole === 'student' ?     'KELAS' : 'EMAIL'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((data, index) => (
                                            <tr key={index}>
                                                <td className="border border-gray-200 p-2">{data.name}</td>
                                                <td className="border border-gray-200 p-2">{formatDate(data.dateOfBirth)}</td>
                                                <td className="border border-gray-200 p-2">{data.accountRole === 'student' ? data.className : data.email}</td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RequestAccountTicketDetail