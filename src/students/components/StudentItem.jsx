import React from 'react';
import { useNavigate } from 'react-router-dom';

function StudentItem({ student }) {
    const navigate = useNavigate();

    return (
        <tr onClick={() => navigate(`/dashboard/students/${student.id}`)} className="hover:bg-gray-50 hover:cursor-pointer">
            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-800">{student.nik}</td>
            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-800">{student.name}</td>
            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-600 hidden md:table-cell">{student.branch}</td>
            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-600 hidden md:table-cell">{student.teachingGroup}</td>
            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-600">{student.class}</td>
            <td className="px-3 py-3 md:px-6 md:py-4 text-sm text-gray-600 hidden md:table-cell">{student.gender}</td>
        </tr>

    );
}

export default StudentItem;
