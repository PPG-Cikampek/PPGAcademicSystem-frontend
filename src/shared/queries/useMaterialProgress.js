import { useQuery } from "@tanstack/react-query";
import api from "./api";

// Fetch material progress data for a specific user and week
export const useMaterialProgress = (userId, week, options = {}) => {
    return useQuery({
        queryKey: ["materialProgress", userId, week],
        queryFn: async () => {
            const response = await api.get(
                `/materialProgress/${userId}?week=${week}`
            );
            return response.data.progresses;
        },
        enabled: !!userId && !!week, // Only run query if both userId and week are provided
        ...options,
    });
};
