import { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/auth-context";
import { getFallbackRoute } from "../../Utilities/routeUtils";

/**
 * Higher-Order Component for protecting routes
 * @param {React.Component} WrappedComponent - Component to protect
 * @param {Object} options - Protection options
 * @param {boolean} options.requireAuth - Whether authentication is required
 * @param {string[]} options.allowedRoles - Array of roles allowed to access this route
 * @param {string} options.redirectTo - Custom redirect path
 */
const withRouteProtection = (WrappedComponent, options = {}) => {
    const {
        requireAuth = true,
        allowedRoles = [],
        redirectTo = null,
    } = options;

    return function ProtectedComponent(props) {
        const { isLoggedIn, userRole } = useContext(AuthContext);
        const navigate = useNavigate();
        const location = useLocation();

        useEffect(() => {
            // Check authentication requirement
            if (requireAuth && !isLoggedIn) {
                navigate("/", {
                    state: { from: location.pathname },
                    replace: true,
                });
                return;
            }

            // Check role permissions
            if (
                requireAuth &&
                allowedRoles.length > 0 &&
                !allowedRoles.includes(userRole)
            ) {
                const fallback =
                    redirectTo || getFallbackRoute(userRole, isLoggedIn);
                navigate(fallback, { replace: true });
                return;
            }

            // Redirect authenticated users away from auth pages
            if (isLoggedIn && location.pathname === "/" && !requireAuth) {
                navigate("/dashboard", { replace: true });
                return;
            }
        }, [isLoggedIn, userRole, navigate, location]);

        // Don't render if authentication checks fail
        if (requireAuth && !isLoggedIn) {
            return null;
        }

        if (
            requireAuth &&
            allowedRoles.length > 0 &&
            !allowedRoles.includes(userRole)
        ) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
};

export default withRouteProtection;
