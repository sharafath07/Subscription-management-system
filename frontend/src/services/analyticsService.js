
import api from "../config/axios.js";

// GET /api/analytics/dashboard
export const getDashboardAnalytics = async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
};

// GET /api/analytics/revenue
export const getRevenueAnalytics = async () => {
    const response = await api.get("/analytics/revenue");
    return response.data;
};

// GET /api/analytics/recent-payments?limit=5
export const getRecentPayments = async (limit = 5) => {
    const response = await api.get("/analytics/recent-payments", {
        params: { limit },
    });
    return response.data;
};
