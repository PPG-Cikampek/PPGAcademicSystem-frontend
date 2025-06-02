import { Filter, X } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';

const DataTable = ({
    data,
    columns,
    onRowClick,
    searchableColumns = [],
    initialSort = { key: null, direction: 'ascending' },
    initialEntriesPerPage = 10,
    isLoading = false,
    filterOptions = [],
    config = {
        showFilter: true,
        showSearch: true,
        showTopEntries: true,
        showBottomEntries: true,
        showPagination: true,
        clickableRows: true,
        entriesOptions: [5, 10, 25, 50, 100]
    },
    tableId
}) => {
    const storageKey = tableId ? `datatable-state-${tableId}` : null;

    const loadPersistedState = () => {
        if (!storageKey) return {};
        try {
            const persisted = localStorage.getItem(storageKey);
            return persisted ? JSON.parse(persisted) : {};
        } catch {
            return {};
        }
    };

    const persisted = loadPersistedState();

    const [searchTerm, setSearchTerm] = useState(persisted.searchTerm ?? '');
    const [entriesPerPage, setEntriesPerPage] = useState(persisted.entriesPerPage ?? initialEntriesPerPage);
    const [currentPage, setCurrentPage] = useState(persisted.currentPage ?? 1);
    const [sortConfig, setSortConfig] = useState(persisted.sortConfig ?? initialSort);
    const [filters, setFilters] = useState(persisted.filters ?? {});
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (!storageKey) return;
        // console.log(currentPage)
        // console.log(persisted)
        localStorage.setItem(storageKey, JSON.stringify({
            searchTerm,
            entriesPerPage,
            currentPage,
            sortConfig,
            filters
        }));
    }, [searchTerm, entriesPerPage, currentPage, sortConfig, filters, storageKey]);

    const filteredData = useMemo(() => {
        let filtered = data.filter(item =>
            searchableColumns.some(column =>
                item[column]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                filtered = filtered.filter(item => {
                    const column = columns.find(col => col.key === key);
                    const itemValue = column.render ? column.render(item) : item[key];
                    return itemValue === value;
                });
            }
        });
        return filtered;
    }, [data, searchableColumns, searchTerm, filters, columns]);

    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;
        const column = columns.find(col => col.key === sortConfig.key);
        if (!column) return filteredData;
        const sorted = [...filteredData].sort((a, b) => {
            const aValue = column.render ? column.render(a) : a[sortConfig.key];
            const bValue = column.render ? column.render(b) : b[sortConfig.key];
            if (!aValue && !bValue) return 0;
            if (!aValue) return 1;
            if (!bValue) return -1;
            return sortConfig.direction === 'ascending'
                ? aValue.toString().localeCompare(bValue.toString())
                : bValue.toString().localeCompare(aValue.toString());
        });
        return sorted;
    }, [filteredData, columns, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / entriesPerPage);
    const indexOfLastItem = config.showPagination ? currentPage * entriesPerPage : sortedData.length;
    const indexOfFirstItem = config.showPagination ? indexOfLastItem - entriesPerPage : 0;
    const currentItems = config.showPagination
        ? sortedData.slice(indexOfFirstItem, indexOfLastItem)
        : sortedData;

    // useEffect(() => {
    //     if (currentPage > totalPages) {
    //         setCurrentPage(totalPages === 0 ? 1 : totalPages);
    //     }
    // }, [totalPages, currentPage]);

    const sortData = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            {columns.map((_, index) => (
                <td key={index} className="p-2 md:p-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                </td>
            ))}
        </tr>
    );

    const SkeletonHeader = () => (
        <tr>
            {columns.map((_, index) => (
                <th key={index} className="min-w-14 p-2 md:p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </th>
            ))}
        </tr>
    );

    const resetFilters = () => {
        setFilters({});
        setSearchTerm('');
        setCurrentPage(1);
        setSortConfig(initialSort);
    };

    const FilterCard = () => (
        <div className={`w-full my-2 overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-96' : 'max-h-0'}`}>
            <div className="card-basic flex-col rounded-md m-0 border p-4">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-normal text-base">Filter Data</h3>
                    <button
                        onClick={resetFilters}
                        className="btn-danger-outline"
                    >
                        Reset
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filterOptions.map(({ key, label, options }) => (
                        <div key={key}>
                            <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <select
                                className="w-full border rounded-full px-2 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                                value={filters[key] || ''}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    [key]: e.target.value || undefined
                                }))}
                            >
                                <option value="">Semua</option>
                                {options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="flex flex-col md:flex-row md:justify-between mb-2 flex-wrap gap-2">
                {isLoading ? (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </>
                ) : (
                    <>
                        {config.showTopEntries && (
                            <div className="flex items-center gap-2">
                                <span>Tampilkan</span>
                                <select
                                    className="border rounded px-2 py-1"
                                    value={entriesPerPage}
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                >
                                    {config.entriesOptions.map(value => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                                <span>item</span>
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row w-full md:w-auto items-start md:items-center gap-2">
                            {config.showSearch && (
                                <div className="flex items-center gap-2">
                                    <span>Pencarian:</span>
                                    <input
                                        type="text"
                                        className="px-2 py-1 border rounded-[4px] shadow-sm hover:ring-1 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            )}
                            {config.showFilter && filterOptions.length > 0 && (
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="btn-mobile-primary m-0 flex items-center gap-1"
                                >
                                    <Filter size={16} />
                                    Filter
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
            {config.showFilter && filterOptions.length > 0 && <FilterCard />}
            <div className="bg-white shadow-sm rounded-md overflow-auto text-nowrap mb-4">
                <table className="w-full">
                    <thead className="border-b">
                        {isLoading ? (
                            <SkeletonHeader />
                        ) : (
                            <tr>
                                {columns.map(({ key, label, sortable }) => (
                                    <th
                                        key={key}
                                        onClick={() => sortable && sortData(key)}
                                        className={`min-w-14 p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-gray-50' : ''
                                            }`}
                                    >
                                        {label}
                                        {sortable && sortConfig.key === key && (
                                            sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                                        )}
                                    </th>
                                ))}
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading ? (
                            Array(entriesPerPage).fill(0).map((_, index) => (
                                <SkeletonRow key={index} />
                            ))
                        ) : (
                            <>
                                {currentItems.map((item, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => onRowClick && onRowClick(item)}
                                        className={`${config.clickableRows && 'hover:bg-gray-50 hover:cursor-pointer'}  transition`}
                                    >
                                        {columns.map(({ key, render, cellStyle }) => (
                                            <td key={key} className={`${key === 'actions' ? 'p-2' : 'p-2 md:p-4'}`}>
                                                <span className={cellStyle?.(item)}>
                                                    {render ? render(item) : item[key]}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                {currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan={columns.length} className='p-4 text-center italic text-gray-500'>
                                            Tidak ada data
                                        </td>
                                    </tr>
                                )}
                            </>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center">
                {isLoading ? (
                    <>
                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex gap-2">
                            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </>
                ) : (
                    <>
                        {config.showBottomEntries && (
                            <div>
                                {sortedData.length === 0
                                    ? "Menampilkan 0 - 0 dari 0 item"
                                    : `Menampilkan ${indexOfFirstItem + 1} - ${Math.min(indexOfLastItem, sortedData.length)} dari ${sortedData.length} item`
                                }
                            </div>
                        )}
                        {config.showPagination && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || sortedData.length === 0}
                                    className="btn-primary-outline"
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || sortedData.length === 0}
                                    className="btn-primary-outline"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default DataTable;
