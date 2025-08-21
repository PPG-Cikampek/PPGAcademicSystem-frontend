/**
 * Validates if a route path is valid for the given user role
 * @param {string} path - The route path to validate
 * @param {string} userRole - The user's role
 * @param {Array} routes - Array of valid routes for the role
 * @returns {boolean} - True if the route is valid for the user
 */
export const isValidRouteForRole = (path, userRole, routes) => {
    if (!userRole || !routes) return false;

    // Check if the exact path exists
    const exactMatch = routes.find((route) => route.path === path);
    if (exactMatch) return true;

    // Check for dynamic routes (contains :)
    const dynamicMatch = routes.find((route) => {
        if (!route.path.includes(":")) return false;

        const routePattern = route.path.split("/");
        const pathPattern = path.split("/");

        if (routePattern.length !== pathPattern.length) return false;

        return routePattern.every((segment, index) => {
            return segment.startsWith(":") || segment === pathPattern[index];
        });
    });

    return !!dynamicMatch;
};

/**
 * Gets the appropriate fallback route for a user role
 * @param {string} userRole - The user's role
 * @param {boolean} isLoggedIn - Whether the user is logged in
 * @returns {string} - The fallback route path
 */
export const getFallbackRoute = (userRole, isLoggedIn) => {
    if (!isLoggedIn) return "/";

    // Role-specific dashboard routes if they exist, otherwise default dashboard
    const roleDashboards = {
        admin: "/dashboard",
        teacher: "/dashboard",
        student: "/dashboard",
        branchAdmin: "/dashboard",
        subBranchAdmin: "/dashboard",
        curriculum: "/dashboard",
        munaqisy: "/dashboard",
    };

    return roleDashboards[userRole] || "/dashboard";
};

/**
 * Determines if the current path should be preserved during refresh
 * @param {string} path - Current path
 * @param {string} userRole - User's role
 * @param {Array} routes - Valid routes for the role
 * @returns {boolean} - True if the path should be preserved
 */
export const shouldPreservePath = (path, userRole, routes) => {
    // Never preserve root path
    if (path === "/") return false;

    // Preserve valid paths for the user's role
    return isValidRouteForRole(path, userRole, routes);
};
