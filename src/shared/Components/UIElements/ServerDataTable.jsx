import { Filter } from "lucide-react";
import { useMemo, useState } from "react";

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
}) => {
    const [showFilters, setShowFilters] = useState(false);

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
                                className="bg-white shadow-xs px-2 py-1 border rounded-[4px] focus:outline-hidden hover:ring-1 hover:ring-primary focus:ring-2 focus:ring-primary transition-all duration-300"
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
                                {columns.map((_, index) => (
                                    <th key={index} className="p-2 md:p-4 min-w-14">
                                        <div className="bg-gray-200 rounded-sm w-20 h-4 animate-pulse"></div>
                                    </th>
                                ))}
                            </tr>
                        ) : (
                            <tr>
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
                                    colSpan={columns.length}
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
                                    } transition-all duration-300 ease-in-out`}
                                >
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
