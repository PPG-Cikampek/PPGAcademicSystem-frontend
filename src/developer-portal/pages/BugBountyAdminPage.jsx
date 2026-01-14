import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PortalHeader, EmptyState } from "../components";
import BugReportCard from "../components/BugReportCard";
import BugReportDetail from "../components/BugReportDetail";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import {
    useBugReports,
    useBugReport,
    useBugReportMetrics,
    useUpdateBugReportStatus,
    useAddBugReportUpdate
} from "../hooks/useBugReports";
import { STATUS_LABELS, SEVERITY_LABELS } from "../utilities/bugReportValidation";

/**
 * BugBountyAdminPage Component
 * Admin management dashboard for Bug Bounty feature
 */
const BugBountyAdminPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedReportId = searchParams.get("reportId");

    // Filter state
    const [filters, setFilters] = useState({
        status: "",
        severity: "",
        search: "",
        page: 1,
        limit: 20
    });

    // Queries
    const {
        data: reportsData,
        isLoading,
        error,
        refetch
    } = useBugReports(filters);

    const {
        data: metricsData,
        isLoading: isLoadingMetrics
    } = useBugReportMetrics();

    const {
        data: selectedReportData,
        isLoading: isLoadingReport
    } = useBugReport(selectedReportId);

    // Mutations
    const statusMutation = useUpdateBugReportStatus();
    const updateMutation = useAddBugReportUpdate();

    const reports = reportsData?.bugReports || [];
    const metrics = metricsData?.metrics || {};
    const selectedReport = selectedReportData?.bugReport;
    const pagination = {
        page: reportsData?.page || 1,
        totalPages: reportsData?.totalPages || 1,
        total: reportsData?.total || 0,
        hasNext: reportsData?.hasNext || false,
        hasPrev: reportsData?.hasPrev || false
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filter changes
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage
        }));
    };

    const handleReportClick = (report) => {
        setSearchParams({ reportId: report.reportId });
    };

    const handleCloseDetail = () => {
        setSearchParams({});
    };

    const handleStatusChange = async (payload) => {
        try {
            await statusMutation.mutateAsync(payload);
            refetch();
        } catch (err) {
            console.error("Failed to update status:", err);
            alert(err.response?.data?.message || "Gagal mengubah status");
        }
    };

    const handleAddUpdate = async (payload) => {
        try {
            await updateMutation.mutateAsync(payload);
        } catch (err) {
            console.error("Failed to add update:", err);
            alert(err.response?.data?.message || "Gagal menambahkan update");
        }
    };

    const statuses = ["", "pending", "reviewing", "accepted", "rejected", "fixed"];
    const severities = ["", "low", "medium", "high", "critical"];

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-7xl">
                <PortalHeader
                    title="Manajemen Bug Bounty"
                    description="Kelola laporan bug dari pengguna dan berikan poin kontribusi."
                />

                {/* Metrics Cards */}
                {!isLoadingMetrics && (
                    <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6">
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Total</p>
                            <p className="font-bold text-gray-900 text-2xl">{metrics.total || 0}</p>
                        </div>
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Menunggu</p>
                            <p className="font-bold text-blue-600 text-2xl">{metrics.pending || 0}</p>
                        </div>
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Ditinjau</p>
                            <p className="font-bold text-purple-600 text-2xl">{metrics.reviewing || 0}</p>
                        </div>
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Diterima</p>
                            <p className="font-bold text-green-600 text-2xl">{metrics.accepted || 0}</p>
                        </div>
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Diperbaiki</p>
                            <p className="font-bold text-teal-600 text-2xl">{metrics.fixed || 0}</p>
                        </div>
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Poin Diberikan</p>
                            <p className="font-bold text-indigo-600 text-2xl">{metrics.totalPointsIssued || 0}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white shadow-sm mb-6 p-4 rounded-lg">
                    <div className="gap-4 grid grid-cols-1 md:grid-cols-4">
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Cari
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange("search", e.target.value)}
                                placeholder="ID, judul, atau deskripsi..."
                                className="px-3 py-2 border border-gray-200 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full text-sm"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                                className="px-3 py-2 border border-gray-200 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full text-sm"
                            >
                                <option value="">Semua Status</option>
                                {statuses.slice(1).map((status) => (
                                    <option key={status} value={status}>
                                        {STATUS_LABELS[status]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium text-gray-700 text-sm">
                                Keparahan
                            </label>
                            <select
                                value={filters.severity}
                                onChange={(e) => handleFilterChange("severity", e.target.value)}
                                className="px-3 py-2 border border-gray-200 focus:border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full text-sm"
                            >
                                <option value="">Semua Tingkat</option>
                                {severities.slice(1).map((severity) => (
                                    <option key={severity} value={severity}>
                                        {SEVERITY_LABELS[severity]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({ status: "", severity: "", search: "", page: 1, limit: 20 })}
                                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md w-full text-gray-600 text-sm transition-colors"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reports List */}
                <div className="bg-white shadow-sm p-6 rounded-lg">
                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <LoadingCircle size={32} />
                        </div>
                    )}

                    {error && (
                        <ErrorCard
                            error={error}
                            onClear={refetch}
                        />
                    )}

                    {!isLoading && !error && reports.length === 0 && (
                        <EmptyState
                            message="Tidak ada laporan bug yang sesuai dengan filter."
                        />
                    )}

                    {!isLoading && !error && reports.length > 0 && (
                        <>
                            <div className="mb-4 text-gray-500 text-sm">
                                Menampilkan {reports.length} dari {pagination.total} laporan
                            </div>
                            <div className="space-y-2">
                                {reports.map((report) => (
                                    <BugReportCard
                                        key={report.reportId}
                                        report={report}
                                        onClick={handleReportClick}
                                        isAdmin={true}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-6 pt-6 border-gray-200 border-t">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={!pagination.hasPrev}
                                        className="hover:bg-gray-50 disabled:opacity-50 px-3 py-1 border border-gray-300 rounded-md text-sm disabled:cursor-not-allowed"
                                    >
                                        Sebelumnya
                                    </button>
                                    <span className="text-gray-600 text-sm">
                                        Halaman {pagination.page} dari {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={!pagination.hasNext}
                                        className="hover:bg-gray-50 disabled:opacity-50 px-3 py-1 border border-gray-300 rounded-md text-sm disabled:cursor-not-allowed"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Report Detail Drawer/Modal */}
                {selectedReportId && (
                    <div className="z-50 fixed inset-0 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-black bg-opacity-50"
                            onClick={handleCloseDetail}
                        />
                        <div className="right-0 absolute inset-y-0 bg-white shadow-xl w-full max-w-2xl">
                            <div className="p-6 h-full overflow-y-auto">
                                {isLoadingReport ? (
                                    <div className="flex justify-center py-12">
                                        <LoadingCircle size={32} />
                                    </div>
                                ) : selectedReport ? (
                                    <BugReportDetail
                                        report={selectedReport}
                                        isAdmin={true}
                                        onStatusChange={handleStatusChange}
                                        onAddUpdate={handleAddUpdate}
                                        onClose={handleCloseDetail}
                                        isUpdating={statusMutation.isPending || updateMutation.isPending}
                                    />
                                ) : (
                                    <div className="py-12 text-center">
                                        <p className="text-gray-500">Laporan tidak ditemukan</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BugBountyAdminPage;
