import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../Context/auth-context";

/**
 * Route guard component that handles authentication-based routing
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if access is allowed
 * @param {boolean} props.requireAuth - Whether authentication is required for this route
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.fallbackPath - Path to redirect to if access is denied
 */
const RouteGuard = ({
    children,
    requireAuth = false,
    allowedRoles = [],
    fallbackPath = "/",
}) => {
    const { isLoggedIn, userRole } = useContext(AuthContext);
    const location = useLocation();

    // If authentication is required but user is not logged in
    if (requireAuth && !isLoggedIn) {
        return <Navigate to="/" state={{ from: location.pathname }} replace />;
    }

    // If specific roles are required, check if user has the right role
    if (
        requireAuth &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(userRole)
    ) {
        return <Navigate to={fallbackPath} replace />;
    }

    // If user is logged in but trying to access auth pages, redirect to dashboard
    if (isLoggedIn && location.pathname === "/" && requireAuth === false) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default RouteGuard;
