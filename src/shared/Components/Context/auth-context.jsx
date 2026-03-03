import { createContext } from "react";

export const AuthContext = createContext({
    isLoggedIn: false,
    userId: null,
    userRole: null,
    userName: null,
    userBranchId: null,
    userSubBranchId: null,
    currentBranchYear: null,
    currentBranchYearId: null,
    userClassIds: [],
    isInitialized: false,
    login: () => {},
    logout: () => {},
    redirectToLogin: () => {},
    handleCallback: () => {},
    setAttributes: () => {},
});
