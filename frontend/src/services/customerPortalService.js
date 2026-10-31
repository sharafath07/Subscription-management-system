
import api from "../config/axios";

// 1. Get logged-in customer's profile
export const getCustomerProfile = async () => {
    const response = await api.get("/customer/me");
    return response.data;
};

// 2. Get available products
export const getCustomerProducts = async () => {
    const response = await api.get("/customer/products");
    return response.data;
};

// 3. Get available plans
export const getCustomerPlans = async () => {
    const response = await api.get("/customer/plans");
    return response.data;
};

// 4. Get customer's subscriptions
export const getCustomerSubscriptions = async () => {
    const response = await api.get("/customer/subscriptions");
    return response.data;
};

// 5. Get customer's invoices
export const getCustomerInvoices = async () => {
    const response = await api.get("/customer/invoices");
    return response.data;
};

// 6. Get customer's payments
export const getCustomerPayments = async () => {
    const response = await api.get("/customer/payments");
    return response.data;
};
