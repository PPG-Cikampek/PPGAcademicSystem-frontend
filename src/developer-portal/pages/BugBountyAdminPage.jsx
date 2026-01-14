import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PortalHeader } from "../components";
import BugReportDetail from "../components/BugReportDetail";
import StatusBadge from "../components/StatusBadge";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import ServerDataTable from "../../shared/Components/UIElements/ServerDataTable";
import {
    useBugReports,
    useBugReport,
    useBugReportMetrics,
    useUpdateBugReportStatus,
    useAddBugReportUpdate,
} from "../hooks/useBugReports";
import { STATUS_LABELS, SEVERITY_LABELS } from "../utilities/bugReportValidation";

const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
}));

const severityOptions = Object.entries(SEVERITY_LABELS).map(([value, label]) => ({
    value,
    label,
}));

const FILTER_OPTIONS = [
    { key: "status", label: "Status", options: statusOptions },
    { key: "severity", label: "Keparahan", options: severityOptions },
];

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const BugBountyAdminPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedReportId = searchParams.get("reportId");

    const [filters, setFilters] = useState({
        status: "",
        severity: "",
        search: "",
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortDir: "desc",
    });

    const { data: reportsData, isLoading, isFetching, error, refetch } = useBugReports(filters);

    const { data: metricsData, isLoading: isLoadingMetrics } = useBugReportMetrics();

    const { data: selectedReportData, isLoading: isLoadingReport } =
        useBugReport(selectedReportId);

    const statusMutation = useUpdateBugReportStatus();
    const updateMutation = useAddBugReportUpdate();

    const reports = reportsData?.bugReports || [];
    const totalReports = reportsData?.total || 0;
    const tableIsLoading = isLoading || isFetching;
    const selectedReport = selectedReportData?.bugReport;

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

    const handleFiltersChange = (nextFilters = {}) => {
        if (Object.keys(nextFilters).length === 0) {
            setFilters((prev) => ({
                ...prev,
                status: "",
                severity: "",
                page: 1,
            }));
            return;
        }

        setFilters((prev) => ({
            ...prev,
            status: nextFilters.status ?? prev.status,
            severity: nextFilters.severity ?? prev.severity,
            page: 1,
        }));
    };

    const handlePageChange = (nextPage) => {
        setFilters((prev) => ({
            ...prev,
            page: nextPage,
        }));
    };

    const handlePageSizeChange = (size) => {
        setFilters((prev) => ({
            ...prev,
            limit: size,
            page: 1,
        }));
    };

    const handleSearchChange = (value) => {
        setFilters((prev) => ({
            ...prev,
            search: value,
            page: 1,
        }));
    };

    const handleSortChange = (nextSort) => {
        setFilters((prev) => ({
            ...prev,
            sortBy: nextSort.key,
            sortDir: nextSort.direction,
            page: 1,
        }));
    };

    const tableFilters = {
        status: filters.status,
        severity: filters.severity,
    };

    const emptyMessage =
        filters.search || filters.status || filters.severity
            ? "Tidak ada laporan yang sesuai dengan filter."
            : "Tidak ada laporan bug.";

    const columns = [
        {
            key: "reportId",
            label: "ID Laporan",
            sortable: true,
            render: (report) => (
                <span className="font-mono text-gray-500 text-xs">{report.reportId}</span>
            ),
        },
        {
            key: "title",
            label: "Judul",
            sortable: true,
            render: (report) => (
                <span className="font-medium text-gray-900 line-clamp-1">{report.title}</span>
            ),
        },
        {
            key: "severity",
            label: "Keparahan",
            sortable: true,
            cellAlign: "center",
            render: (report) => <StatusBadge type="severity" value={report.severity} />,
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            cellAlign: "center",
            render: (report) => <StatusBadge type="status" value={report.status} />,
        },
        {
            key: "reporter",
            label: "Pelapor",
            render: (report) => (
                <span className="text-gray-700 text-sm">
                    {report.reporterName || report.userId?.name || "Anonim"}
                </span>
            ),
        },
        {
            key: "pointsAwarded",
            label: "Poin",
            cellAlign: "center",
            render: (report) => (report.pointsAwarded > 0 ? `+${report.pointsAwarded}` : "-"),
        },
        {
            key: "createdAt",
            label: "Tanggal",
            sortable: true,
            render: (report) => formatDate(report.createdAt),
        },
        {
            key: "actions",
            label: "Aksi",
            headerAlign: "center",
            cellAlign: "center",
            render: (report) => (
                <button
                    onClick={(event) => {
                        event.stopPropagation();
                        handleReportClick(report);
                    }}
                    className="btn-primary-outline text-xs btn-mobile-primary"
                >
                    Detail
                </button>
            ),
        },
    ];

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="space-y-6 mx-auto max-w-7xl">
                <PortalHeader
                    title="Manajemen Bug Bounty"
                    description="Kelola laporan bug dari pengguna dan berikan poin kontribusi."
                />

                {!isLoadingMetrics && (
                    <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Total</p>
                            <p className="font-bold text-gray-900 text-2xl">
                                {metricsData?.metrics?.total || 0}
                            </p>
                        </div>
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Menunggu</p>
                            <p className="font-bold text-blue-600 text-2xl">
                                {metricsData?.metrics?.pending || 0}
                            </p>
                        </div>
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Ditinjau</p>
                            <p className="font-bold text-purple-600 text-2xl">
                                {metricsData?.metrics?.reviewing || 0}
                            </p>
                        </div>
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Diterima</p>
                            <p className="font-bold text-green-600 text-2xl">
                                {metricsData?.metrics?.accepted || 0}
                            </p>
                        </div>
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Diperbaiki</p>
                            <p className="font-bold text-teal-600 text-2xl">
                                {metricsData?.metrics?.fixed || 0}
                            </p>
                        </div>
                        <div className="bg-white shadow-sm p-4 rounded-lg">
                            <p className="text-gray-500 text-sm">Poin Diberikan</p>
                            <p className="font-bold text-primary text-2xl">
                                {metricsData?.metrics?.totalPointsIssued || 0}
                            </p>
                        </div>
                    </div>
                )}

                {error && <ErrorCard error={error} onClear={refetch} />}
                <ServerDataTable
                    data={reports}
                    columns={columns}
                    total={totalReports}
                    page={filters.page}
                    pageSize={filters.limit}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    search={filters.search}
                    onSearchChange={handleSearchChange}
                    filters={tableFilters}
                    onFiltersChange={handleFiltersChange}
                    filterOptions={FILTER_OPTIONS}
                    sort={{ key: filters.sortBy, direction: filters.sortDir }}
                    onSortChange={handleSortChange}
                    isLoading={tableIsLoading}
                    emptyMessage={emptyMessage}
                    onRowClick={(item) => handleReportClick(item)}
                    tableId="bugReports-admin-table"
                />

                {selectedReportId && (
                    <div className="z-50 fixed inset-0 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-black/20"
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
                                        isUpdating={
                                            statusMutation.isPending || updateMutation.isPending
                                        }
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
