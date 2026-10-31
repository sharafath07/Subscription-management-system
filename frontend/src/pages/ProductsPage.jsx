
import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Package,
    Pencil,
    Trash2,
    X,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    LoaderCircle,
    Boxes,
} from "lucide-react";

import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../services/productService";

function ProductsPage() {
    // Product data
    const [products, setProducts] = useState([]);

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Search
    const [search, setSearch] = useState("");

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Product form
    const emptyForm = {
        name: "",
        description: "",
    };

    const [form, setForm] = useState(emptyForm);

    // GET products from backend
    const fetchProducts = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getProducts();

            if (!response.success || !Array.isArray(response.products)) {
                throw new Error("Invalid products response from server.");
            }

            setProducts(response.products);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch products when page opens
    useEffect(() => {
        fetchProducts();
    }, []);

    // Search products
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const name = product.name || "";
            const description = product.description || "";

            return (
                name.toLowerCase().includes(search.toLowerCase()) ||
                description.toLowerCase().includes(search.toLowerCase())
            );
        });
    }, [products, search]);

    // Summary calculations
    const totalProducts = products.length;

    const activeProducts = products.filter(
        (product) => product.isActive
    ).length;

    const inactiveProducts = products.filter(
        (product) => !product.isActive
    ).length;

    // Open create modal
    const openAddModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setIsModalOpen(true);
    };

    // Open edit modal
    const openEditModal = (product) => {
        setEditingId(product.id);

        setForm({
            name: product.name || "",
            description: product.description || "",
        });

        setError("");
        setIsModalOpen(true);
    };

    // Handle form changes
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // CREATE or UPDATE product
    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");

        const productData = {
            name: form.name.trim(),
            description: form.description.trim(),
        };

        try {
            if (editingId) {
                await updateProduct(editingId, productData);
                setMessage("Product updated successfully.");
            } else {
                await createProduct(productData);
                setMessage("Product created successfully.");
            }

            setIsModalOpen(false);
            setForm(emptyForm);
            setEditingId(null);

            await fetchProducts();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to save product."
            );
        } finally {
            setSaving(false);
        }
    };

    // DELETE product
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        setDeletingId(id);
        setError("");
        setMessage("");

        try {
            await deleteProduct(id);

            setMessage("Product deleted successfully.");

            await fetchProducts();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to delete product."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

            {/* PAGE HEADER */}
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                    <p className="mb-2 text-sm text-slate-400">
                        Management / Products
                    </p>

                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        Products
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Manage your software products and descriptions.
                    </p>
                </div>

                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Add Product
                </button>

            </div>

            {/* NOTIFICATIONS */}
            {message && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    <CheckCircle2 size={18} />
                    {message}
                    <button
                        onClick={() => setMessage("")}
                        className="ml-auto"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {error && !isModalOpen && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle size={18} />
                    {error}
                    <button
                        onClick={() => setError("")}
                        className="ml-auto"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* SUMMARY CARDS */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

                <SummaryCard
                    title="Total Products"
                    value={totalProducts}
                    icon={<Package size={22} />}
                    color="bg-blue-50 text-blue-600"
                />

                <SummaryCard
                    title="Active Products"
                    value={activeProducts}
                    icon={<CheckCircle2 size={22} />}
                    color="bg-green-50 text-green-600"
                />

                <SummaryCard
                    title="Inactive Products"
                    value={inactiveProducts}
                    icon={<Boxes size={22} />}
                    color="bg-orange-50 text-orange-600"
                />

            </div>

            {/* PRODUCT TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* TABLE HEADER */}
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">

                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Product Catalog
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Products stored in your database.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">

                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                            />
                        </div>

                        <button
                            onClick={fetchProducts}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                    </div>

                </div>

                {/* TABLE CONTENT */}
                <div className="overflow-x-auto">

                    <table className="w-full min-w-[750px] text-left">

                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Product</th>
                                <th className="px-6 py-4 font-semibold">Description</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Created</th>
                                <th className="px-6 py-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {!loading && filteredProducts.map((product) => (

                                <tr
                                    key={product.id}
                                    className="transition hover:bg-slate-50"
                                >

                                    <td className="px-6 py-4">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <Package size={20} />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-800">
                                                    {product.name}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    {product.id}
                                                </p>
                                            </div>

                                        </div>

                                    </td>

                                    <td className="max-w-xs px-6 py-4 text-sm text-slate-500">
                                        <p className="line-clamp-2">
                                            {product.description || "No description"}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4">

                                        <span
                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${product.isActive
                                                ? "bg-green-50 text-green-700"
                                                : "bg-orange-50 text-orange-700"
                                                }`}
                                        >
                                            {product.isActive ? "Active" : "Inactive"}
                                        </span>

                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {formatDate(product.createdAt)}
                                    </td>

                                    <td className="px-6 py-4">

                                        <div className="flex justify-end gap-2">

                                            <button
                                                onClick={() => openEditModal(product)}
                                                title="Edit product"
                                                className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Pencil size={17} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                disabled={deletingId === product.id}
                                                title="Delete product"
                                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                            >
                                                {deletingId === product.id ? (
                                                    <LoaderCircle size={17} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={17} />
                                                )}
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                    {/* LOADING */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <LoaderCircle
                                size={32}
                                className="animate-spin text-blue-600"
                            />
                            <p className="mt-3 text-sm text-slate-500">
                                Loading products...
                            </p>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {!loading && filteredProducts.length === 0 && (
                        <div className="px-6 py-16 text-center">

                            <Package
                                size={36}
                                className="mx-auto mb-3 text-slate-300"
                            />

                            <h3 className="font-semibold text-slate-700">
                                No products found
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                                Try another search or create a new product.
                            </p>

                        </div>
                    )}

                </div>

                {/* TABLE FOOTER */}
                <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
                    Showing {filteredProducts.length} of {products.length} products
                </div>

            </div>

            {/* CREATE / EDIT MODAL */}
            {isModalOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">

                    <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-slate-100 p-6">

                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingId ? "Edit Product" : "Add New Product"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter your product information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">

                            {error && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Product Name *
                                </label>

                                <input
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter product name"
                                    className="form-input"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Product Description
                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="4"
                                    maxLength={500}
                                    placeholder="Describe your product..."
                                    className="form-input resize-none"
                                />
                            </div>

                            <div className="rounded-xl bg-blue-50 p-4">
                                <p className="text-sm font-medium text-blue-800">
                                    Product information
                                </p>

                                <p className="mt-1 text-xs leading-5 text-blue-600">
                                    Subscription pricing and billing options will be
                                    configured separately in the Plans module.
                                </p>
                            </div>

                            <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">

                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving || !form.name.trim()}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving && (
                                        <LoaderCircle size={17} className="animate-spin" />
                                    )}

                                    {saving
                                        ? "Saving..."
                                        : editingId
                                            ? "Save Changes"
                                            : "Create Product"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

// SUMMARY CARD
function SummaryCard({ title, value, icon, color }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-3 text-3xl font-bold text-slate-900">
                        {value}
                    </h3>
                </div>

                <div className={`rounded-xl p-3 ${color}`}>
                    {icon}
                </div>

            </div>

        </div>
    );
}

export default ProductsPage;
