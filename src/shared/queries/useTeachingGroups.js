import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Fetch teaching group data by ID
export const useTeachingGroup = (teachingGroupId, options = {}) => {
    return useQuery({
        queryKey: ["teachingGroup", teachingGroupId],
        queryFn: async () => {
            const response = await api.get(
                `/teachingGroups/${teachingGroupId}`
            );
            return response.data.identifiedTeachingGroup;
        },
        enabled: !!teachingGroupId,
        ...options,
    });
};

// Fetch sub-branches by branch ID
export const useBranchSubBranches = (branchId, options = {}) => {
    return useQuery({
        queryKey: ["subBranches", branchId],
        queryFn: async () => {
            const response = await api.get(
                `/levels/branches/${branchId}/sub-branches`
            );
            return response.data.subBranches;
        },
        enabled: !!branchId,
        ...options,
    });
};

// Mutation for removing sub-branch from teaching group
export const useRemoveSubBranchMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ teachingGroupId, subBranchId }) => {
            const response = await api.delete(
                `/teachingGroups/remove-sub-branch/`,
                {
                    data: { teachingGroupId, subBranchId },
                }
            );
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidate the teaching group query to refetch data
            queryClient.invalidateQueries({
                queryKey: ["teachingGroup", variables.teachingGroupId],
            });
            // Also invalidate sub-branches list for the related branch if provided
            if (variables?.branchId) {
                queryClient.invalidateQueries({
                    queryKey: ["subBranches", variables.branchId],
                });
            } else {
                // As a fallback, invalidate any subBranches queries
                queryClient.invalidateQueries({ queryKey: ["subBranches"] });
            }
        },
    });
};

// Mutation for removing class from teaching group
export const useRemoveClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ teachingGroupId, classId }) => {
            const response = await api.delete(`/teachingGroups/remove-class/`, {
                data: { teachingGroupId, classId },
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidate the teaching group query to refetch data
            queryClient.invalidateQueries({
                queryKey: ["teachingGroup", variables.teachingGroupId],
            });
        },
    });
};

// Mutation for locking/unlocking teaching group
export const useLockTeachingGroupMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ teachingGroupId, actionType }) => {
            const url =
                actionType === "lock"
                    ? `/teachingGroups/lock`
                    : `/teachingGroups/unlock`;

            const response = await api.patch(url, { teachingGroupId });
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidate the teaching group query to refetch data
            queryClient.invalidateQueries({
                queryKey: ["teachingGroup", variables.teachingGroupId],
            });
        },
    });
};

// Mutation for locking/unlocking class
export const useLockClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ classId, actionType, teachingGroupId }) => {
            const url =
                actionType === "lock" ? `/classes/lock` : `/classes/unlock`;

            const response = await api.patch(url, { classId });
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidate the teaching group query to refetch data
            queryClient.invalidateQueries({
                queryKey: ["teachingGroup", variables.teachingGroupId],
            });
            // Invalidate the class query to refetch data
            queryClient.invalidateQueries({
                queryKey: ["class", variables.classId],
            });
        },
    });
};

// Mutation for creating a new class
export const useCreateClassMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name, startTime, endTime, teachingGroupId }) => {
            const response = await api.post(`/classes/`, {
                name,
                startTime,
                endTime,
                teachingGroupId,
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidate the teaching group query to refetch data
            queryClient.invalidateQueries({
                queryKey: ["teachingGroup", variables.teachingGroupId],
            });
        },
    });
};

// Mutation for registering a sub-branch to a teaching group
export const useRegisterSubBranchToTeachingGroupMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name, teachingGroupId, subBranchId }) => {
            const response = await api.post(
                `/teachingGroups/${teachingGroupId}`,
                { name, teachingGroupId, subBranchId }
            );
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidate lists dependent on this change
            if (variables?.branchId) {
                queryClient.invalidateQueries({
                    queryKey: ["subBranches", variables.branchId],
                });
            }
            if (variables?.teachingGroupId) {
                queryClient.invalidateQueries({
                    queryKey: ["teachingGroup", variables.teachingGroupId],
                });
            }
        },
    });
};

// Mutation for creating a new teaching group
export const useCreateTeachingGroupMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name, address, branchYearId }) => {
            const response = await api.post(`/teachingGroups/`, {
                name,
                address,
                branchYearId,
            });
            return response.data;
        },
        onSuccess: () => {
            // Invalidate relevant queries if needed
        },
    });
};

// Mutation for updating a teaching group
export const useUpdateTeachingGroupMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ teachingGroupId, name, address }) => {
            const response = await api.patch(`/teachingGroups/${teachingGroupId}`, {
                name,
                address,
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["teachingGroup", variables.teachingGroupId],
            });
        },
    });
};
