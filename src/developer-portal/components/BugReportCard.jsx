import { useContext } from "react";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import StatusBadge from "./StatusBadge";

/**
 * BugReportCard Component
 * Display card for bug report in lists
 * Similar to FeatureCard.jsx pattern
 */
const BugReportCard = ({ report, onClick, isAdmin = false })  => {

    const auth = useContext(AuthContext);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div
            onClick={() => onClick?.(report)}
            className="hover:bg-gray-50 -mx-4 p-4 pb-4 last:pb-0 border-gray-200 last:border-0 border-b rounded-lg transition-colors cursor-pointer"
        >
            {/* Header: Report ID and Status */}
            <div className="flex justify-between items-start gap-4 mb-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-500 text-xs">
                    {report.reportId}
                </span>
                <div className="flex flex-wrap justify-end gap-2">
                    <StatusBadge type="severity" value={report.severity} />
                    <StatusBadge type="status" value={report.status} />
                </div>
            </div>

            {/* Title */}
            <h4 className="mb-2 font-medium text-gray-900 line-clamp-1">
                {report.title}
            </h4>

            {/* Description (truncated) */}
            <p className="mb-3 text-gray-600 text-sm line-clamp-2">
                {report.description}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap gap-3 text-gray-500 text-xs">
                <span className="bg-gray-100 px-2 py-1 rounded">
                    {formatDate(report.createdAt)}
                </span>
                
                {/* Show reporter info for admin view */}
                {isAdmin || report.reporterName !== auth.userName && (
                    <span className="bg-indigo-50 px-2 py-1 rounded text-indigo-700">
                        {report.reporterName}
                    </span>
                )}

                {/* Points info (if accepted/fixed) */}
                {report.pointsAwarded > 0 && (
                    <span className="bg-green-50 px-2 py-1 rounded text-green-700">
                        +{report.pointsAwarded} poin
                    </span>
                )}

                {/* Screenshots indicator */}
                {report.screenshots && report.screenshots.length > 0 && (
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {report.screenshots.length}
                    </span>
                )}
            </div>
        </div>
    );
};

export default BugReportCard;
