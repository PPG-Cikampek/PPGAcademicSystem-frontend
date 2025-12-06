import { useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import useHttp from "../../shared/hooks/http-hook";

/**
 * Hook for user deletion operations
 */
export const useUserDeletion = () => {
    const { sendRequest, isLoading: isDeleting, error, setError } = useHttp();
    const auth = useContext(AuthContext);
    const queryClient = useQueryClient();

    const handleDeleteUser = async (userId) => {
        const responseData = await sendRequest(
            `${import.meta.env.VITE_BACKEND_URL}/users/${userId}`,
            "DELETE",
            null,
            {
                Authorization: "Bearer " + auth.token,
            }
        );
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        return responseData.message;
    };

    const handleBulkDelete = async (selectedUserIds, setSelectedUserIds) => {
        if (selectedUserIds.length === 0) {
            throw new Error("Please select at least one user.");
        }

        const url = `${import.meta.env.VITE_BACKEND_URL}/users/bulk-delete`;
        const body = JSON.stringify({ userIds: selectedUserIds });
        console.log(body);
        const responseData = await sendRequest(url, "DELETE", body, {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
        });
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        setSelectedUserIds([]);
        return responseData.message;
    };

    return {
        handleDeleteUser,
        handleBulkDelete,
        isDeleting,
        error,
        setError,
    };
};