import { useQuery } from "@tanstack/react-query";
import api from "./api";

// Fetch munaqasyah classes list
export const useMunaqasyah = (options = {}) => {
    return useQuery({
        queryKey: ["munaqasyah", "classes"],
        queryFn: async () => {
            const response = await api.get(`/munaqasyahs/classes`);
            return response?.data?.classes ?? response?.data;
        },
        ...options,
    });
};

export default useMunaqasyah;
