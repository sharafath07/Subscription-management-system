
import { useEffect, useState } from "react";
import {
    Search,
    RefreshCw,
    Repeat,
    Users,
    CheckCircle,
    Clock,
    XCircle,
} from "lucide-react";

import { getSubscriptions } from "../services/subscriptionService";

const statuses = [
    "ALL",
    "DRAFT",
    "QUOTATION",
    "CONFIRMED",
    "ACTIVE",
    "CLOSED",
];

const statusStyles = {
    DRAFT: "bg-slate-100 text-slate-700",
    QUOTATION: "bg-purple-100 text-purple-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-green-100 text-green-700",
    CLOSED: "bg-red-100 text-red-700",
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
};

function StatusBadge({ status }) {
    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || "bg-slate-100 text-slate-600"
                }`}
        >
            {status}
        </span>
    );
}

function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            setError("");

            const filters = {};

            if (statusFilter !== "ALL") {
                filters.status = statusFilter;
            }

            if (search.trim()) {
                filters.search = search.trim();
            }

            const response = await getSubscriptions(filters);

            if (!response.success) {
                throw new Error(
                    response.message || "Unable to load subscriptions"
                );
            }

            setSubscriptions(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error("Subscription loading error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load subscriptions"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchSubscriptions();
    };

    const activeCount = subscriptions.filter(
        (item) => item.status === "ACTIVE"
    ).length;

    const draftCount = subscriptions.filter(
        (item) => item.status === "DRAFT"
    ).length;

    const closedCount = subscriptions.filter(
        (item) => item.status === "CLOSED"
    ).length;

    return (
        <div className="space-y-6">

            {/* Heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Subscriptions
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage customer subscriptions and billing.
                    </p>
                </div>

                <button
                    onClick={fetchSubscriptions}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    title="Total Subscriptions"
                    value={subscriptions.length}
                    icon={<Repeat size={22} />}
                    color="blue"
                />

                <StatCard
                    title="Active"
                    value={activeCount}
                    icon={<CheckCircle size={22} />}
                    color="green"
                />

                <StatCard
                    title="Draft"
                    value={draftCount}
                    icon={<Clock size={22} />}
                    color="orange"
                />

                <StatCard
                    title="Closed"
                    value={closedCount}
                    icon={<XCircle size={22} />}
                    color="red"
                />

            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">

                <form
                    onSubmit={handleSearch}
                    className="flex flex-1 gap-2"
                >
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search customer or plan..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Search
                    </button>
                </form>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                    {statuses.map((status) => (
                        <option key={status} value={status}>
                            {status === "ALL" ? "All Statuses" : status}
                        </option>
                    ))}
                </select>

            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                    <button
                        onClick={fetchSubscriptions}
                        className="ml-3 font-semibold underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Subscription Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 p-5">
                    <h2 className="font-semibold text-slate-800">
                        Subscription List
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {subscriptions.length} subscriptions found
                    </p>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw
                            size={28}
                            className="mx-auto animate-spin text-blue-600"
                        />
                        <p className="mt-3 text-sm text-slate-500">
                            Loading subscriptions...
                        </p>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users
                            size={36}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-medium text-slate-600">
                            No subscriptions found
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                            Try changing your search or status filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-left text-sm">

                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Customer</th>
                                    <th className="px-5 py-4">Plan</th>
                                    <th className="px-5 py-4">Product</th>
                                    <th className="px-5 py-4">Price</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Start Date</th>
                                    <th className="px-5 py-4">Next Billing</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {subscriptions.map((subscription) => (
                                    <tr
                                        key={subscription.id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-800">
                                                {subscription.customer?.name || "—"}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {subscription.customer?.email || ""}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-800">
                                                {subscription.plan?.name || "—"}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {subscription.plan?.billingInterval || ""}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {subscription.plan?.product?.name || "—"}
                                        </td>

                                        <td className="px-5 py-4 font-medium text-slate-800">
                                            {formatCurrency(
                                                subscription.plan?.price *
                                                subscription.quantity
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusBadge
                                                status={subscription.status}
                                            />
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {formatDate(subscription.startDate)}
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {formatDate(subscription.nextBillingDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

            </div>

        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    const colors = {
        blue: "bg-blue-100 text-blue-600",
        green: "bg-green-100 text-green-600",
        orange: "bg-orange-100 text-orange-600",
        red: "bg-red-100 text-red-600",
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                <div className={`rounded-lg p-3 ${colors[color]}`}>
                    {icon}
                </div>
            </div>

            <h2 className="mt-4 text-2xl font-bold text-slate-800">
                {value}
            </h2>
        </div>
    );
}

export default SubscriptionsPage;
