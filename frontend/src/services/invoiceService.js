
import api from "../config/axios.js";

// GET all invoices
export const getInvoices = async () => {
    const response = await api.get("/invoices");
    return response.data;
};

// GET one invoice by ID
export const getInvoiceById = async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
};

// POST create invoice
export const createInvoice = async (invoiceData) => {
    const response = await api.post("/invoices", invoiceData);
    return response.data;
};

// POST generate invoice from subscription
export const generateInvoice = async (subscriptionId) => {
    const response = await api.post(
        `/invoices/generate/${subscriptionId}`
    );

    return response.data;
};

// PATCH update invoice status
export const updateInvoiceStatus = async (id, status) => {
    const response = await api.patch(
        `/invoices/${id}/status`,
        { status }
    );

    return response.data;
};

// DELETE invoice
export const deleteInvoice = async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
};
