import { useNavigate } from "react-router-dom";
import { useUsersData } from "./useUsersData";
import { useUserDeletion } from "./useUserDeletion";
import { useUserSelection } from "./useUserSelection";
import { USER_ROLE_ORDER } from "../config";

/**
 * Main hook for users management functionality
 * Composes smaller, focused hooks for better maintainability
 */
export const useUsers = () => {
    const navigate = useNavigate();
    
    // Separate concerns into focused hooks
    const { users, setUsers, isLoading, error, setError } = useUsersData();
    const { selectedUserIds, setSelectedUserIds } = useUserSelection();
    const { handleDeleteUser, handleBulkDelete } = useUserDeletion(setUsers);

    // Create bound version of handleBulkDelete with current selection state
    const handleBulkDeleteWithSelection = () => 
        handleBulkDelete(selectedUserIds, setSelectedUserIds);

    return {
        users,
        selectedUserIds,
        setSelectedUserIds,
        roleOrder: USER_ROLE_ORDER,
        isLoading,
        error,
        setError,
        handleDeleteUser,
        handleBulkDelete: handleBulkDeleteWithSelection,
        navigate,
    };
};
