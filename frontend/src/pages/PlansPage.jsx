
import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    X,
    CalendarDays,
    Package,
    IndianRupee,
    AlertCircle,
} from "lucide-react";

import {
    getPlans,
    createPlan,
    updatePlan,
    deletePlan,
} from "../services/planService.js";

import { getProducts } from "../services/productService.js";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    billingInterval: "MONTHLY",
    trialDays: "0",
    productId: "",
};

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(price || 0));

const formatInterval = (interval) => {
    const labels = {
        WEEKLY: "Weekly",
        MONTHLY: "Monthly",
        QUARTERLY: "Quarterly",
        YEARLY: "Yearly",
    };

    return labels[interval] || interval;
};

export default function PlansPage() {
    const [plans, setPlans] = useState([]);
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const [plansResponse, productsResponse] = await Promise.all([
                getPlans(),
                getProducts(),
            ]);

            if (!plansResponse.success || !productsResponse.success) {
                throw new Error("Could not load plans or products.");
            }

            setPlans(plansResponse.plans || []);
            setProducts(productsResponse.products || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load data. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredPlans = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        return plans.filter((plan) => {
            const productName =
                plan.product?.name ||
                products.find((p) => p.id === plan.productId)?.name ||
                "";

            return (
                plan.name?.toLowerCase().includes(searchText) ||
                plan.description?.toLowerCase().includes(searchText) ||
                productName.toLowerCase().includes(searchText) ||
                plan.billingInterval?.toLowerCase().includes(searchText)
            );
        });
    }, [plans, products, search]);

    const activeCount = plans.filter((plan) => plan.isActive).length;
    const inactiveCount = plans.length - activeCount;

    const openCreateModal = () => {
        setEditingPlan(null);
        setForm({
            ...emptyForm,
            productId: products[0]?.id || "",
        });
        setError("");
        setModalOpen(true);
    };

    const openEditModal = (plan) => {
        setEditingPlan(plan);

        setForm({
            name: plan.name || "",
            description: plan.description || "",
            price: String(plan.price ?? ""),
            billingInterval: plan.billingInterval || "MONTHLY",
            trialDays: String(plan.trialDays ?? 0),
            productId: plan.productId || plan.product?.id || "",
        });

        setError("");
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;
        setModalOpen(false);
        setEditingPlan(null);
        setForm(emptyForm);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!form.productId) {
            setError("Please select a product.");
            return;
        }

        const price = Number(form.price);
        const trialDays = Number(form.trialDays);

        if (!Number.isFinite(price) || price < 0) {
            setError("Please enter a valid price.");
            return;
        }

        if (!Number.isInteger(trialDays) || trialDays < 0) {
            setError("Trial days must be a whole number greater than or equal to 0.");
            return;
        }

        const planData = {
            name: form.name.trim(),
            description: form.description.trim(),
            price,
            billingInterval: form.billingInterval,
            trialDays,
            productId: form.productId,
        };

        if (!planData.name) {
            setError("Please enter a plan name.");
            return;
        }

        setSaving(true);

        try {
            if (editingPlan) {
                await updatePlan(editingPlan.id, planData);
                setSuccess("Plan updated successfully.");
            } else {
                await createPlan(planData);
                setSuccess("Plan created successfully.");
            }

            setModalOpen(false);
            setEditingPlan(null);
            setForm(emptyForm);

            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save plan. Please check your details."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (plan) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${plan.name}"?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await deletePlan(plan.id);
            setSuccess("Plan deactivated successfully.");
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to deactivate plan. Please try again."
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Page heading */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-600">
                            Subscription Management
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                            Plans
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Create and manage subscription plans for your products.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>

                        <button
                            onClick={openCreateModal}
                            disabled={products.length === 0}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Plus size={18} />
                            Add Plan
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {error && !modalOpen && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-500">Total Plans</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {plans.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-500">Active Plans</p>
                        <p className="mt-2 text-3xl font-bold text-green-600">
                            {activeCount}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-500">Inactive Plans</p>
                        <p className="mt-2 text-3xl font-bold text-slate-500">
                            {inactiveCount}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <Search size={19} className="text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by plan, product or billing interval..."
                        className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                </div>

                {/* Product warning */}
                {!loading && products.length === 0 && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        You need to create a product before you can create a plan.
                    </div>
                )}

                {/* Plans table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">All Plans</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            {filteredPlans.length} plan(s) found
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-sm text-slate-500">
                            Loading plans...
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="p-10 text-center">
                            <Package className="mx-auto text-slate-300" size={35} />
                            <p className="mt-3 font-medium text-slate-700">
                                No plans found
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Add a plan or try a different search.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4">Plan</th>
                                        <th className="px-5 py-4">Product</th>
                                        <th className="px-5 py-4">Price</th>
                                        <th className="px-5 py-4">Billing</th>
                                        <th className="px-5 py-4">Trial</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredPlans.map((plan) => {
                                        const productName =
                                            plan.product?.name ||
                                            products.find((p) => p.id === plan.productId)?.name ||
                                            "Unknown product";

                                        return (
                                            <tr key={plan.id} className="hover:bg-slate-50">
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-slate-900">
                                                        {plan.name}
                                                    </p>
                                                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                                        {plan.description || "No description"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 text-slate-700">
                                                    {productName}
                                                </td>

                                                <td className="px-5 py-4 font-semibold text-slate-900">
                                                    {formatPrice(plan.price)}
                                                </td>

                                                <td className="px-5 py-4 text-slate-700">
                                                    {formatInterval(plan.billingInterval)}
                                                </td>

                                                <td className="px-5 py-4 text-slate-700">
                                                    {plan.trialDays} days
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${plan.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-slate-100 text-slate-600"
                                                            }`}
                                                    >
                                                        {plan.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(plan)}
                                                            title="Edit plan"
                                                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Pencil size={17} />
                                                        </button>

                                                        {plan.isActive && (
                                                            <button
                                                                onClick={() => handleDeactivate(plan)}
                                                                title="Deactivate plan"
                                                                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 size={17} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create / Edit modal */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
                        <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {editingPlan ? "Edit Plan" : "Create New Plan"}
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Enter the subscription plan details below.
                                    </p>
                                </div>

                                <button
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 p-6">
                                {error && (
                                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Plan Name *
                                    </label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Example: Monthly Premium"
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Describe this subscription plan..."
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Product *
                                    </label>
                                    <select
                                        name="productId"
                                        value={form.productId}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select a product</option>
                                        {products
                                            .filter((product) => product.isActive)
                                            .map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Price (₹) *
                                        </label>
                                        <div className="relative">
                                            <IndianRupee
                                                size={16}
                                                className="absolute left-3 top-3 text-slate-400"
                                            />
                                            <input
                                                type="number"
                                                name="price"
                                                value={form.price}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                required
                                                placeholder="999.00"
                                                className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Billing Interval *
                                        </label>
                                        <select
                                            name="billingInterval"
                                            value={form.billingInterval}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        >
                                            <option value="WEEKLY">Weekly</option>
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="QUARTERLY">Quarterly</option>
                                            <option value="YEARLY">Yearly</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Free Trial (Days)
                                    </label>
                                    <input
                                        type="number"
                                        name="trialDays"
                                        value={form.trialDays}
                                        onChange={handleChange}
                                        min="0"
                                        step="1"
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving || products.length === 0}
                                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingPlan
                                                ? "Save Changes"
                                                : "Create Plan"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
