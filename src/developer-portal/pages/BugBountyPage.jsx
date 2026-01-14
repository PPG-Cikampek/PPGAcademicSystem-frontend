import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PortalHeader, EmptyState } from "../components";
import BugReportForm from "../components/BugReportForm";
import BugReportCard from "../components/BugReportCard";
import BugReportDetail from "../components/BugReportDetail";
import LeaderboardTable from "../components/LeaderboardTable";
import LoadingCircle from "../../shared/Components/UIElements/LoadingCircle";
import ErrorCard from "../../shared/Components/UIElements/ErrorCard";
import {
    useBugReports,
    useBugReport,
    useCreateBugReport,
    useUpdateBugReportStatus,
    useAddBugReportUpdate
} from "../hooks/useBugReports";

/**
 * BugBountyPage Component
 * Main user-facing page with tabs for Bug Bounty feature
 */
const BugBountyPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "leaderboard";
    const selectedReportId = searchParams.get("reportId");
    const isPublicTab = activeTab === "all";

    // Get current user ID from localStorage
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const currentUserId = userData.userId;

    // State
    const [showForm, setShowForm] = useState(false);

    // Queries
    const reportQueryFilters = useMemo(() => {
        if (isPublicTab) {
            return { page: 1, limit: 50, scope: "public" };
        }
        return { page: 1, limit: 50 };
    }, [isPublicTab]);

    const reportDetailFilters = useMemo(() => {
        return isPublicTab ? { scope: "public" } : {};
    }, [isPublicTab]);

    const {
        data: reportsData,
        isLoading,
        error,
        refetch
    } = useBugReports(reportQueryFilters);

    const {
        data: selectedReportData,
        isLoading: isLoadingReport
    } = useBugReport(selectedReportId, reportDetailFilters);

    // Mutations
    const createMutation = useCreateBugReport();
    const statusMutation = useUpdateBugReportStatus();
    const updateMutation = useAddBugReportUpdate();

    const reports = reportsData?.bugReports || [];
    const selectedReport = selectedReportData?.bugReport;
    const listTabActive = activeTab === "submissions" || isPublicTab;
    const emptyStateMessage = isPublicTab
        ? "Belum ada bounty yang dipublikasikan. Coba lagi nanti!"
        : "Anda belum memiliki laporan bug. Mulai laporkan bug untuk berkontribusi!";

    const tabs = [
        { id: "leaderboard", label: "Leaderboard" },
        { id: "all", label: "Semua Laporan" },
        { id: "submissions", label: "Laporan Saya" },
        { id: "submit", label: "Kirim Laporan" }
    ];

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
        setShowForm(tabId === "submit");
    };

    const handleReportClick = (report) => {
        setSearchParams({ tab: activeTab, reportId: report.reportId });
    };

    const handleCloseDetail = () => {
        setSearchParams({ tab: activeTab });
    };

    const handleSubmit = async (formData) => {
        try {
            await createMutation.mutateAsync(formData);
            setShowForm(false);
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

    // Show form when tab is "submit"
    useEffect(() => {
        setShowForm(activeTab === "submit");
    }, [activeTab]);

    return (
        <div className="bg-gray-50 md:p-8 px-4 py-8 min-h-screen">
            <div className="mx-auto max-w-5xl">
                <PortalHeader
                    title="Bug Bounty Program"
                    description="Laporkan bug yang Anda temukan dan dapatkan poin kontribusi. Poin akan diberikan ketika bug berhasil diperbaiki."
                />

                {/* Tabs */}
                <div className="mb-6 border-gray-200 border-b">
                    <nav className="flex space-x-8 -mb-px">
                        {tabs.map((tab) => (
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

                {/* Tab Content */}
                <div className="bg-white shadow-sm p-6 rounded-lg">
                    {/* Public/Public submissions List */}
                    {listTabActive && (
                        <>
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
                                    message={emptyStateMessage}
                                />
                            )}

                            {!isLoading && !error && reports.length > 0 && (
                                <div className="space-y-2">
                                    {reports.map((report) => (
                                        <BugReportCard
                                            key={report.reportId}
                                            report={report}
                                            onClick={handleReportClick}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Submit Tab */}
                    {activeTab === "submit" && (
                        <BugReportForm
                            onSubmit={handleSubmit}
                            onCancel={() => handleTabChange("submissions")}
                            isSubmitting={createMutation.isPending}
                        />
                    )}

                    {/* Leaderboard Tab */}
                    {activeTab === "leaderboard" && (
                        <LeaderboardTable currentUserId={currentUserId} />
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
