import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    timeout: 10000,
});

// Basic error handling interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);

export default api;
