import { useNavigate } from "react-router-dom";
import { useUserDeletion } from "./useUserDeletion";
import { useUserSelection } from "./useUserSelection";
import { USER_ROLE_ORDER } from "../config";

/**
 * Main hook for users management functionality
 * Composes smaller, focused hooks for better maintainability
 */
export const useUsers = () => {
    const navigate = useNavigate();
    
    const { selectedUserIds, setSelectedUserIds } = useUserSelection();
    const { handleDeleteUser, handleBulkDelete, isDeleting, error, setError } =
        useUserDeletion();

    // Create bound version of handleBulkDelete with current selection state
    const handleBulkDeleteWithSelection = () => 
        handleBulkDelete(selectedUserIds, setSelectedUserIds);

    return {
        selectedUserIds,
        setSelectedUserIds,
        roleOrder: USER_ROLE_ORDER,
        isLoading: isDeleting,
        error,
        setError,
        handleDeleteUser,
        handleBulkDelete: handleBulkDeleteWithSelection,
        navigate,
    };
};
