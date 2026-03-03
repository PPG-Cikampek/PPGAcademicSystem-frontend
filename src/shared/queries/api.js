import axios from "axios";

let currentToken = null;

export function setApiToken(token) {
    currentToken = token;
}

export function getApiToken() {
    return currentToken;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}`
        : "/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Inject access token into every request
api.interceptors.request.use(
    (config) => {
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 401 handler — notify listeners so auth-hook can attempt refresh
let onUnauthorized = null;

export function setOnUnauthorized(callback) {
    onUnauthorized = callback;
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && onUnauthorized) {
            const retried = await onUnauthorized(error);
            if (retried) return retried;
        }
        return Promise.reject(error);
    }
);

export default api;
