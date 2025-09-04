import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Query: fetch branch years for a branch
export const useBranchYears = (branchId, options = {}) => {
    return useQuery({
        queryKey: ["branchYears", branchId],
        queryFn: async () => {
            const response = await api.get(`/branchYears/branch/${branchId}`);
            return response.data;
        },
        enabled: !!branchId,
        ...options,
    });
};

// Activate branch year
export const useActivateBranchYearMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ branchYearId }) => {
            const response = await api.patch(`/branchYears/activate`, {
                branchYearId,
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            if (variables?.branchId) {
                queryClient.invalidateQueries({
                    queryKey: ["branchYears", variables.branchId],
                });
            } else {
                queryClient.invalidateQueries({ queryKey: ["branchYears"] });
            }
        },
    });
};

// Deactivate branch year
export const useDeactivateBranchYearMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ branchYearId }) => {
            const response = await api.patch(`/branchYears/deactivate`, {
                branchYearId,
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            if (variables?.branchId) {
                queryClient.invalidateQueries({
                    queryKey: ["branchYears", variables.branchId],
                });
            } else {
                queryClient.invalidateQueries({ queryKey: ["branchYears"] });
            }
        },
    });
};

// Delete branch year
export const useDeleteBranchYearMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ branchYearId }) => {
            const response = await api.delete(`/branchYears/`, {
                data: { branchYearId },
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            if (variables?.branchId) {
                queryClient.invalidateQueries({
                    queryKey: ["branchYears", variables.branchId],
                });
            } else {
                queryClient.invalidateQueries({ queryKey: ["branchYears"] });
            }
        },
    });
};

// Delete teaching group
export const useDeleteTeachingGroupMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ teachingGroupId }) => {
            const response = await api.delete(`/teachingGroups/`, {
                data: { teachingGroupId },
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            if (variables?.branchId) {
                queryClient.invalidateQueries({
                    queryKey: ["branchYears", variables.branchId],
                });
            } else {
                queryClient.invalidateQueries({ queryKey: ["branchYears"] });
            }
        },
    });
};

export default useBranchYears;
