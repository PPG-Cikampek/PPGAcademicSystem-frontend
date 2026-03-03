import axios from "axios";

const iamApi = axios.create({
    baseURL: import.meta.env.VITE_IAM_URL || "http://localhost:3001",
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default iamApi;
