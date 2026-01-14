import { useState } from "react";
import { useLeaderboard } from "../hooks/useBugReports";

/**
 * LeaderboardTable Component
 * Displays user contribution points ranking
 */
const LeaderboardTable = ({ currentUserId }) => {
    const [period, setPeriod] = useState("all");
    const { data, isLoading, error, refetch } = useLeaderboard(period);

    const periodOptions = [
        { value: "week", label: "Minggu Ini" },
        { value: "month", label: "Bulan Ini" },
        { value: "all", label: "Semua Waktu" }
    ];

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12 text-center">
                <p className="mb-4 text-red-500">Gagal memuat leaderboard</p>
                <button
                    onClick={() => refetch()}
                    className="font-medium text-primary hover:text-indigo-800"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    const leaderboard = data?.leaderboard || [];

    return (
        <div className="space-y-4">
            {/* Period Filter */}
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Peringkat</h3>
                <div className="flex gap-2">
                    {periodOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setPeriod(option.value)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                period === option.value
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard Table */}
            {leaderboard.length === 0 ? (
                <div className="bg-gray-50 py-12 rounded-lg text-center">
                    <svg
                        className="mx-auto mb-4 w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-gray-500">
                        Belum ada kontributor untuk periode ini
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="divide-y divide-gray-200 min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-4 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                                    Pengguna
                                </th>
                                <th className="px-4 py-3 font-medium text-gray-500 text-xs text-center uppercase tracking-wider">
                                    Total Poin
                                </th>
                                <th className="px-4 py-3 font-medium text-gray-500 text-xs text-center uppercase tracking-wider">
                                    Total Laporan
                                </th>
                                <th className="px-4 py-3 font-medium text-gray-500 text-xs text-center uppercase tracking-wider">
                                    Total Laporan Diterima
                                </th>
                                <th className="hidden md:table-cell px-4 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                                    Kontribusi Terakhir
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaderboard.map((entry) => {
                                const isCurrentUser = entry.userId?.toString() === currentUserId;
                                
                                return (
                                    <tr
                                        key={entry.userId}
                                        className={`${
                                            isCurrentUser
                                                ? "bg-indigo-50"
                                                : "hover:bg-gray-50"
                                        } transition-colors`}
                                    >
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                                    entry.rank === 1
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : entry.rank === 2
                                                        ? "bg-gray-200 text-gray-800"
                                                        : entry.rank === 3
                                                        ? "bg-orange-100 text-orange-800"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {entry.rank}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {entry.userImage ? (
                                                    <img
                                                        className="mr-3 rounded-full w-8 h-8"
                                                        src={entry.userImage}
                                                        alt={entry.userName}
                                                    />
                                                ) : (
                                                    <div className="flex justify-center items-center bg-indigo-100 mr-3 rounded-full w-8 h-8">
                                                        <span className="font-medium text-primary text-sm">
                                                            {entry.userName?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900 text-sm">
                                                        {entry.userName}
                                                        {isCurrentUser && (
                                                            <span className="ml-2 text-primary text-xs">
                                                                (Anda)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center whitespace-nowrap">
                                            <span className="inline-flex items-center bg-green-100 px-2.5 py-0.5 rounded-full font-medium text-green-800 text-sm">
                                                {entry.totalPoints}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 text-sm text-center whitespace-nowrap">
                                            {entry.totalSubmitted || 0}
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 text-sm text-center whitespace-nowrap">
                                            {entry.acceptanceRate}%
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-4 text-gray-500 text-sm whitespace-nowrap">
                                            {formatDate(entry.lastContribution)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LeaderboardTable;
