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


