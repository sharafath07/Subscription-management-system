
import api from "../config/axios.js";

// Get all plans
export const getPlans = async () => {
    const response = await api.get("/plans");
    return response.data;
};

// Get one plan by ID
export const getPlanById = async (id) => {
    const response = await api.get(`/plans/${id}`);
    return response.data;
};

// Create a new plan
export const createPlan = async (planData) => {
    const response = await api.post("/plans", planData);
    return response.data;
};

// Update an existing plan
export const updatePlan = async (id, planData) => {
    const response = await api.put(`/plans/${id}`, planData);
    return response.data;
};

// Deactivate a plan
export const deletePlan = async (id) => {
    const response = await api.delete(`/plans/${id}`);
    return response.data;
};
