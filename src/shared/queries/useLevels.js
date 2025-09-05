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
