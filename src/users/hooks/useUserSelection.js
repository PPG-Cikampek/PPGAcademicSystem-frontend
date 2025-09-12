import { useState } from "react";

/**
 * Hook for managing user selection state in the users list
 */
export const useUserSelection = () => {
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    return {
        selectedUserIds,
        setSelectedUserIds,
    };
};