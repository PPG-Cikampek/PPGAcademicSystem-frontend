import React from "react";
import { academicYearFormatter } from "../../shared/Utilities/academicYearFormatter";

const MunaqasyahCard = ({ year, onClick, isClickAble = true }) => (
    <div
        className="bg-white rounded-md shadow-md overflow-hidden transition-all duration-200"
        onClick={onClick}
    >
        <div
            className={`p-6 ${isClickAble ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors duration-200`}
        >
            <div className="flex md:justify-between items-start md:flex-row flex-col md:items-center w-full">
                <div className='flex gap-2 flex-row flex-wrap'>
                    <h2 className="text-xl font-medium text-gray-800">{academicYearFormatter(year.academicYearId.name)}</h2>
                    <div className="flex gap-2">
                        <div className={`inline-block px-2 py-1 text-sm ${year.isActive ? '' : (year.academicYearId.isActive ? 'text-blue-600 bg-blue-100' : 'text-gray-600 bg-gray-100')} rounded`}>
                            {year.isActive ? 'Aktif' : (year.academicYearId.isActive ? 'Semester Berjalan' : 'Semester Lewat')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default MunaqasyahCard;
