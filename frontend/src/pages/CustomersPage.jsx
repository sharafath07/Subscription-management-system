
import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    X,
    Users,
    Mail,
    Phone,
    MapPin,
    Building2,
    AlertCircle,
} from "lucide-react";

import {
    getCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
} from "../services/customerService.js";

const emptyForm = {
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form, setForm] = useState(emptyForm);

    // Load customers from backend
    const loadCustomers = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getCustomers();

            if (!response.success) {
                throw new Error("Unable to load customers.");
            }

            // IMPORTANT: Customers API returns "customers", not "data"
            setCustomers(response.customers || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load customers."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    // Search customers
    const filteredCustomers = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        return customers.filter((customer) =>
            [
                customer.name,
                customer.email,
                customer.phone,
                customer.company,
                customer.city,
                customer.state,
            ].some((value) =>
                String(value || "").toLowerCase().includes(searchText)
            )
        );
    }, [customers, search]);

    // Open create modal
    const openCreateModal = () => {
        setEditingCustomer(null);
        setForm(emptyForm);
        setError("");
        setModalOpen(true);
    };

    // Open edit modal
    const openEditModal = (customer) => {
        setEditingCustomer(customer);

        setForm({
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
            company: customer.company || "",
            address: customer.address || "",
            city: customer.city || "",
            state: customer.state || "",
            country: customer.country || "",
            postalCode: customer.postalCode || "",
        });

        setError("");
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setEditingCustomer(null);
        setForm(emptyForm);
    };

    // Handle form input
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Create or update customer
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        const customerData = {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            company: form.company.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            country: form.country.trim(),
            postalCode: form.postalCode.trim(),
        };

        if (!customerData.name || !customerData.email) {
            setError("Customer name and email are required.");
            return;
        }

        setSaving(true);

        try {
            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, customerData);
                setSuccess("Customer updated successfully.");
            } else {
                await createCustomer(customerData);
                setSuccess("Customer created successfully.");
            }

            setModalOpen(false);
            setEditingCustomer(null);
            setForm(emptyForm);

            await loadCustomers();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save customer. Please check the details."
            );
        } finally {
            setSaving(false);
        }
    };

    // Delete customer
    const handleDelete = async (customer) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${customer.name}?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await deleteCustomer(customer.id);
            setSuccess("Customer deleted successfully.");
            await loadCustomers();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete customer. They may have related subscriptions or invoices."
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-blue-600">
                            Subscription Management
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                            Customers
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage your customer information and contact details.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={loadCustomers}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            <Plus size={18} />
                            Add Customer
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

                {/* Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Total Customers</p>
                            <Users className="text-blue-500" size={21} />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {customers.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">With Subscriptions</p>
                            <Users className="text-green-500" size={21} />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {customers.filter(
                                (customer) => customer._count?.subscriptions > 0
                            ).length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">With Invoices</p>
                            <Mail className="text-purple-500" size={21} />
                        </div>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                            {customers.filter(
                                (customer) => customer._count?.invoices > 0
                            ).length}
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
                        placeholder="Search by name, email, phone or company..."
                        className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                </div>

                {/* Customers table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-900">
                            All Customers
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            {filteredCustomers.length} customer(s) found
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-sm text-slate-500">
                            Loading customers from backend...
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="p-10 text-center">
                            <Users className="mx-auto text-slate-300" size={36} />
                            <p className="mt-3 font-medium text-slate-700">
                                No customers found
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Add a customer or try another search.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[950px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4">Customer</th>
                                        <th className="px-5 py-4">Contact</th>
                                        <th className="px-5 py-4">Company</th>
                                        <th className="px-5 py-4">Location</th>
                                        <th className="px-5 py-4">Subscriptions</th>
                                        <th className="px-5 py-4">Invoices</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredCustomers.map((customer) => (
                                        <tr
                                            key={customer.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                                        {customer.name?.charAt(0)?.toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {customer.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {customer.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {customer.phone || "Not provided"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Building2 size={15} className="text-slate-400" />
                                                    {customer.company || "Individual"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    {[customer.city, customer.state]
                                                        .filter(Boolean)
                                                        .join(", ") || "Not provided"}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-slate-700">
                                                {customer._count?.subscriptions ?? 0}
                                            </td>

                                            <td className="px-5 py-4 text-slate-700">
                                                {customer._count?.invoices ?? 0}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(customer)}
                                                        title="Edit customer"
                                                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Pencil size={17} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(customer)}
                                                        title="Delete customer"
                                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Add / Edit modal */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
                        <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {editingCustomer ? "Edit Customer" : "Add Customer"}
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Enter the customer details below.
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

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Full Name *
                                        </label>
                                        <input
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter full name"
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="example@email.com"
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Phone Number
                                        </label>
                                        <input
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+91 9876543210"
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Company
                                        </label>
                                        <input
                                            name="company"
                                            value={form.company}
                                            onChange={handleChange}
                                            placeholder="Company name"
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4">
                                    <h3 className="mb-3 font-semibold text-slate-800">
                                        Address Details
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                                Street Address
                                            </label>
                                            <input
                                                name="address"
                                                value={form.address}
                                                onChange={handleChange}
                                                placeholder="Street, building or area"
                                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                                    City
                                                </label>
                                                <input
                                                    name="city"
                                                    value={form.city}
                                                    onChange={handleChange}
                                                    placeholder="City"
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                                    State
                                                </label>
                                                <input
                                                    name="state"
                                                    value={form.state}
                                                    onChange={handleChange}
                                                    placeholder="State"
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                                    Country
                                                </label>
                                                <input
                                                    name="country"
                                                    value={form.country}
                                                    onChange={handleChange}
                                                    placeholder="Country"
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                                    Postal Code
                                                </label>
                                                <input
                                                    name="postalCode"
                                                    value={form.postalCode}
                                                    onChange={handleChange}
                                                    placeholder="Postal code"
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
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
                                        disabled={saving}
                                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingCustomer
                                                ? "Save Changes"
                                                : "Create Customer"}
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
