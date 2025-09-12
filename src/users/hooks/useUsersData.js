import { useState, useEffect } from "react";
import useHttp from "../../shared/hooks/http-hook";

/**
 * Hook for fetching users data from the API
 */
export const useUsersData = () => {
    const [users, setUsers] = useState();
    const { isLoading, error, sendRequest, setError } = useHttp();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest(
                    `${import.meta.env.VITE_BACKEND_URL}/users/`
                );
                setUsers(responseData);
                console.log(responseData);
            } catch {
                // Error is handled by useHttp
            }
        };
        fetchUsers();
    }, [sendRequest]);

    return {
        users,
        setUsers,
        isLoading,
        error,
        setError,
    };
};