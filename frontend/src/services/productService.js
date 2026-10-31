import api from "../config/axios";

// GET all products
export const getProducts = async () => {
    const response = await api.get("/products");
    return response.data;
};

// GET one product
export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

// POST create product
export const createProduct = async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
};

// PUT update product
export const updateProduct = async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
};

// DELETE product
export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};