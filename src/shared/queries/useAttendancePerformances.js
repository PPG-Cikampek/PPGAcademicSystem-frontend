import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Fetch attendance overview data
export const useAttendancePerformance = (filters, options = {}) => {
    return useQuery({
        queryKey: ["attendancePerformance", filters],
        queryFn: async () => {
            const response = await api.post("/attendances/overview/", filters);
            return response.data;
        },
        enabled: !!filters.academicYearId, // Only run query if academicYearId is provided
        ...options,
    });
};

// Export mutation for manual trigger
export const useAttendancePerformanceMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (filters) => {
            const response = await api.post("/attendances/overview/", filters);
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Optionally update the query cache
            queryClient.setQueryData(
                ["attendancePerformance", variables],
                data
            );
        },
    });
};

// export const useStudentPerformance = (studentId) => {
//     return useQuery(["studentPerformance", studentId], async () => {
//         const response = await api.get(`/students/${studentId}/performance`);
//         return response.data;
//     });
// };
