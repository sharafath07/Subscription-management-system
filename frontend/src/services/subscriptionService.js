
import api from "../config/axios";

// GET all subscriptions with optional filters
export const getSubscriptions = async (filters = {}) => {
    const response = await api.get("/subscriptions", {
        params: filters,
    });

    return response.data;
};

// GET subscription by ID
export const getSubscriptionById = async (id) => {
    const response = await api.get(`/subscriptions/${id}`);

    return response.data;
};

// CREATE subscription
export const createSubscription = async (subscriptionData) => {
    const response = await api.post(
        "/subscriptions",
        subscriptionData
    );

    return response.data;
};

// UPDATE subscription
export const updateSubscription = async (id, subscriptionData) => {
    const response = await api.put(
        `/subscriptions/${id}`,
        subscriptionData
    );

    return response.data;
};

// CHANGE subscription status
export const updateSubscriptionStatus = async (id, status) => {
    const response = await api.patch(
        `/subscriptions/${id}/status`,
        { status }
    );

    return response.data;
};

// DELETE subscription
export const deleteSubscription = async (id) => {
    const response = await api.delete(`/subscriptions/${id}`);

    return response.data;
};
