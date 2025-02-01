import React, { useState, useCallback, useEffect } from "react";

let logoutTimer;

export const useAuth = () => {
    const [token, setToken] = useState();
    const [tokenExpirationDate, setTokenExpirationDate] = useState()
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState(null);
    const [userBranchId, setUserBranchId] = useState(null);
    const [userTeachingGroupId, setUserTeachingGroupId] = useState(null);
    const [currentTeachingGroupYear, setCurrentTeachingGroupYear] = useState(null);
    const [userClassIds, setUserClassIds] = useState([]);

    const login = useCallback((uId, role, name, branchId, teachingGroupId, currentTeachingGroupYear, userClassIds, token, expirationDate) => {
        if (role === 'teachingGroupAdmin') {
            setUserRole('admin kelompok')
        } else {
            setUserRole(role)
        }
        setToken(token);
        setUserId(uId);
        setUserName(name)
        setUserBranchId(branchId)
        setUserTeachingGroupId(teachingGroupId)
        setCurrentTeachingGroupYear(currentTeachingGroupYear)
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
                teachingGroupId: teachingGroupId,
                currentTeachingGroupYear: currentTeachingGroupYear,
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
        setUserTeachingGroupId(null)
        setCurrentTeachingGroupYear(null)
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
            login(storedData.userId, storedData.role, storedData.name, storedData.branchId, storedData.teachingGroupId, storedData.currentTeachingGroupYear, storedData.userClassIds, storedData.token, new Date(storedData.expiration))
        }
    }, [login]);

    const setAttributes = useCallback((branchId, teachingGroupId, userClassIds) => {
        setUserBranchId(branchId)
        setUserTeachingGroupId(teachingGroupId)
        setUserClassIds(userClassIds)
    }, []);

    return { token, login, logout, userId, userRole, userName, userBranchId, userTeachingGroupId, currentTeachingGroupYear, userClassIds, setAttributes }
}
