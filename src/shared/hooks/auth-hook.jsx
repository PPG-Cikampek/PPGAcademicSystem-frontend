import React, { useState, useCallback, useEffect } from "react";

let logoutTimer;

export const useAuth = () => {
    const [token, setToken] = useState();
    const [tokenExpirationDate, setTokenExpirationDate] = useState()
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState(null);
    const [userBranchId, setUserBranchId] = useState(null);
    const [userSubBranchId, setUserSubBranchId] = useState(null);
    const [currentBranchYear, setCurrentBranchYear] = useState(null);
    const [currentBranchYearId, setCurrentBranchYearId] = useState(null);
    const [userClassIds, setUserClassIds] = useState([]);

    const login = useCallback((uId, role, name, branchId, subBranchId, currentBranchYear, currentBranchYearId, userClassIds, token, expirationDate) => {
        setUserRole(role)
        setToken(token);
        setUserId(uId);
        setUserName(name)
        setUserBranchId(branchId)
        setUserSubBranchId(subBranchId)
        setCurrentBranchYear(currentBranchYear)
        setCurrentBranchYearId(currentBranchYearId)
        setUserClassIds(userClassIds)

        const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60 * 2)
        setTokenExpirationDate(tokenExpirationDate)
        localStorage.setItem(
            'userData',
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
                expiration: tokenExpirationDate.toISOString()
            })
        )
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUserId(null);
        setUserRole(null)
        setUserName(null)
        setUserBranchId(null)
        setUserSubBranchId(null)
        setCurrentBranchYear(null)
        setCurrentBranchYearId(null)
        setUserClassIds(null)

        setTokenExpirationDate(null)
        localStorage.removeItem('userData');
    }, []);

    useEffect(() => {
        if (token && tokenExpirationDate) {
            const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
            logoutTimer = setTimeout(logout, remainingTime);
        } else {
            clearTimeout(logoutTimer);
        }
    }, [token, logout, tokenExpirationDate]);

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('userData'));
        if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
            login(
                storedData.userId,
                storedData.role,
                storedData.name,
                storedData.branchId,
                storedData.subBranchId,
                storedData.currentBranchYear,
                storedData.currentBranchYearId,
                storedData.userClassIds,
                storedData.token,
                new Date(storedData.expiration)
            )
        }
    }, [login]);

    const setAttributes = useCallback((branchId, subBranchId, userClassIds) => {
        setUserBranchId(branchId)
        setUserSubBranchId(subBranchId)
        setUserClassIds(userClassIds)
    }, []);

    return { token, login, logout, userId, userRole, userName, userBranchId, userSubBranchId, currentBranchYear, currentBranchYearId, userClassIds, setAttributes }
}
