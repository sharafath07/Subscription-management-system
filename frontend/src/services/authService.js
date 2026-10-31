
import api from "../config/axios";

// LOGIN
export const loginUser = async (email, password) => {
    const response = await api.post("/auth/login", {
        email,
        password,
    });

    return response.data;
};

// REGISTER
export const registerUser = async (userData) => {
    const response = await api.post("/auth/register", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
    });

    return response.data;
};


// GET CURRENT LOGGED-IN USER
export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");

    return response.data;
};

// LOGOUT
export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};
