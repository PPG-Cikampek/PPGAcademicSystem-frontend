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
