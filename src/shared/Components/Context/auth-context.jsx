import React, { createContext, useContext, useState } from 'react';

export const AuthContext = createContext({
    isLoggedIn: false,
    userId: null,
    userRole: null,
    userName: null,
    userBranchId: null,
    userTeachingGroupId: null,
    currentTeachingGroupYear: null,
    currentTeachingGroupYearId: null,
    userClassIds: [],
    token: null,
    login: () => {},
    logout: () => {},
    setAttributes: () => {}
});