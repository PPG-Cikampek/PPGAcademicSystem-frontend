import React from 'react';
import { ChevronDown } from 'lucide-react';
import DataTable from '../../shared/Components/UIElements/DataTable';

import { academicYearFormatter } from '../../shared/Utilities/academicYearFormatter';
import getMunaqasyahStatusName from '../../munaqasyah/utilities/getMunaqasyahStatusName';

const AcademicYearCard = ({ year, expanded, onToggle, onActivate, onMunaqsyahStatusChange, onDelete }) => {
    const transformedData = Array.isArray(year.branchYears) && year.branchYears.length > 0
        ? year.branchYears.map(group => ({
            name: group.branchId.name,
            isActive: group.isActive,
            munaqasyahStatus: group.munaqasyahStatus,
            _id: group._id
        }))
        : [];

    const columns = [
        {
            key: 'name',
            label: 'Desa Terdaftar',
            sortable: true,
        },
        {
            key: 'isActive',
            label: 'Status',
            sortable: true,
            headerAlign: 'center',
            cellAlign: 'center',
            render: (item) => item.isActive ? 'Aktif' : 'Nonaktif',
            cellStyle: (item) => `py-1 px-2 text-sm text-center w-min border rounded-md ${item.isActive ? 'text-green-500 bg-green-100 border-green-100' : 'text-red-500 bg-red-100 border-red-100'}`
        },
        {
            key: 'munaqasyahStatus',
            label: 'Munaqosah',
            sortable: true,
            headerAlign: 'center',
            cellAlign: 'center',
            render: (item) => getMunaqasyahStatusName(item.munaqasyahStatus),
            cellStyle: (item) => {
                if (year.munaqasyahStatus === 'notStarted') return 'py-1 px-2 rounded-md text-sm text-center w-min italic text-gray-500';
                if (item.munaqasyahStatus === 'notStarted') return 'py-1 px-2 rounded-md text-sm text-center w-min text-yellow-600 bg-yellow-100';
                if (item.munaqasyahStatus === 'inProgress') return 'py-1 px-2 rounded-md text-sm text-center w-min text-blue-600 bg-blue-100';
                if (item.munaqasyahStatus === 'completed') return 'py-1 px-2 rounded-md text-sm text-center w-min text-green-600 bg-green-100';
                return 'py-1 px-2 text-sm text-center w-min text-gray-500';
            }
        }
    ];

    // Helper for year-level status
    const getMunaqasyahStatusLabel = (status) => {
        if (status === 'notStarted') return { label: 'Munaqosah belum dimulai', className: 'text-yellow-600 bg-yellow-100' };
        if (status === 'inProgress') return { label: 'Munaqosah sedang berjalan', className: 'text-blue-600 bg-blue-100' };
        if (status === 'completed') return { label: 'Munaqosah selesai', className: 'text-green-600 bg-green-100' };
        return { label: 'Status tidak diketahui', className: 'text-gray-600 bg-gray-100' };
    };
    const munaqasyahStatusObj = getMunaqasyahStatusLabel(year.munaqasyahStatus);
    console.log(munaqasyahStatusObj);

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 
      ${year.isActive ? 'border-2 border-green-400 ring-2 ring-green-100' : 'border border-gray-200'}`}>
            <div
                onClick={onToggle}
                className="cursor-pointer p-6 hover:bg-gray-50 transition-colors duration-200"
            >
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-medium text-gray-800">
                        {academicYearFormatter(year.name)}
                    </h2>
                    <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200
              ${expanded ? 'transform rotate-180' : ''}`}
                    />
                </div>

                <div className="flex justify-between items-center text-gray-600">
                    <span>{year.branchYears.length} Desa terdaftar</span>
                </div>

                {year.isActive ? (
                    <div className="flex flex-col items-start gap-1">
                        <div className="inline-block mt-2 px-2 py-1 text-sm text-green-600 bg-green-100 rounded-sm">
                            Tahun Ajaran Aktif
                        </div>
                        <div className={`inline-block mt-2 px-2 py-1 text-sm rounded-sm ${munaqasyahStatusObj.className}`}>
                            {munaqasyahStatusObj.label}
                        </div>
                        {year.munaqasyahStatus === 'inProgress' && (
                            <button
                                className='btn-primary-outline mt-2'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMunaqsyahStatusChange('complete', year.name, year._id);
                                }}>
                                Selesaikan Munaqosah
                            </button>
                        )}
                        {year.munaqasyahStatus !== 'inProgress' && (
                            <button
                                className='btn-primary-outline mt-2'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMunaqsyahStatusChange('start', year.name, year._id);
                                }}>
                                {year.munaqasyahStatus === 'notStarted' ? 'Mulai Munaqosah' : 'Mulai Munaqosah Susulan'}
                            </button>
                        )}
                    </div>
                ) : (
                    <button
                        className='btn-primary-outline mt-2'
                        onClick={(e) => {
                            e.stopPropagation();
                            onActivate(year.name, year._id);
                        }}>
                        Aktifkan Tahun Ajaran
                    </button>
                )}
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[800px]' : 'max-h-0'}`}>
                <div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
                    {year.branchYears.length > 0 ? (
                        <>
                            <DataTable
                                data={transformedData}
                                columns={columns}
                                searchableColumns={['name']}
                                initialSort={{ key: 'name', direction: 'ascending' }}
                                initialEntriesPerPage={5}
                                config={{
                                    showFilter: false,
                                    showSearch: false,
                                    showTopEntries: false,
                                    showBottomEntries: false,
                                    showPagination: false,
                                    entriesOptions: [10, 20, 30]
                                }}
                            />
                            <div className=" flex justify-end">
                                <button onClick={() => onDelete(year.name, year.id)} className='px-2 italic text-gray-500 hover:underline hover:text-red-500 hover:cursor-pointer'>
                                    Hapus Tahun Ajaran
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-400 italic mt-4">
                                Belum ada Desa yang mendaftarkan diri
                            </p>
                            <div className="mt-4 flex justify-end">
                                <button onClick={() => onDelete(year.name, year.id)} className='px-2 italic text-gray-500 hover:underline hover:text-red-500 hover:cursor-pointer'>
                                    Hapus Tahun Ajaran
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcademicYearCard;
