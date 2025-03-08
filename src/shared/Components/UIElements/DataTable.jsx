import React, { useState, useEffect } from 'react';

const DataTable = ({ 
    data, 
    columns, 
    onRowClick,
    searchableColumns = [],
    initialSort = { key: null, direction: 'ascending' },
    initialEntriesPerPage = 10
}) => {
    const [filteredData, setFilteredData] = useState(data);
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(initialEntriesPerPage);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState(initialSort);

    useEffect(() => {
        const filtered = data.filter(item =>
            searchableColumns.some(column => 
                item[column]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setFilteredData(filtered);
        setCurrentPage(1);
    }, [searchTerm, data, searchableColumns]);

    const sortData = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });

        const sorted = [...filteredData].sort((a, b) => {
            if (!a[key] || !b[key]) return 0;
            return direction === 'ascending' 
                ? a[key].toString().localeCompare(b[key].toString())
                : b[key].toString().localeCompare(a[key].toString());
        });
        setFilteredData(sorted);
    };

    const indexOfLastItem = currentPage * entriesPerPage;
    const indexOfFirstItem = indexOfLastItem - entriesPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / entriesPerPage);

    return (
        <>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <span>Tampilkan</span>
                    <select
                        className="border rounded px-2 py-1"
                        value={entriesPerPage}
                        onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    >
                        {[5, 10, 25, 50, 100].map(value => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                    <span>item</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>Pencarian:</span>
                    <input
                        type="text"
                        className="px-2 py-1 mb-1 border rounded-[4px] shadow-sm hover:ring-1 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="bg-white shadow-sm rounded-md overflow-auto text-nowrap mb-4">
                <table className="w-full">
                    <thead className="border-b">
                        <tr>
                            {columns.map(({ key, label, sortable }) => (
                                <th
                                    key={key}
                                    onClick={() => sortable && sortData(key)}
                                    className={`min-w-14 p-2 md:p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                        sortable ? 'cursor-pointer hover:bg-gray-50' : ''
                                    }`}
                                >
                                    {label}
                                    {sortable && sortConfig.key === key && (
                                        sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentItems.map((item, index) => (
                            <tr
                                key={index}
                                onClick={() => onRowClick && onRowClick(item)}
                                className="hover:bg-gray-50 hover:cursor-pointer transition"
                            >
                                {columns.map(({ key, render }) => (
                                    <td key={key} className="p-2 md:p-4">
                                        {render ? render(item) : item[key]}
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
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center">
                <div>
                    Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} item
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="btn-primary-outline"
                    >
                        Sebelumnya
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="btn-primary-outline"
                    >
                        Berikutnya
                    </button>
                </div>
            </div>
        </>
    );
};

export default DataTable;
