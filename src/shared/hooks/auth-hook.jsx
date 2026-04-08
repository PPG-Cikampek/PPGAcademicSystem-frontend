import { useState, useCallback, useEffect, useRef } from "react";
import { setApiToken, setOnUnauthorized } from "../queries/api";
import iamApi from "../queries/iam-api";

const IAM_URL = import.meta.env.VITE_IAM_URL || "http://localhost:3001";
const IAM_CLIENT_ID = import.meta.env.VITE_IAM_CLIENT_ID || "academic-system";
const CALLBACK_PATH = "/auth/callback";
const OAUTH_STATE_KEY = "academic_oauth_state";
const PKCE_VERIFIER_KEY = "academic_pkce_verifier";
const TOKENS_STORAGE_KEY = "oauthTokens";

// Silent-refresh timer
let refreshTimer = null;

// Deduplicate callback processing by OAuth code+state so React StrictMode
// extra effect cycles in development don't exchange the same code twice.
const callbackInFlight = new Map();

const toBase64Url = (uint8Array) => {
    let binary = "";
    uint8Array.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const randomString = (length = 64) => {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return toBase64Url(bytes).slice(0, length);
};

const createCodeChallenge = async (codeVerifier) => {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toBase64Url(new Uint8Array(digest));
};

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
    const isHydrating = useRef(false);
    const isLoggingOut = useRef(false);
    const authVersion = useRef(0);

    // ─── helpers ─────────────────────────

    const clearState = useCallback(() => {
        authVersion.current += 1;
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
        localStorage.removeItem(TOKENS_STORAGE_KEY);
        sessionStorage.removeItem(OAUTH_STATE_KEY);
        sessionStorage.removeItem(PKCE_VERIFIER_KEY);
        localStorage.removeItem("userData");
        clearInterval(refreshTimer);
        refreshTimer = null;
        isRefreshing.current = false;
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
            if (isLoggingOut.current) return;
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
        if (isRefreshing.current || isLoggingOut.current) return;

        const refreshStartVersion = authVersion.current;
        isRefreshing.current = true;
        try {
            const tokenRaw = localStorage.getItem(TOKENS_STORAGE_KEY);
            let refreshToken = null;

            if (tokenRaw) {
                try {
                    refreshToken = JSON.parse(tokenRaw).refreshToken;
                } catch {
                    refreshToken = null;
                }
            }

            if (!refreshToken) {
                throw new Error("No refresh token");
            }

            const params = new URLSearchParams({
                grant_type: "refresh_token",
                client_id: IAM_CLIENT_ID,
                refresh_token: refreshToken,
            });

            const res = await iamApi.post("/oauth/token", params.toString(), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            if (res.data?.access_token) {
                if (
                    isLoggingOut.current ||
                    refreshStartVersion !== authVersion.current
                ) {
                    return;
                }

                setApiToken(res.data.access_token);
                sessionStorage.setItem("iam_access_token", res.data.access_token);
                localStorage.setItem(
                    TOKENS_STORAGE_KEY,
                    JSON.stringify({
                        accessToken: res.data.access_token,
                        refreshToken: res.data.refresh_token,
                        idToken: res.data.id_token,
                    })
                );
            }
        } catch {
            // refresh failed — session expired
            if (!isLoggingOut.current) {
                clearState();
            }
        } finally {
            isRefreshing.current = false;
        }
    }, [clearState]);

    const startRefreshCycle = useCallback(() => {
        if (isLoggingOut.current) return;
        clearInterval(refreshTimer);
        // refresh every 13 min (access token lives 15 min)
        refreshTimer = setInterval(silentRefresh, 13 * 60 * 1000);
    }, [silentRefresh]);

    // ─── public API ─────────────────────

    const redirectToLogin = useCallback(() => {
        if (isLoggingOut.current) return;

        const startAuthorize = async () => {
            const callbackUrl = `${window.location.origin}${CALLBACK_PATH}`;
            const state = randomString(32);
            const codeVerifier = randomString(64);
            const codeChallenge = await createCodeChallenge(codeVerifier);

            sessionStorage.setItem(OAUTH_STATE_KEY, state);
            sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);

            const params = new URLSearchParams({
                response_type: "code",
                client_id: IAM_CLIENT_ID,
                redirect_uri: callbackUrl,
                scope: "openid profile email",
                state,
                code_challenge: codeChallenge,
                code_challenge_method: "S256",
            });

            window.location.href = `${IAM_URL}/oauth/authorize?${params.toString()}`;
        };

        startAuthorize().catch(() => {
            if (!isLoggingOut.current) {
                clearState();
            }
        });
    }, [clearState]);

    const handleCallback = useCallback(
        async ({ code, state }) => {
            const callbackKey = `${code}:${state}`;
            const inFlight = callbackInFlight.get(callbackKey);
            if (inFlight) {
                return inFlight;
            }

            const callbackPromise = (async () => {
                const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
                const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);

                if (!expectedState || expectedState !== state) {
                    throw new Error("OAuth state mismatch");
                }

                if (!codeVerifier) {
                    throw new Error("PKCE verifier is missing");
                }

                const callbackUrl = `${window.location.origin}${CALLBACK_PATH}`;
                const params = new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: callbackUrl,
                    client_id: IAM_CLIENT_ID,
                    code_verifier: codeVerifier,
                });

                const tokenRes = await iamApi.post("/oauth/token", params.toString(), {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });

                const accessToken = tokenRes.data?.access_token;
                if (!accessToken) {
                    throw new Error("Token exchange failed");
                }

                setApiToken(accessToken);
                sessionStorage.setItem("iam_access_token", accessToken);
                localStorage.setItem(
                    TOKENS_STORAGE_KEY,
                    JSON.stringify({
                        accessToken,
                        refreshToken: tokenRes.data?.refresh_token,
                        idToken: tokenRes.data?.id_token,
                    })
                );

                sessionStorage.removeItem(OAUTH_STATE_KEY);
                sessionStorage.removeItem(PKCE_VERIFIER_KEY);

                // Fetch user profile from IAM
                let userProfile;
                try {
                    const userInfoRes = await iamApi.get("/oauth/userinfo", {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    userProfile = userInfoRes.data;
                    if (!userProfile?.sub || !userProfile?.role) {
                        throw new Error("Incomplete userinfo response");
                    }
                } catch {
                    try {
                        const meRes = await iamApi.get("/api/auth/me");
                        if (!meRes.data?.authenticated) throw new Error("Not authenticated");
                        userProfile = meRes.data.user;
                    } catch {
                        clearState();
                        throw new Error("Failed to fetch user profile from IAM");
                    }
                }

                const profile = {
                    userId: userProfile.userId || userProfile._id || userProfile.sub,
                    role: userProfile.role,
                    name: userProfile.name || "",
                    email: userProfile.email || "",
                    branchId: userProfile.branchId || userProfile.branch_id || null,
                    subBranchId: userProfile.subBranchId || userProfile.sub_branch_id || null,
                    currentBranchYear: null,
                    currentBranchYearId: null,
                    userClassIds: [],
                };

                applyProfile(profile, accessToken);
                startRefreshCycle();

                return profile;
            })();

            callbackInFlight.set(callbackKey, callbackPromise);

            try {
                return await callbackPromise;
            } finally {
                callbackInFlight.delete(callbackKey);
            }
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

    const logout = useCallback(() => {
        if (isLoggingOut.current) return;
        isLoggingOut.current = true;
        clearState();

        try {
            const logoutUrl = new URL(`${IAM_URL}/oauth/logout`);
            logoutUrl.searchParams.set("client_id", IAM_CLIENT_ID);
            logoutUrl.searchParams.set("post_logout_redirect_uri", window.location.origin);

            const tokenRaw = localStorage.getItem(TOKENS_STORAGE_KEY);
            if (tokenRaw) {
                try {
                    const tokenState = JSON.parse(tokenRaw);
                    if (tokenState?.idToken) {
                        logoutUrl.searchParams.set("id_token_hint", tokenState.idToken);
                    }
                } catch {
                    // ignore malformed token cache
                }
            }

            window.location.replace(logoutUrl.toString());
        } catch {
            // Fallback to local root if IAM logout URL construction/navigation fails.
            isLoggingOut.current = false;
            window.location.replace(window.location.origin);
        }
    }, [clearState]);

    // ─── 401 interceptor ────────────────
    useEffect(() => {
        setOnUnauthorized(async (error) => {
            if (isLoggingOut.current) {
                return null;
            }

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
                if (!isLoggingOut.current) {
                    clearState();
                    redirectToLogin();
                }
            }
            return null;
        });

        return () => setOnUnauthorized(null);
    }, [silentRefresh, clearState, redirectToLogin]);

    // ─── restore on mount ───────────────
    useEffect(() => {
        const restore = async () => {
            if (isHydrating.current) return;
            isHydrating.current = true;

            const savedToken = sessionStorage.getItem("iam_access_token");
            const savedData = localStorage.getItem("userData");
            const savedOauthTokens = localStorage.getItem(TOKENS_STORAGE_KEY);

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
            } else if (savedOauthTokens) {
                try {
                    await silentRefresh();
                    const meRes = await iamApi.get("/api/auth/me");
                    if (meRes.data?.authenticated) {
                        const userProfile = meRes.data.user;
                        const hydratedToken = sessionStorage.getItem("iam_access_token");

                        if (!hydratedToken) {
                            throw new Error("Missing hydrated token");
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

                        applyProfile(profile, hydratedToken);
                        startRefreshCycle();
                    } else {
                        clearState();
                    }
                } catch {
                    clearState();
                }
            }
            setIsInitialized(true);
            isHydrating.current = false;
        };

        restore();
        return () => clearInterval(refreshTimer);
    }, [applyProfile, clearState, silentRefresh, startRefreshCycle]);

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
