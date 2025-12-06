import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Fetch students list scoped by the current role and IDs
export const useStudents = (
    { role, branchId, subBranchId } = {},
    options = {}
) => {
    return useQuery({
        queryKey: ["students", role, branchId, subBranchId],
        queryFn: async () => {
            let url;
            if (role === "admin") {
                url = `/students`;
            } else if (role === "branchAdmin") {
                url = `/students/branch/${branchId}`;
            } else {
                url = `/students/sub-branch/${subBranchId}`;
            }
            const response = await api.get(url);
            return response.data.students;
        },
        enabled:
            role === "admin"
                ? true
                : role === "branchAdmin"
                ? Boolean(branchId)
                : Boolean(subBranchId),
        ...options,
    });
};

// Fetch single student by ID
export const useStudent = (studentId, options = {}) => {
    return useQuery({
        queryKey: ["student", studentId],
        queryFn: async () => {
            const response = await api.get(`/students/${studentId}`);
            return response.data.student;
        },
        enabled: !!studentId,
        ...options,
    });
};

// Mutation for updating a student
export const useUpdateStudentMutation = (options = {}) => {
    const queryClient = useQueryClient();

    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async ({ studentId, formData }) => {
            const response = await api.patch(`/students/${studentId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            // Invalidate student queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["student"] });
            queryClient.invalidateQueries({ queryKey: ["students"] });

            if (typeof userOnSuccess === "function") {
                userOnSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            if (typeof userOnError === "function") {
                userOnError(error, variables, context);
            }
        },
        ...rest,
    });
};
