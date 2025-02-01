import React from 'react';
import StudentItem from './Studentitem';

function StudentList({ students }) {
    return (
        <div className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
            <table className="w-full">
                <thead className="bg-white border-b border-gray-200">
                    <tr>
                        <th className="px-3 py-3 md:px-6 md:py-4 text-left text-sm font-medium text-gray-400">NIK</th>
                        <th className="px-3 py-3 md:px-6 md:py-4 text-left text-sm font-medium text-gray-400">Nama</th>
                        <th className="px-3 py-3 md:px-6 md:py-4 text-left text-sm font-medium text-gray-400 hidden md:table-cell">Desa</th>
                        <th className="px-3 py-3 md:px-6 md:py-4 text-left text-sm font-medium text-gray-400 hidden md:table-cell">Kelompok</th>
                        <th className="px-3 py-3 md:px-6 md:py-4 text-left text-sm font-medium text-gray-400">Kelas</th>
                        <th className="px-3 py-3 md:px-6 md:py-4 text-left text-sm font-medium text-gray-400 hidden md:table-cell">Gender</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                        <StudentItem key={student.id} student={student} />
                    ))}
                    {students.length === 0 && (
                        <tr>
                            <td colSpan="6" className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-500 text-center">
                                Data tidak ditemukan!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default StudentList;
