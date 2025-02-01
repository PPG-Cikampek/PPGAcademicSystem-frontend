import React from 'react'
import { attendanceCount } from '../../../shared/Utilities/attendanceCount';

const Dashboard = ({ data }) => {
    // console.log(JSON.stringify(data))

    return (
        <div className='my-8'>
            <h2 className='text-xl font-medium mb-2 '>{data.name}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="card-basic rounded-xl flex-col my-0 active:ring-1 w-full">
                    <h3 className="text-gray-500 text-sm">Jumlah Peserta Didik</h3>
                    <p className="text-2xl font-bold">{data.students?.length || 'No Data'}</p>
                </div>
                <div className="card-basic rounded-xl flex-col my-0 active:ring-1 w-full">
                    <h3 className="text-gray-500 text-sm">Total Pertemuan</h3>
                    <p className="text-2xl font-bold">
                        {data.attendances && data.teachingGroupYearId?.semesterTarget ?
                            // `${(data.attendances.length / data.teachingGroupYearId.semesterTarget / data.students.length * 100).toFixed(2)}%`
                            `${attendanceCount(data)}`
                            : 'No Data'
                        }
                    </p>
                </div>
            </div>
            {/* <div className="bg-white rounded-md shadow p-4">
                <h3 className="text-base font-medium mb-3">Placeholder</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center space-x-3 py-2 border-b border-gray-100">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div>
                                <p className="text-sm">Tulisan {item}</p>
                                <p className="text-xs text-gray-500">Keterangan</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
        </div>
    )
}

export default Dashboard;