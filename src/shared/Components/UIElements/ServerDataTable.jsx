import { Filter, Check } from "lucide-react";
import { useMemo, useState, useCallback } from "react";

const ServerDataTable = ({
    data = [],
    columns = [],
    total = 0,
    page = 1,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    search = "",
    onSearchChange,
    filters = {},
    onFiltersChange,
    filterOptions = [],
    sort = { key: null, direction: "desc" },
    onSortChange,
    isLoading = false,
    onRowClick,
    tableId,
    showSearch = true,
    showFilter = true,
    entriesOptions = [5, 10, 20, 50, 100],
    pagination = true,
    clickableRows = true,
    emptyMessage = "Tidak ada data",
    loadingRows = 5,
    topRightSlot = null,
    // New props for checkbox selection
    selectable = false,
    selectedRows = [],
    onSelectionChange,
    rowIdKey = "_id",
}) => {
    const [showFilters, setShowFilters] = useState(false);

    // Get unique row identifier
    const getRowId = useCallback((item) => item[rowIdKey] || item.id, [rowIdKey]);

    // Check if all visible rows are selected
    const allSelected = useMemo(() => {
        if (!selectable || data.length === 0) return false;
        return data.every((item) => selectedRows.includes(getRowId(item)));
    }, [selectable, data, selectedRows, getRowId]);

    // Check if some but not all rows are selected (indeterminate state)
    const someSelected = useMemo(() => {
        if (!selectable || data.length === 0) return false;
        const selectedCount = data.filter((item) => selectedRows.includes(getRowId(item))).length;
        return selectedCount > 0 && selectedCount < data.length;
    }, [selectable, data, selectedRows, getRowId]);

    // Handle select all toggle
    const handleSelectAll = useCallback(() => {
        if (!onSelectionChange) return;
        if (allSelected) {
            // Deselect all visible rows
            const visibleIds = data.map(getRowId);
            onSelectionChange(selectedRows.filter((id) => !visibleIds.includes(id)));
        } else {
            // Select all visible rows
            const visibleIds = data.map(getRowId);
            const newSelection = [...new Set([...selectedRows, ...visibleIds])];
            onSelectionChange(newSelection);
        }
    }, [allSelected, data, selectedRows, onSelectionChange, getRowId]);

    // Handle individual row selection
    const handleRowSelect = useCallback((item, e) => {
        e.stopPropagation();
        if (!onSelectionChange) return;
        const id = getRowId(item);
        if (selectedRows.includes(id)) {
            onSelectionChange(selectedRows.filter((rowId) => rowId !== id));
        } else {
            onSelectionChange([...selectedRows, id]);
        }
    }, [selectedRows, onSelectionChange, getRowId]);

    const totalPages = useMemo(() => {
        if (!pagination) return 1;
        const pages = Math.ceil(total / pageSize);
        return pages > 0 ? pages : 1;
    }, [pagination, total, pageSize]);

    const handleSort = (key) => {
        if (!onSortChange) return;
        let direction = "asc";
        if (sort.key === key && sort.direction === "asc") direction = "desc";
        onSortChange({ key, direction });
    };

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            {selectable && (
                <td className="p-2 md:p-4 w-10">
                    <div className="bg-gray-200 rounded-sm w-4 h-4"></div>
                </td>
            )}
            {columns.map((_, idx) => (
                <td key={idx} className="p-2 md:p-4">
                    <div className="bg-gray-200 rounded-sm h-4"></div>
                </td>
            ))}
        </tr>
    );

    const renderFilters = () => (
        <div
            className={`w-full my-2 overflow-hidden transition-all duration-300 ${
                showFilters ? "max-h-96" : "max-h-0"
            }`}
        >
            <div className="flex-col m-0 p-4 border rounded-md card-basic">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-normal text-base">Filter Data</h3>
                    <button
                        onClick={() => onFiltersChange && onFiltersChange({})}
                        className="btn-danger-outline"
                    >
                        Reset
                    </button>
                </div>
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {filterOptions.map(({ key, label, options }) => (
                        <div key={key}>
                            <label className="mb-1 font-medium text-gray-700 text-sm">
                                {label}
                            </label>
                            <select
                                className="px-2 py-2 border rounded-full focus:outline-hidden focus:ring-1 focus:ring-primary w-full text-sm"
                                value={filters?.[key] || ""}
                                onChange={(e) =>
                                    onFiltersChange &&
                                    onFiltersChange({
                                        ...filters,
                                        [key]: e.target.value || undefined,
                                    })
                                }
                            >
                                <option value="">Semua</option>
                                {options.map((option) => {
                                    const value =
                                        typeof option === "string"
                                            ? option
                                            : option.value;
                                    const labelText =
                                        typeof option === "string"
                                            ? option
                                            : option.label;
                                    return (
                                        <option key={value} value={value}>
                                            {labelText}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div data-table-id={tableId} className="space-y-2">
            <div className="flex md:flex-row flex-col flex-wrap md:justify-between gap-2">
                {pagination && (
                    <div className="flex items-center gap-2">
                        <span>Tampilkan</span>
                        <select
                            className="px-2 py-1 border rounded-sm"
                            value={pageSize}
                            onChange={(e) =>
                                onPageSizeChange &&
                                onPageSizeChange(Number(e.target.value) || 10)
                            }
                        >
                            {entriesOptions.map((value) => (
                                <option key={value} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        <span>item</span>
                    </div>
                )}
                <div className="flex md:flex-row flex-col items-start md:items-center gap-2 w-full md:w-auto">
                    {showSearch && (
                        <div className="flex items-center gap-2">
                            <span>Pencarian:</span>
                            <input
                                type="text"
                                className="bg-white shadow-xs px-2 py-1 border rounded-sm focus:outline-hidden hover:ring-1 hover:ring-primary focus:ring-2 focus:ring-primary transition-all duration-300"
                                value={search}
                                onChange={(e) =>
                                    onSearchChange && onSearchChange(e.target.value)
                                }
                            />
                        </div>
                    )}
                    {showFilter && filterOptions.length > 0 && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-1 m-0 btn-mobile-primary"
                        >
                            <Filter size={16} />
                            Filter
                        </button>
                    )}
                    {topRightSlot}
                </div>
            </div>
            {showFilter && filterOptions.length > 0 && renderFilters()}

            <div className="bg-white shadow-xs rounded-md overflow-auto text-nowrap">
                <table className="rounded-md w-full">
                    <thead className="border-b">
                        {isLoading ? (
                            <tr>
                                {selectable && (
                                    <th className="p-2 md:p-4 w-10">
                                        <div className="bg-gray-200 rounded-sm w-4 h-4 animate-pulse"></div>
                                    </th>
                                )}
                                {columns.map((_, index) => (
                                    <th key={index} className="p-2 md:p-4 min-w-14">
                                        <div className="bg-gray-200 rounded-sm w-20 h-4 animate-pulse"></div>
                                    </th>
                                ))}
                            </tr>
                        ) : (
                            <tr>
                                {selectable && (
                                    <th className="p-2 md:p-4 w-10 text-center">
                                        <div className="flex justify-center items-center">
                                            <label className="relative flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    ref={(el) => {
                                                        if (el) el.indeterminate = someSelected;
                                                    }}
                                                    onChange={handleSelectAll}
                                                    className="peer checked:bg-primary shadow-sm hover:shadow-md border border-slate-300 checked:border-primary rounded-sm w-4 h-4 transition-all appearance-none cursor-pointer"
                                                />
                                                <span className="top-1/2 left-1/2 absolute opacity-0 peer-checked:opacity-100 text-white -translate-x-1/2 -translate-y-1/2 transform">
                                                    <Check size={12} />
                                                </span>
                                            </label>
                                        </div>
                                    </th>
                                )}
                                {columns.map(({ key, label, sortable, headerAlign }) => (
                                    <th
                                        key={key}
                                        onClick={() => sortable && handleSort(key)}
                                        className={`min-w-14 p-2 md:p-4 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                            sortable ? "cursor-pointer hover:bg-gray-50" : ""
                                        } ${
                                            headerAlign === "center"
                                                ? "text-center"
                                                : headerAlign === "right"
                                                ? "text-right"
                                                : "text-left"
                                        }`}
                                    >
                                        {label}
                                        {sortable && sort.key === key &&
                                            (sort.direction === "asc" ? " ↑" : " ↓")}
                                    </th>
                                ))}
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isLoading ? (
                            Array.from({ length: loadingRows }).map((_, idx) => (
                                <SkeletonRow key={idx} />
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={selectable ? columns.length + 1 : columns.length}
                                    className="p-4 text-gray-500 text-center italic"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={item.id || item._id || index}
                                    onClick={() => clickableRows && onRowClick && onRowClick(item)}
                                    className={`${
                                        clickableRows
                                            ? "hover:bg-gray-50 hover:cursor-pointer"
                                            : ""
                                    } ${
                                        selectable && selectedRows.includes(getRowId(item))
                                            ? "bg-blue-50"
                                            : ""
                                    } transition-all duration-300 ease-in-out`}
                                >
                                    {selectable && (
                                        <td 
                                            className="p-2 md:p-4 w-10 text-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex justify-center items-center">
                                                <label className="relative flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(getRowId(item))}
                                                        onChange={(e) => handleRowSelect(item, e)}
                                                        className="peer checked:bg-primary shadow-sm hover:shadow-md border border-slate-300 checked:border-primary rounded-sm w-4 h-4 transition-all appearance-none cursor-pointer"
                                                    />
                                                    <span className="top-1/2 left-1/2 absolute opacity-0 peer-checked:opacity-100 text-white -translate-x-1/2 -translate-y-1/2 transform">
                                                        <Check size={12} />
                                                    </span>
                                                </label>
                                            </div>
                                        </td>
                                    )}
                                    {columns.map(({ key, render, cellStyle, cellAlign }) => (
                                        <td
                                            key={key}
                                            className={`${
                                                key === "actions" ? "p-1" : "p-2 md:p-4"
                                            } ${
                                                cellAlign === "center"
                                                    ? "text-center"
                                                    : cellAlign === "right"
                                                    ? "text-right"
                                                    : "text-left"
                                            }`}
                                        >
                                            <span className={cellStyle?.(item)}>
                                                {render ? render(item) : item[key]}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="flex justify-between items-center">
                    <div>
                        {total === 0
                            ? "Menampilkan 0 - 0 dari 0 item"
                            : `Menampilkan ${(page - 1) * pageSize + 1} - ${Math.min(
                                  page * pageSize,
                                  total
                              )} dari ${total} item`}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange && onPageChange(Math.max(page - 1, 1))}
                            disabled={page === 1 || total === 0}
                            className="btn-primary-outline"
                        >
                            Sebelumnya
                        </button>
                        <button
                            onClick={() =>
                                onPageChange && onPageChange(Math.min(page + 1, totalPages))
                            }
                            disabled={page >= totalPages || total === 0}
                            className="btn-primary-outline"
                        >
                            Berikutnya
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServerDataTable;
