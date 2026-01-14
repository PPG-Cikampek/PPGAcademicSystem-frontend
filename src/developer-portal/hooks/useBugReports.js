import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../shared/queries/api";

// Query keys for cache management
const BUG_REPORTS_QUERY_KEY = ["bugReports"];
const LEADERBOARD_QUERY_KEY = ["bugReports", "leaderboard"];
const METRICS_QUERY_KEY = ["bugReports", "metrics"];

/**
 * Fetch bug reports with filters
 * @param {Object} filters - { status, severity, page, limit, sortBy, sortDir, search }
 */
export const useBugReports = (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value);
        }
    });

    return useQuery({
        queryKey: [...BUG_REPORTS_QUERY_KEY, filters],
        queryFn: async () => {
            const response = await api.get(`/bugReports?${queryParams.toString()}`);
            return response.data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

/**
 * Fetch single bug report by reportId
 * @param {string} reportId - The report ID (e.g., 'BUG-000001')
 */
export const useBugReport = (reportId, filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value);
        }
    });

    const queryString = queryParams.toString();

    return useQuery({
        queryKey: [...BUG_REPORTS_QUERY_KEY, reportId, filters],
        queryFn: async () => {
            const url = `/bugReports/${reportId}${queryString ? `?${queryString}` : ""}`;
            const response = await api.get(url);
            return response.data;
        },
        enabled: !!reportId,
        staleTime: 1000 * 60 * 2,
    });
};

/**
 * Fetch leaderboard data
 * @param {string} period - 'week', 'month', or 'all'
 */
export const useLeaderboard = (period = "all") => {
    return useQuery({
        queryKey: [...LEADERBOARD_QUERY_KEY, period],
        queryFn: async () => {
            const response = await api.get(`/bugReports/leaderboard?period=${period}`);
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Fetch dashboard metrics (admin only)
 */
export const useBugReportMetrics = () => {
    return useQuery({
        queryKey: METRICS_QUERY_KEY,
        queryFn: async () => {
            const response = await api.get("/bugReports/metrics");
            return response.data;
        },
        staleTime: 1000 * 60 * 2,
    });
};

/**
 * Create a new bug report
 */
export const useCreateBugReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData) => {
            // FormData for file uploads
            const response = await api.post("/bugReports", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BUG_REPORTS_QUERY_KEY });
        },
    });
};

/**
 * Update bug report status (admin only)
 */
export const useUpdateBugReportStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reportId, ...data }) => {
            const response = await api.patch(`/bugReports/${reportId}/status`, data);
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: BUG_REPORTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: LEADERBOARD_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: METRICS_QUERY_KEY });
            // Also invalidate the specific report
            queryClient.invalidateQueries({ 
                queryKey: [...BUG_REPORTS_QUERY_KEY, variables.reportId] 
            });
        },
    });
};

/**
 * Add development update to bug report (admin only)
 */
export const useAddBugReportUpdate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reportId, title, description }) => {
            const response = await api.post(`/bugReports/${reportId}/updates`, {
                title,
                description,
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: [...BUG_REPORTS_QUERY_KEY, variables.reportId] 
            });
            queryClient.invalidateQueries({ queryKey: BUG_REPORTS_QUERY_KEY });
        },
    });
};

/**
 * Delete bug report
 */
export const useDeleteBugReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reportId) => {
            const response = await api.delete(`/bugReports/${reportId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BUG_REPORTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: METRICS_QUERY_KEY });
        },
    });
};
