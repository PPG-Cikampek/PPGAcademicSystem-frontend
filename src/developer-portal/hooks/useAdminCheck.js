import { useContext, useMemo } from "react";
import { AuthContext } from "../../shared/Components/Context/auth-context";

const ADMIN_ROLE = "admin";

export const useAdminCheck = () => {
    const { userRole } = useContext(AuthContext);

    const isAdmin = useMemo(() => userRole === ADMIN_ROLE, [userRole]);

    return {
        isAdmin,
        userRole,
    };
};
