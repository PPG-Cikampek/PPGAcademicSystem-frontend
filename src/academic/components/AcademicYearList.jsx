import React from 'react';
import { Link } from 'react-router-dom';
import AcademicYearCard from './AcademicYearCard';

const AcademicYearList = ({ years, expandedCards, onToggleCard, onActivateYear, onMunaqsyahStatusChange, onDeleteYear }) => {
    console.log(years)
    if (years.length === 0) {
        return (
            <div className="bg-white rounded-md shadow-md p-6 border border-gray-200">
                <p className="text-gray-700 text-center">
                    Belum ada tahun ajaran. <Link to="/academic/new" className="text-blue-500 hover:underline">Buat baru</Link>
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-stretch gap-4">
            {years.map((year) => (
                <AcademicYearCard
                    key={year._id}
                    year={year}
                    expanded={expandedCards[year._id]}
                    onToggle={() => onToggleCard(year._id)}
                    onActivate={onActivateYear}
                    onMunaqsyahStatusChange={onMunaqsyahStatusChange}
                    onDelete={onDeleteYear}
                />
            ))}
        </div>
    );
};

export default AcademicYearList;
