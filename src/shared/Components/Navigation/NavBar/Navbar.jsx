import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { SidebarContext } from "../../Context/sidebar-context";
import { AuthContext } from "../../Context/auth-context";
import getUserRoleTitle from "../../../Utilities/getUserRoleTitle";
import FloatingMenu from "../../UIElements/FloatingMenu";
import BackButton from "../../UIElements/BackButton";
import {
    User,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from "lucide-react";

// Throttle utility function
const throttle = (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
        const currentTime = Date.now();

        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
};

// Hook to check for reduced motion preference
const useReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addListener(handleChange);

        return () => mediaQuery.removeListener(handleChange);
    }, []);

    return prefersReducedMotion;
};

const Navbar = () => {
    const sidebar = useContext(SidebarContext);
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();

    const [translateY, setTranslateY] = useState(0);
    const translateYRef = useRef(0);
    const lastScrollY = useRef(0);
    const debounceTimer = useRef(null);

    // Keep ref in sync with state to avoid stale closures
    useEffect(() => {
        translateYRef.current = translateY;
    }, [translateY]);

    // Reset navbar position if user prefers reduced motion
    useEffect(() => {
        if (prefersReducedMotion) {
            setTranslateY(0);
        }
    }, [prefersReducedMotion]);

    const handleScroll = useCallback(() => {
        // Skip animation if user prefers reduced motion
        if (prefersReducedMotion) {
            return;
        }

        const currentScrollY = window.scrollY;
        const deltaY = currentScrollY - lastScrollY.current;
        const currentTranslateY = translateYRef.current;

        // Always show navbar when near top
        if (currentScrollY < 100) {
            setTranslateY(0);
        } else {
            // Determine scroll direction and update accordingly
            const isScrollingDown = deltaY > 0;
            const isScrollingUp = deltaY < 0;

            if (isScrollingDown && currentTranslateY > -100) {
                // Hide navbar on scroll down (smooth transition)
                const newTranslateY = Math.max(
                    -100,
                    currentTranslateY - Math.abs(deltaY) * 1.2
                );
                setTranslateY(newTranslateY);
            } else if (isScrollingUp && currentTranslateY < 0) {
                // Show navbar on scroll up (smooth transition)
                const newTranslateY = Math.min(
                    0,
                    currentTranslateY + Math.abs(deltaY) * 1.2
                );
                setTranslateY(newTranslateY);
            }
        }

        lastScrollY.current = currentScrollY;

        // Clear previous timeout
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Debounced snap to edge (reduced delay for better UX)
        debounceTimer.current = setTimeout(() => {
            const finalTranslateY = translateYRef.current;

            // More intuitive snap threshold
            if (finalTranslateY > -50) {
                setTranslateY(0); // Snap to visible
            } else {
                setTranslateY(-100); // Snap to hidden
            }
        }, 1200);
    }, [prefersReducedMotion]); // Add dependency

    // Throttled scroll handler for better performance
    const throttledScroll = useCallback(
        throttle(handleScroll, 16), // ~60fps
        [handleScroll]
    );

    useEffect(() => {
        window.addEventListener("scroll", throttledScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", throttledScroll);
            // Cleanup timeout on unmount
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
                debounceTimer.current = null;
            }
        };
    }, [throttledScroll]);

    const sidebarHandler = () => {
        sidebar.toggle();
    };

    const ProfileButton = () => {
        return (
            <FloatingMenu
                boxWidth="w-36"
                label={auth.userName}
                style={`btn-secondary-outline-sharp py-3 text-right`}
                buttons={[
                    {
                        icon: User,
                        label: "Profile",
                        onClick: () => navigate(`/profile/${auth.userId}`),
                    },
                    {
                        icon: LogOut,
                        label: "Logout",
                        variant: "danger",
                        onClick: () => {
                            auth.logout();
                            navigate("/");
                        },
                    },
                ]}
            />
        );
    };

    const navLinks = [
        ...(auth.currentBranchYear
            ? [
                  // { id: 1, name: formatAcademicYear(auth.currentSubBranchYear), path: '/academic', icon: <Calendar /> }
              ]
            : []),
        {
            id: 2,
            name: getUserRoleTitle(auth.userRole),
            path: "",
            icon: <Settings />,
        },
    ];

    return (
        <nav
            className={`fixed top-0 z-20 border-b-2 border-gray-400/10 w-full ${
                prefersReducedMotion
                    ? ""
                    : "transition-all duration-300 ease-out"
            } ${
                sidebar.isSidebarOpen
                    ? "bg-white max-md:bg-gray-400/10"
                    : "bg-white"
            }`}
            style={{
                transform: prefersReducedMotion
                    ? "translateY(0%)"
                    : `translateY(${translateY}%)`,
                willChange: prefersReducedMotion ? "auto" : "transform", // Optimize for transforms only when needed
            }}
        >
            <div className="px-4 mx-auto w-full">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex gap-2 md:gap-6 items-center">
                        <div className="flex shrink-0">
                            <button
                                className="p-2 rounded-full focus:bg-gray-200 hover:outline-hidden hover:ring-1 hover:ring-offset-1 hover:ring-gray-400"
                                onClick={sidebarHandler}
                            >
                                {sidebar.isSidebarOpen ? (
                                    <ChevronLeft size={24} />
                                ) : (
                                    <ChevronRight size={24} />
                                )}
                            </button>
                        </div>

                        <BackButton />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.id}
                                to={link.path}
                                className={`btn-secondary-outline-sharp py-3`}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        <ProfileButton />
                    </div>

                    {/* Mobile Navigation Icons */}
                    <div className="align-center md:hidden flex space-x-4">
                        {/* {navLinks.map((link) => (
                            <NavLink
                                key={link.id}
                                to={link.path}
                                className={({ isActive }) =>
                                    `p-2 rounded-md ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-primary hover:text-white'}`
                                }
                            >
                                {link.icon}
                            </NavLink>
                        ))} */}
                        <ProfileButton />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
