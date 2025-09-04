import { useQuery } from "@tanstack/react-query";
import api from "./api";

// Fetch students list by sub-branch ID
export const useStudents = (subBranchId, options = {}) => {
    return useQuery({
        queryKey: ["students", subBranchId],
        queryFn: async () => {
            const response = await api.get(`/students/sub-branch/${subBranchId}`);
            return response.data.students;
        },
        enabled: !!subBranchId,
        ...options,
    });
};
