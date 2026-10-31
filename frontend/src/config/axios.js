import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT token automatically
api.interceptors.request.use(
    (config) => {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNWU3NWZiZS1hOTk3LTQwNGMtOGJhNy0zOWIxZGM0ZWRlM2QiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3OTM0MzE0MzUsImV4cCI6MTc5MzUxNzgzNX0.eSRnQQOCT0SG9wlOvi9i8SVK0TaaFbKEN525ymI73ms";

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;