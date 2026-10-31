
import api from "../config/axios.js";

// GET all payments
export const getPayments = async () => {
    const response = await api.get("/payments");
    return response.data;
};

// GET payment by ID
export const getPaymentById = async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
};

// GET payments by method
export const getPaymentsByMethod = async (method) => {
    const response = await api.get("/payments", {
        params: { method },
    });

    return response.data;
};

// GET payments by status
export const getPaymentsByStatus = async (status) => {
    const response = await api.get("/payments", {
        params: { status },
    });

    return response.data;
};

// GET payments by invoice ID
export const getPaymentsByInvoice = async (invoiceId) => {
    const response = await api.get("/payments", {
        params: { invoiceId },
    });

    return response.data;
};

// POST record a new payment
export const createPayment = async (paymentData) => {
    const response = await api.post("/payments", paymentData);
    return response.data;
};
