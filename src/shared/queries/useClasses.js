import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

// Fetch class data by ID
export const useClass = (classId, options = {}) => {
    return useQuery({
        queryKey: ["class", classId],
        queryFn: async () => {
            const response = await api.get(`/classes/${classId}?populate=all`);
            return response.data.class;
        },
        enabled: !!classId,
        ...options,
    });
};

// Mutation for updating a class
export const useUpdateClassMutation = (options = {}) => {
    const queryClient = useQueryClient();

    // Extract user-provided handlers so we can compose them with internal logic
    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async ({ classId, name, startTime, endTime }) => {
            const response = await api.patch(`/classes/${classId}`, {
                name,
                startTime,
                endTime,
            });
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            // Update the class data directly in the cache first
            queryClient.setQueryData(
                ["class", variables.classId],
                (oldData) => {
                    if (oldData) {
                        return {
                            ...oldData,
                            name: variables.name,
                            startTime: variables.startTime,
                            endTime: variables.endTime,
                        };
                    }
                    return oldData;
                }
            );

            // Then invalidate queries to ensure fresh data
            queryClient.invalidateQueries({
                queryKey: ["class", variables.classId],
            });
            // Invalidate all teaching group queries to refresh classes list
            queryClient.invalidateQueries({ queryKey: ["teachingGroup"] });

            // Call any consumer-provided handler after cache updates
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

export const useRegisterTeacherToClassMutation = (options = {}) => {
    const queryClient = useQueryClient();

    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async ({ classId, teacherId }) => {
            const response = await api.post(`/classes/register-teacher`, {
                classId,
                teacherId,
            });
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
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

// Mutation for removing a teacher from a class
export const useRemoveTeacherFromClassMutation = (options = {}) => {
    const queryClient = useQueryClient();

    // Extract user-provided handlers so we can compose them with internal logic
    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async ({ classId, teacherId }) => {
            const response = await api.delete(`/classes/remove-teacher`, {
                data: { classId, teacherId },
            });
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            // Invalidate the class query to refresh data
            queryClient.invalidateQueries({
                queryKey: ["class", variables.classId],
            });

            // Call any consumer-provided handler after cache updates
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

// Mutation for removing a student from a class
export const useRemoveStudentFromClassMutation = (options = {}) => {
    const queryClient = useQueryClient();

    // Extract user-provided handlers so we can compose them with internal logic
    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async ({ classId, studentId }) => {
            const response = await api.delete(`/classes/remove-student`, {
                data: { classId, studentId },
            });
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            // Invalidate the class query to refresh data
            queryClient.invalidateQueries({
                queryKey: ["class", variables.classId],
            });

            // Call any consumer-provided handler after cache updates
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
