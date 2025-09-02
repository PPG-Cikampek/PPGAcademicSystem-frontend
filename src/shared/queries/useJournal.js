import { useQuery } from "@tanstack/react-query";
import api from "./api";

// Fetch journal data for a specific user and week
export const useJournal = (userId, week, options = {}) => {
    return useQuery({
        queryKey: ["journals", userId, week],
        queryFn: async () => {
            const response = await api.get(`/journals/${userId}?week=${week}`);
            return response.data.journals;
        },
        enabled: !!userId && !!week, // Only run query if both userId and week are provided
        ...options,
    });
};
