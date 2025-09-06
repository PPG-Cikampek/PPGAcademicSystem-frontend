import { createContext, useContext, useState } from "react";

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
    token: null,
    login: () => {},
    logout: () => {},
    setAttributes: () => {},
});
