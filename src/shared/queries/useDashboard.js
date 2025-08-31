import { useQuery } from "@tanstack/react-query";
import api from "./api";

// Fetch dashboard data
export const useDashboard = (options = {}) => {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const response = await api.post("/dashboard", {});
            return response.data;
        },
        ...options,
    });
};
