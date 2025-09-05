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

// Helper: fetch an image (relative or absolute URL) and return a data URL (base64) for embedding
export async function getImageDataUrl(path, options = {}) {
    try {
        const res = await api.get(path, { responseType: "blob", withCredentials: true, ...options });
        const blob = res.data;

        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (err) {
        // Let the caller decide how to handle failures (they may want to fall back to absolute URL etc.)
        throw err;
    }
}
