import React from 'react';

function AttendedStudentItem({ student }) {
    return (
        <tr className="hover:bg-gray-50 hover:cursor-pointer">
            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-800">{student.nik}</td>
            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-800">{student.name}</td>
        </tr>

    );
}

export default AttendedStudentItem;
