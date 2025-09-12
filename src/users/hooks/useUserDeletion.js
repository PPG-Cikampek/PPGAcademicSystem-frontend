import { useContext } from "react";
import { AuthContext } from "../../shared/Components/Context/auth-context";
import useHttp from "../../shared/hooks/http-hook";

/**
 * Hook for user deletion operations
 */
export const useUserDeletion = (setUsers) => {
    const { sendRequest } = useHttp();
    const auth = useContext(AuthContext);

    const handleDeleteUser = async (userId) => {
        const responseData = await sendRequest(
            `${import.meta.env.VITE_BACKEND_URL}/users/${userId}`,
            "DELETE",
            null,
            {
                Authorization: "Bearer " + auth.token,
            }
        );
        setUsers((prevUsers) => ({
            ...prevUsers,
            users: prevUsers.users.filter((user) => user._id !== userId),
        }));
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
        setUsers((prevUsers) => ({
            ...prevUsers,
            users: prevUsers.users.filter(
                (user) => !selectedUserIds.includes(user._id)
            ),
        }));
        setSelectedUserIds([]);
        return responseData.message;
    };

    return {
        handleDeleteUser,
        handleBulkDelete,
    };
};