import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Fetch students list (supports legacy list mode and server-side pagination mode)
export const useStudents = (params = {}, options = {}) => {
    const isLegacyParam = typeof params === "string";
    const normalizedParams = isLegacyParam ? { subBranchId: params } : params;

    const {
        role,
        branchId,
        subBranchId,
        page,
        limit,
        search,
        filters = {},
        sort = {},
    } = normalizedParams || {};

    const isPaginatedMode =
        page !== undefined ||
        limit !== undefined ||
        search !== undefined ||
        (filters && Object.keys(filters).length > 0) ||
        sort?.key !== undefined ||
        sort?.direction !== undefined;

    const queryKey = isPaginatedMode
        ? [
              "students",
              {
                  role,
                  branchId,
                  subBranchId,
                  page,
                  limit,
                  search,
                  filters,
                  sort,
              },
          ]
        : ["students", role, branchId, subBranchId || params];

    return useQuery({
        queryKey,
        queryFn: async () => {
            if (isPaginatedMode) {
                const response = await api.get(`/students`, {
                    params: {
                        role,
                        branchId,
                        subBranchId,
                        page,
                        limit,
                        search,
                        sortBy: sort?.key,
                        sortDir: sort?.direction,
                        isActive: filters?.isActive,
                        isProfileComplete: filters?.isProfileComplete,
                        isInternal: filters?.isInternal,
                        group: filters?.group,
                        branch: filters?.branch,
                    },
                });
                return response.data;
            }

            // Legacy list mode (no pagination)
            let url;
            if (role === "admin") {
                url = `/students`;
            } else if (role === "branchAdmin") {
                url = `/students/branch/${branchId}`;
            } else if (subBranchId) {
                url = `/students/sub-branch/${subBranchId}`;
            } else {
                url = `/students`;
            }

            const response = await api.get(url);
            return response.data.students;
        },
        enabled:
            isPaginatedMode
                ? true
                : role === "admin"
                ? true
                : role === "branchAdmin"
                ? Boolean(branchId)
                : Boolean(subBranchId) || Boolean(params),
        keepPreviousData: isPaginatedMode,
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
