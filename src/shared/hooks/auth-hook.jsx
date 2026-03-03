import { useState, useCallback, useEffect, useRef } from "react";
import { setApiToken, setOnUnauthorized } from "../queries/api";
import iamApi from "../queries/iam-api";

const IAM_URL = import.meta.env.VITE_IAM_URL || "http://localhost:3001";
const CALLBACK_PATH = "/auth/callback";

// Silent-refresh timer
let refreshTimer = null;

export const useAuth = () => {
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState(null);
    const [userBranchId, setUserBranchId] = useState(null);
    const [userSubBranchId, setUserSubBranchId] = useState(null);
    const [currentBranchYear, setCurrentBranchYear] = useState(null);
    const [currentBranchYearId, setCurrentBranchYearId] = useState(null);
    const [userClassIds, setUserClassIds] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const isRefreshing = useRef(false);

    // ─── helpers ─────────────────────────

    const clearState = useCallback(() => {
        setUserId(null);
        setUserRole(null);
        setUserName(null);
        setUserBranchId(null);
        setUserSubBranchId(null);
        setCurrentBranchYear(null);
        setCurrentBranchYearId(null);
        setUserClassIds([]);
        setApiToken(null);
        sessionStorage.removeItem("iam_access_token");
        localStorage.removeItem("userData");
        clearInterval(refreshTimer);
    }, []);

    const persistState = useCallback(
        (profile) => {
            localStorage.setItem(
                "userData",
                JSON.stringify({
                    userId: profile.userId,
                    role: profile.role,
                    name: profile.name,
                    branchId: profile.branchId,
                    subBranchId: profile.subBranchId,
                    currentBranchYear: profile.currentBranchYear,
                    currentBranchYearId: profile.currentBranchYearId,
                    userClassIds: profile.userClassIds,
                })
            );
        },
        []
    );

    const applyProfile = useCallback(
        (profile, token) => {
            setApiToken(token);
            sessionStorage.setItem("iam_access_token", token);
            setUserId(profile.userId);
            setUserRole(profile.role);
            setUserName(profile.name);
            setUserBranchId(profile.branchId || null);
            setUserSubBranchId(profile.subBranchId || null);
            setCurrentBranchYear(profile.currentBranchYear || null);
            setCurrentBranchYearId(profile.currentBranchYearId || null);
            setUserClassIds(profile.userClassIds || []);
            persistState(profile);
        },
        [persistState]
    );

    // ─── silent refresh ─────────────────
    const silentRefresh = useCallback(async () => {
        if (isRefreshing.current) return;
        isRefreshing.current = true;
        try {
            const res = await iamApi.post("/api/auth/refresh");
            if (res.data?.accessToken) {
                setApiToken(res.data.accessToken);
                sessionStorage.setItem("iam_access_token", res.data.accessToken);
            }
        } catch {
            // refresh failed — session expired
            clearState();
        } finally {
            isRefreshing.current = false;
        }
    }, [clearState]);

    const startRefreshCycle = useCallback(() => {
        clearInterval(refreshTimer);
        // refresh every 13 min (access token lives 15 min)
        refreshTimer = setInterval(silentRefresh, 13 * 60 * 1000);
    }, [silentRefresh]);

    // ─── public API ─────────────────────

    const redirectToLogin = useCallback(() => {
        const callbackUrl = `${window.location.origin}${CALLBACK_PATH}`;
        window.location.href = `${IAM_URL}/login?redirect_uri=${encodeURIComponent(callbackUrl)}`;
    }, []);

    const handleCallback = useCallback(
        async (accessToken) => {
            setApiToken(accessToken);
            sessionStorage.setItem("iam_access_token", accessToken);

            // Fetch user profile from IAM
            let userProfile;
            try {
                const meRes = await iamApi.get("/api/auth/me");
                if (!meRes.data?.authenticated) throw new Error("Not authenticated");
                userProfile = meRes.data.user;
            } catch {
                clearState();
                throw new Error("Failed to fetch user profile from IAM");
            }

            const profile = {
                userId: userProfile.userId || userProfile._id,
                role: userProfile.role,
                name: userProfile.name,
                email: userProfile.email,
                branchId: userProfile.branchId || null,
                subBranchId: userProfile.subBranchId || null,
                currentBranchYear: null,
                currentBranchYearId: null,
                userClassIds: [],
            };

            applyProfile(profile, accessToken);
            startRefreshCycle();

            return profile;
        },
        [applyProfile, startRefreshCycle, clearState]
    );

    const login = useCallback(
        (profile, token) => {
            applyProfile(profile, token);
            startRefreshCycle();
        },
        [applyProfile, startRefreshCycle]
    );

    const logout = useCallback(async () => {
        try {
            await iamApi.post("/api/auth/logout");
        } catch {
            // ignore — best-effort
        }
        clearState();
        window.location.href = "/";
    }, [clearState]);

    // ─── 401 interceptor ────────────────
    useEffect(() => {
        setOnUnauthorized(async (error) => {
            try {
                await silentRefresh();
                // Retry original request with new token
                const config = error.config;
                const token = sessionStorage.getItem("iam_access_token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    const axios = (await import("axios")).default;
                    return axios(config);
                }
            } catch {
                clearState();
                redirectToLogin();
            }
            return null;
        });

        return () => setOnUnauthorized(null);
    }, [silentRefresh, clearState, redirectToLogin]);

    // ─── restore on mount ───────────────
    useEffect(() => {
        const restore = async () => {
            const savedToken = sessionStorage.getItem("iam_access_token");
            const savedData = localStorage.getItem("userData");

            if (savedToken && savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setApiToken(savedToken);
                    setUserId(parsed.userId);
                    setUserRole(parsed.role);
                    setUserName(parsed.name);
                    setUserBranchId(parsed.branchId || null);
                    setUserSubBranchId(parsed.subBranchId || null);
                    setCurrentBranchYear(parsed.currentBranchYear || null);
                    setCurrentBranchYearId(parsed.currentBranchYearId || null);
                    setUserClassIds(parsed.userClassIds || []);
                    startRefreshCycle();
                } catch {
                    clearState();
                }
            }
            setIsInitialized(true);
        };

        restore();
        return () => clearInterval(refreshTimer);
    }, [clearState, startRefreshCycle]);

    const setAttributes = useCallback(
        (branchId, subBranchId, classIds, branchYear, branchYearId) => {
            setUserBranchId(branchId);
            setUserSubBranchId(subBranchId);
            setUserClassIds(classIds);
            setCurrentBranchYear(branchYear || null);
            setCurrentBranchYearId(branchYearId || null);

            // Also update persisted data
            try {
                const saved = JSON.parse(localStorage.getItem("userData") || "{}");
                saved.branchId = branchId;
                saved.subBranchId = subBranchId;
                saved.userClassIds = classIds;
                saved.currentBranchYear = branchYear || null;
                saved.currentBranchYearId = branchYearId || null;
                localStorage.setItem("userData", JSON.stringify(saved));
            } catch {
                // ignore
            }
        },
        []
    );

    return {
        isLoggedIn: !!userId,
        login,
        logout,
        redirectToLogin,
        handleCallback,
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
