import {
    useState,
    useCallback,
    useContext,
    useEffect,
    Suspense,
    lazy,
} from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";

import { useAuth } from "./shared/hooks/auth-hook";
import { AuthContext } from "./shared/Components/Context/auth-context";
import { SidebarContext } from "./shared/Components/Context/sidebar-context";
import { GeneralContext } from "./shared/Components/Context/general-context";
import LoadingCircle from "./shared/Components/UIElements/LoadingCircle";
import RouteErrorBoundary from "./shared/Components/ErrorBoundary/RouteErrorBoundary";
import { getRouteConfig } from "./routes";
import {
    isValidRouteForRole,
    getFallbackRoute,
    shouldPreservePath,
} from "./shared/Utilities/routeUtils";

// Smart Route Handler Component
const SmartRouteHandler = ({ children }) => {
    const location = useLocation();
    const { isLoggedIn, userRole, token } = useContext(AuthContext);
    const { routes } = getRouteConfig(userRole);

    const currentPath = location.pathname;

    // For logged-out users, only allow auth-related routes
    if (!isLoggedIn) {
        const guestRoutes = ["/", "/reset-password", "/verify-email", "/demo"];
        const isGuestRoute = guestRoutes.some(
            (route) =>
                currentPath === route || currentPath.startsWith(route + "/")
        );

        if (!isGuestRoute) {
            return <Navigate to="/" state={{ from: currentPath }} replace />;
        }

        return children;
    }

    // For logged-in users
    if (isLoggedIn) {
        // If on root path, redirect to dashboard
        if (currentPath === "/") {
            return <Navigate to="/dashboard" replace />;
        }

        // Check if current path is valid for user's role
        if (!isValidRouteForRole(currentPath, userRole, routes)) {
            const fallbackRoute = getFallbackRoute(userRole, true);
            return <Navigate to={fallbackRoute} replace />;
        }
    }

    return children;
};

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [navigateBlockMessage, setNavigateBlockMessage] = useState(true);

    const {
        token,
        login,
        logout,
        userId,
        userRole,
        userName,
        userBranchId,
        userSubBranchId,
        currentBranchYear,
        currentBranchYearId,
        userClassIds,
        setAttributes,
        isInitialized,
    } = useAuth();

    // Wait for auth to initialize from localStorage
    useEffect(() => {
        const checkScreenSize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        checkScreenSize(); // Initial check
        window.addEventListener("resize", checkScreenSize); // Add resize listener

        return () => {
            window.removeEventListener("resize", checkScreenSize); // Cleanup on unmount
        };
    }, []);

    const toggle = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    });

    const setMessage = useCallback((msg) => {
        setNavigateBlockMessage(msg || "");
    }, []);

    // Show loading while auth initializes
    if (!isInitialized) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingCircle size={32} />
                <span className="ml-3 text-gray-600">Initializing...</span>
            </div>
        );
    }

    const { routes, Wrapper } = getRouteConfig(userRole);

    const routeElement = (
        <Wrapper>
            <SmartRouteHandler>
                <Routes>
                    {routes.map(({ path, element }) => (
                        <Route key={path} path={path} element={element} />
                    ))}

                    {/* Catch-all route - SmartRouteHandler will handle the logic */}
                    <Route path="*" element={<div>Route not found</div>} />
                </Routes>
            </SmartRouteHandler>
        </Wrapper>
    );

    return (
        <RouteErrorBoundary>
            <GeneralContext.Provider
                value={{ navigateBlockMessage, setMessage }}
            >
                <SidebarContext.Provider value={{ isSidebarOpen, toggle }}>
                    <AuthContext.Provider
                        value={{
                            isLoggedIn: !!token,
                            userRole,
                            userId,
                            userName,
                            userBranchId,
                            userSubBranchId,
                            currentBranchYear,
                            currentBranchYearId,
                            userClassIds,
                            token,
                            login,
                            setAttributes,
                            logout,
                        }}
                    >
                        <Router>
                            <main className="h-auto">
                                <Suspense
                                    fallback={
                                        <div className="flex justify-center mt-16">
                                            <LoadingCircle size={32} />
                                        </div>
                                    }
                                >
                                    {routeElement}
                                </Suspense>
                            </main>
                        </Router>
                    </AuthContext.Provider>
                </SidebarContext.Provider>
            </GeneralContext.Provider>
        </RouteErrorBoundary>
    );
}

export default App;
