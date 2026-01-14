import { useQuery } from "@tanstack/react-query";
import api from "./api";

// Fetch a single user profile (includes contributionPoints)
const fetchUserProfile = async (userId) => {
    const response = await api.get(`/users/${userId}`);
    // Endpoint returns { users: <userObject> }
    return response.data.users;
};

const useUserProfile = (userId, options = {}) => {
    return useQuery({
        queryKey: ["user", userId],
        queryFn: () => fetchUserProfile(userId),
        enabled: !!userId,
        staleTime: 30_000, // 30s - tune as needed
        refetchOnWindowFocus: true,
        ...options,
    });
};

export default useUserProfile;
