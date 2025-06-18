import React from 'react';
import { Search, SlidersHorizontal, ArrowDownWideNarrow } from 'lucide-react';

const filterOptions = [
    {
        id: 'class',
        label: 'Semua Kelas',
        options: [
            { value: '', label: 'Semua Kelas' },
            { value: 'Kelas 1', label: 'Kelas 1' },
            { value: 'Kelas 2', label: 'Kelas 2' },
            { value: 'Kelas 3', label: 'Kelas 3' }
        ]
    },
    {
        id: 'branch',
        label: 'Semua Desa',
        options: [
            { value: '', label: 'Semua Desa' },
            { value: 'Teluk Jambe Timur', label: 'Teluk Jambe Timur' },
            { value: 'Teluk Jambe Barat', label: 'Teluk Jambe Barat' },
            { value: 'Cikampek Barat', label: 'Cikampek Barat' }
        ]
    },
    {
        id: 'subBranch',
        label: 'Semua Kelompok',
        options: [
            { value: '', label: 'Semua Kelompok' },
            { value: 'Margakarya', label: 'Margakarya' },
            { value: 'Purwasari', label: 'Purwasari' },
            { value: 'Sukaluyu', label: 'Sukaluyu' }
        ]
    },
    {
        id: 'gender',
        label: 'All Genders',
        options: [
            { value: '', label: 'All Genders' },
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' }
        ]
    }
];

const sortOptions = [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'class_asc', label: 'Class (Low-High)' },
    { value: 'class_desc', label: 'Class (High-Low)' }
];

function SearchFilter({ search, setSearch, setFilter, showFilters, setShowFilters, setSort }) {
    return (
        <div className="mb-4">
            <div className="flex gap-4">
                {/* Search Input */}
                <div className="relative w-full">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search students..."
                        className="w-full p-2 pl-10 border border-primary-subtle shadow-sm rounded-md hover:border-1 hover:border-primary outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(prev => !prev)}
                    className="flex items-center p-2 border bg-white shadow-sm border-primary-subtle rounded-md hover:border-1 hover:border-primary focus:ring-2 focus:ring-primary transition-all"
                >
                    <SlidersHorizontal className="h-5 w-5 text-gray-400 mr-2" />
                    <span className='text-gray-800'>Filter</span>
                </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
                <div className="mt-4 p-4 border border-primary-subtle rounded-md  bg-white shadow-sm transition-all duration-500">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        {/* Filter Dropdowns on the Right */}
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.map((filter) => (
                                <div key={filter.id}>
                                    <select
                                        onChange={(e) => setFilter(prev => ({ ...prev, [filter.id]: e.target.value }))}
                                        className="w-full p-2 border border-primary-subtle rounded-md hover:border-1 hover:border-primary outline-none focus:ring-2 focus:ring-primary transition-all"
                                    >
                                        {filter.options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* Sort Dropdown on the Left */}
                        <div className="flex items-center">
                            <ArrowDownWideNarrow className="h-5 w-5 text-gray-400 mr-2" />
                            <select
                                onChange={(e) => setSort(e.target.value)}
                                className="p-2 border border-primary-subtle rounded-md hover:border-1 hover:border-primary outline-none focus:ring-2 focus:ring-primary transition-all"
                            >
                                <option value="">Sort By</option>
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchFilter;