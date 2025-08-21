import { useState, useCallback, useEffect } from "react";

let logoutTimer;

export const useAuth = () => {
    const [token, setToken] = useState();
    const [tokenExpirationDate, setTokenExpirationDate] = useState();
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState(null);
    const [userBranchId, setUserBranchId] = useState(null);
    const [userSubBranchId, setUserSubBranchId] = useState(null);
    const [currentBranchYear, setCurrentBranchYear] = useState(null);
    const [currentBranchYearId, setCurrentBranchYearId] = useState(null);
    const [userClassIds, setUserClassIds] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const login = useCallback(
        (
            uId,
            role,
            name,
            branchId,
            subBranchId,
            currentBranchYear,
            currentBranchYearId,
            userClassIds,
            token,
            expirationDate
        ) => {
            setUserRole(role);
            setToken(token);
            setUserId(uId);
            setUserName(name);
            setUserBranchId(branchId);
            setUserSubBranchId(subBranchId);
            setCurrentBranchYear(currentBranchYear);
            setCurrentBranchYearId(currentBranchYearId);
            setUserClassIds(userClassIds);

            const tokenExpirationDate =
                expirationDate ||
                new Date(new Date().getTime() + 1000 * 60 * 60 * 2);
            setTokenExpirationDate(tokenExpirationDate);
            localStorage.setItem(
                "userData",
                JSON.stringify({
                    userId: uId,
                    name: name,
                    role: role,
                    branchId: branchId,
                    subBranchId: subBranchId,
                    currentBranchYear: currentBranchYear,
                    currentBranchYearId: currentBranchYearId,
                    userClassIds: userClassIds,
                    token: token,
                    expiration: tokenExpirationDate.toISOString(),
                })
            );
        },
        []
    );

    const logout = useCallback(() => {
        setToken(null);
        setUserId(null);
        setUserRole(null);
        setUserName(null);
        setUserBranchId(null);
        setUserSubBranchId(null);
        setCurrentBranchYear(null);
        setCurrentBranchYearId(null);
        setUserClassIds(null);

        setTokenExpirationDate(null);
        localStorage.removeItem("userData");
    }, []);

    useEffect(() => {
        if (token && tokenExpirationDate) {
            const remainingTime =
                tokenExpirationDate.getTime() - new Date().getTime();
            logoutTimer = setTimeout(logout, remainingTime);
        } else {
            clearTimeout(logoutTimer);
        }
    }, [token, logout, tokenExpirationDate]);

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = () => {
            try {
                const storedData = localStorage.getItem("userData");

                if (!storedData) {
                    // No stored data, user is not logged in
                    if (isMounted) {
                        setIsInitialized(true);
                    }
                    return;
                }

                const parsedData = JSON.parse(storedData);

                // Validate stored data structure
                if (
                    !parsedData ||
                    !parsedData.token ||
                    !parsedData.expiration ||
                    !parsedData.role
                ) {
                    // Invalid stored data, clear it
                    localStorage.removeItem("userData");
                    if (isMounted) {
                        setIsInitialized(true);
                    }
                    return;
                }

                // Check if token is expired
                const expirationDate = new Date(parsedData.expiration);
                if (expirationDate <= new Date()) {
                    // Token expired, clear stored data
                    localStorage.removeItem("userData");
                    if (isMounted) {
                        setIsInitialized(true);
                    }
                    return;
                }

                // Valid stored data, restore auth state
                if (isMounted) {
                    login(
                        parsedData.userId,
                        parsedData.role,
                        parsedData.name,
                        parsedData.branchId,
                        parsedData.subBranchId,
                        parsedData.currentBranchYear,
                        parsedData.currentBranchYearId,
                        parsedData.userClassIds,
                        parsedData.token,
                        expirationDate
                    );
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error(
                    "Error initializing auth from localStorage:",
                    error
                );
                // Clear potentially corrupted data
                localStorage.removeItem("userData");
                if (isMounted) {
                    setIsInitialized(true);
                }
            }
        };

        initializeAuth();

        return () => {
            isMounted = false;
        };
    }, [login]);

    const setAttributes = useCallback((branchId, subBranchId, userClassIds) => {
        setUserBranchId(branchId);
        setUserSubBranchId(subBranchId);
        setUserClassIds(userClassIds);
    }, []);

    return {
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
    };
};
