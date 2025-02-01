import React from "react";

const AttendanceList = ({ data }) => {
    // Group attendances by `forDate`
    const groupedByDate = data.reduce((acc, item) => {
        const date = new Date(item.forDate).toLocaleDateString();
        acc[date] = acc[date] || [];
        acc[date].push(item);
        return acc;
    }, {});

    return (
        <div className="p-4 space-y-6">
            {Object.entries(groupedByDate).map(([date, attendances]) => (
                <div key={date} className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">{date}</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {attendances.map((attendance) => (
                            <div
                                key={attendance._id}
                                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                <p className="text-sm text-gray-500">
                                    <strong>Status:</strong> {attendance.status}
                                </p>
                                <p className="text-sm text-gray-500">
                                    <strong>Student ID:</strong> {attendance.studentId}
                                </p>
                                <p className="text-sm text-gray-500">
                                    <strong>Class ID:</strong> {attendance.classId}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AttendanceList;

// Example Usage
// import AttendanceCards from './AttendanceCards';

// const data = [/* JSON here */];

// <AttendanceCards data={data} />;



// import React, { useState } from 'react';


// import { motion, AnimatePresence } from 'framer-motion';
// import { Plus, Minus } from 'lucide-react'


// const GroupedData = ({ data }) => {
//     const [expandedDate, setExpandedDate] = useState(null);

//     const handleToggle = (date) => {
//         setExpandedDate(expandedDate === date ? null : date);
//     };

//     return (
//         <div className="space-y-4 p-4">
//             {Object.keys(data).map((date) => {
//                 const fullDate = new Date(data[date][0].dateObj);
//                 const dayName = fullDate.toLocaleDateString('id-ID', { weekday: 'long' });
//                 const formattedDate = fullDate.toLocaleDateString('id-ID'); // dd/mm/yyyy format

//                 return (
//                     <div key={date} className="border border-gray-300 rounded-md shadow-sm">
//                         <button
//                             onClick={() => handleToggle(date)}
//                             className={`w-full p-2 flex justify-between items-center bg-blue-100 active:bg-blue-200 hover:bg-blue-200 rounded-t-md ${expandedDate === date ? '' : 'rounded-b-md'} transition-all duration-300`}
//                         >
//                             <span className="font-medium">{`${dayName}, ${formattedDate}`}</span>
//                             <span>{expandedDate !== date ? <Plus size={12} /> : <Minus size={12} />}</span>
//                         </button>

//                         <AnimatePresence initial={false}>
//                             {expandedDate === date && (
//                                 <motion.div
//                                     initial={{ height: 0, opacity: 0 }}
//                                     animate={{ height: 'auto', opacity: 1 }}
//                                     exit={{ height: 0, opacity: 0 }}
//                                     transition={{ duration: 0.2 }}
//                                     className="overflow-hidden bg-gray-50 rounded-b-md"
//                                 >
//                                     <div className="">
//                                         <table className="min-w-full text-left table-fixed text-sm">
//                                             <thead>
//                                                 <tr className="bg-gray-200">
//                                                     <th className="w-1/3 p-2  font-medium">Nama</th>
//                                                     <th className="w-1/3 p-2  font-medium">Status</th>
//                                                     <th className="w-1/3 p-2  font-medium">Waktu</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody className='text-xs'>
//                                                 {data[date].map((entry) => (
//                                                     <tr key={entry.id} className="border-t border-gray-300">
//                                                         <td className="p-2">{entry.studentId.name}</td>
//                                                         <td className="p-2">{entry.status}</td>
//                                                         <td className="p-2">{new Date(entry.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 </motion.div>
//                             )}
//                         </AnimatePresence>
//                     </div>
//                 );
//             })}
//         </div>
//     );
// };

// export default GroupedData;
