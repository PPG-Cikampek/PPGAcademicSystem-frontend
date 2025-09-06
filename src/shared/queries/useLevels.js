import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Query: fetch branches with sub-branches
export const useBranches = (options = {}) => {
    return useQuery({
        queryKey: ["branches"],
        queryFn: async () => {
            const response = await api.get(`/levels/branches/?populate=true`);
            return response.data;
        },
        ...options,
    });
};

// Query: fetch single branch
export const useBranch = (branchId, options = {}) => {
    return useQuery({
        queryKey: ["branches", branchId],
        queryFn: async () => {
            const response = await api.get(`/levels/branches/${branchId}`);
            return response.data;
        },
        enabled: !!branchId,
        ...options,
    });
};

// Query: fetch single sub-branch
export const useSubBranch = (subBranchId, options = {}) => {
    return useQuery({
        queryKey: ["subBranches", subBranchId],
        queryFn: async () => {
            const response = await api.get(
                `/levels/branches/sub-branches/${subBranchId}`
            );
            return response.data;
        },
        enabled: !!subBranchId,
        ...options,
    });
};

// Create branch mutation
export const useCreateBranchMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await api.post(`/levels/branches`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
        },
    });
};

// Create sub-branch mutation
export const useCreateSubBranchMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await api.post(
                `/levels/branches/sub-branches`,
                data
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
        },
    });
};

// Update branch mutation
export const useUpdateBranchMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ branchId, data }) => {
            const response = await api.patch(`/levels/branches/${branchId}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
        },
    });
};

// Update sub-branch mutation
export const useUpdateSubBranchMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ subBranchId, data }) => {
            const response = await api.patch(
                `/levels/branches/sub-branches/${subBranchId}`,
                data
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
        },
    });
};

// Delete branch mutation
export const useDeleteBranchMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ branchId }) => {
            const response = await api.delete(`/levels/branches/`, {
                data: { branchId },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
        },
    });
};

// Delete sub-branch mutation
export const useDeleteSubBranchMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ subBranchId }) => {
            const response = await api.delete(`/levels/branches/sub-branches`, {
                data: { subBranchId },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["branches"] });
        },
    });
};

export default useBranches;
