import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PortalHeader } from "../components";
import BugReportForm from "../components/BugReportForm";
import BugReportDetail from "../components/BugReportDetail";
import LeaderboardTable from "../components/LeaderboardTable";
import StatusBadge from "../components/StatusBadge";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import ServerDataTable from "../../shared/Components/UIElements/ServerDataTable";
import {
    useBugReports,
    useBugReport,
    useCreateBugReport,
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

const DEFAULT_SORT = { key: "createdAt", direction: "desc" };

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const BugBountyPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "leaderboard";
    const selectedReportId = searchParams.get("reportId");
    const isPublicTab = activeTab === "all";

    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const currentUserId = userData.userId;

    const [filters, setFilters] = useState({ status: "", severity: "" });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState(DEFAULT_SORT);

    const reportQueryFilters = useMemo(() => {
        return {
            page,
            limit: pageSize,
            sortBy: sort.key,
            sortDir: sort.direction,
            ...(isPublicTab ? { scope: "public" } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.severity ? { severity: filters.severity } : {}),
            ...(search ? { search } : {}),
        };
    }, [
        isPublicTab,
        page,
        pageSize,
        sort.key,
        sort.direction,
        filters.status,
        filters.severity,
        search,
    ]);

    const {
        data: reportsData,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useBugReports(reportQueryFilters);

    const { data: selectedReportData, isLoading: isLoadingReport } = useBugReport(
        selectedReportId,
        {
            scope: isPublicTab ? "public" : undefined,
        }
    );

    const createMutation = useCreateBugReport();
    const statusMutation = useUpdateBugReportStatus();
    const updateMutation = useAddBugReportUpdate();

    const reports = reportsData?.bugReports || [];
    const totalReports = reportsData?.total || reports.length || 0;
    const tableIsLoading = isLoading || isFetching;

    const selectedReport = selectedReportData?.bugReport;
    const listTabActive = activeTab === "submissions" || isPublicTab;
    const emptyListMessage =
        search || filters.status || filters.severity
            ? "Tidak ditemukan hasil untuk pencarian atau filter yang dipilih."
            : "Belum ada laporan bug.";

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
    };

    const handleReportClick = (report) => {
        setSearchParams({ tab: activeTab, reportId: report.reportId });
    };

    const handleCloseDetail = () => {
        setSearchParams({ tab: activeTab });
    };

    const handleFiltersChange = (nextFilters = {}) => {
        if (Object.keys(nextFilters).length === 0) {
            setFilters({ status: "", severity: "" });
            setPage(1);
            return;
        }

        setFilters({
            status: nextFilters.status ?? "",
            severity: nextFilters.severity ?? "",
        });
        setPage(1);
    };

    const handleSortChange = (nextSort) => {
        setSort(nextSort);
        setPage(1);
    };

    const handleSubmit = async (formData) => {
        try {
            await createMutation.mutateAsync(formData);
            setSearchParams({ tab: "submissions" });
            refetch();
        } catch (err) {
            console.error("Failed to submit bug report:", err);
            alert(err.response?.data?.message || "Gagal mengirim laporan bug");
        }
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
            key: "createdAt",
            label: "Dilaporkan",
            sortable: true,
            render: (report) => formatDate(report.createdAt),
        },
        {
            key: "pointsAwarded",
            label: "Poin",
            cellAlign: "center",
            render: (report) => (report.pointsAwarded > 0 ? `+${report.pointsAwarded}` : "-"),
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
            <div className="mx-auto max-w-6xl">
                <PortalHeader
                    title="Laporan Temuan Bug"
                    description="Laporkan bug yang Anda temukan dan dapatkan poin kontribusi. Poin akan diberikan ketika bug berhasil diperbaiki."
                />

                <div className="mb-6 border-gray-200 border-b">
                    <nav className="flex space-x-8 -mb-px">
                        {[
                            { id: "leaderboard", label: "Leaderboard" },
                            { id: "all", label: "Semua Laporan" },
                            { id: "submissions", label: "Laporan Saya" },
                            { id: "submit", label: "Buat Laporan Baru" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? "border-indigo-500 text-indigo-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {listTabActive && (
                    <>
                        {error && <ErrorCard error={error} onClear={refetch} />}
                        <ServerDataTable
                            data={reports}
                            columns={columns}
                            total={totalReports}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={(nextPage) => setPage(nextPage)}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setPage(1);
                            }}
                            search={search}
                            onSearchChange={(value) => {
                                setSearch(value);
                                setPage(1);
                            }}
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                            filterOptions={FILTER_OPTIONS}
                            sort={sort}
                            onSortChange={handleSortChange}
                            isLoading={tableIsLoading}
                            emptyMessage={emptyListMessage}
                            onRowClick={(item) => handleReportClick(item)}
                            tableId="bugReports-table"
                        />
                    </>
                )}

                {activeTab === "submit" && (
                    <BugReportForm
                        onSubmit={handleSubmit}
                        onCancel={() => handleTabChange("submissions")}
                        isSubmitting={createMutation.isPending}
                    />
                )}

                {activeTab === "leaderboard" && (
                    <LeaderboardTable currentUserId={currentUserId} />
                )}

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
                                        isAdmin={false}
                                        onClose={handleCloseDetail}
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

export default BugBountyPage;
