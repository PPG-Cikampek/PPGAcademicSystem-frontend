import { useQuery } from "@tanstack/react-query";
import api from "./api";

// Server-side users list with pagination/search/sort
export const useUsersList = (params = {}, options = {}) => {
    const { role, page = 1, limit = 10, search, sort = {} } = params;

    return useQuery({
        queryKey: [
            "users",
            {
                role,
                page,
                limit,
                search,
                sort,
            },
        ],
        queryFn: async () => {
            const response = await api.get(`/users`, {
                params: {
                    role,
                    page,
                    limit,
                    search,
                    sortBy: sort?.key,
                    sortDir: sort?.direction,
                },
            });
            return response.data;
        },
        keepPreviousData: true,
        ...options,
    });
};
