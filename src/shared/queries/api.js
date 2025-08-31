import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}`
        : "/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Basic error handling interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);

// Request interceptor to add authorization token
api.interceptors.request.use(
    (config) => {
        const token = JSON.parse(localStorage.getItem("userData")).token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
