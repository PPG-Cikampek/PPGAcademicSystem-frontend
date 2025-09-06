import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./api";

export const useTeachers = (subBranchId, options = {}) => {
    return useQuery({
        queryKey: ["teachers", subBranchId],
        queryFn: async () => {
            const response = await api.get(`/teachers/sub-branch/${subBranchId}`);
            return response.data.teachers;
        },
        enabled: !!subBranchId,
        ...options,
    });
};

// Fetch single teacher by ID or by user ID based on role
export const useTeacher = (id, userRole, userId, options = {}) => {
    return useQuery({
        queryKey: ["teacher", id, userRole, userId],
        queryFn: async () => {
            const url = userRole !== "teacher" 
                ? `/teachers/${id}` 
                : `/teachers/user/${userId}`;
            const response = await api.get(url);
            return response.data.teacher;
        },
        enabled: !!((id && userRole !== "teacher") || (userRole === "teacher" && userId)),
        ...options,
    });
};

// Mutation for updating a teacher
export const useUpdateTeacherMutation = (options = {}) => {
    const queryClient = useQueryClient();

    const { onSuccess: userOnSuccess, onError: userOnError, ...rest } = options;

    return useMutation({
        mutationFn: async (formData) => {
            const response = await api.patch("/teachers/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: (data, variables, context) => {
            // Invalidate teacher queries to refresh data
            queryClient.invalidateQueries({ queryKey: ["teacher"] });
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


