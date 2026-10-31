
import { useEffect, useState } from "react";

import {
    Users,
    Repeat,
    IndianRupee,
    Receipt,
    Wallet,
    RefreshCw,
} from "lucide-react";

import { getDashboardAnalytics } from "../services/analyticsService";

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
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

const statistics = [
    {
        title: "Total Customers",
        key: "totalCustomers",
        description: "Registered customers",
        icon: Users,
        color: "blue",
    },
    {
        title: "Active Subscriptions",
        key: "activeSubscriptions",
        description: "Currently active",
        icon: Repeat,
        color: "green",
    },
    {
        title: "Total Revenue",
        key: "totalRevenue",
        description: "Collected revenue",
        icon: IndianRupee,
        color: "purple",
        currency: true,
    },
    {
        title: "Total Invoices",
        key: "totalInvoices",
        description: "Generated invoices",
        icon: Receipt,
        color: "orange",
    },
    {
        title: "Pending Revenue",
        key: "pendingRevenue",
        description: "Outstanding amount",
        icon: Wallet,
        color: "red",
        currency: true,
    },
];

const colorStyles = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
};

function DashboardPage() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getDashboardAnalytics();

            if (!response.success) {
                throw new Error(
                    response.message || "Unable to load dashboard"
                );
            }

            setDashboard(response.data);
        } catch (err) {
            console.error("Dashboard error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load dashboard data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <RefreshCw
                        size={32}
                        className="mx-auto animate-spin text-blue-600"
                    />
                    <p className="mt-4 text-sm text-slate-500">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h2 className="font-semibold text-red-700">
                    Unable to load dashboard
                </h2>

                <p className="mt-2 text-sm text-red-600">
                    {error}
                </p>

                <button
                    onClick={fetchDashboard}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const payments = dashboard?.recentPayments || [];

    return (
        <div className="space-y-6">

            {/* Heading */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Welcome back, {JSON.parse(localStorage.getItem("user") || "null")?.name || "Admin"}!
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Here's what's happening with your subscriptions today.
                    </p>
                </div>

                <button
                    onClick={fetchDashboard}
                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

                {statistics.map((item) => {
                    const Icon = item.icon;

                    const rawValue = dashboard?.[item.key] ?? 0;

                    const value = item.currency
                        ? formatCurrency(rawValue)
                        : rawValue.toLocaleString("en-IN");

                    return (
                        <div
                            key={item.key}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-500">
                                    {item.title}
                                </p>

                                <div
                                    className={`rounded-lg p-3 ${colorStyles[item.color]}`}
                                >
                                    <Icon size={22} />
                                </div>
                            </div>

                            <h2 className="mt-4 text-2xl font-bold text-slate-800">
                                {value}
                            </h2>

                            <p className="mt-2 text-xs text-slate-500">
                                {item.description}
                            </p>
                        </div>
                    );
                })}

            </div>

            {/* Additional Statistics */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Products
                    </p>

                    <h2 className="mt-3 text-2xl font-bold text-slate-800">
                        {dashboard?.totalProducts ?? 0}
                    </h2>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Plans
                    </p>

                    <h2 className="mt-3 text-2xl font-bold text-slate-800">
                        {dashboard?.totalPlans ?? 0}
                    </h2>
                </div>
            </div>

            {/* Recent Payments */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 p-5">
                    <h3 className="font-semibold text-slate-800">
                        Recent Payments
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Latest payment transactions
                    </p>
                </div>

                {payments.length === 0 ? (
                    <p className="p-8 text-center text-sm text-slate-500">
                        No recent payments found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left text-sm">

                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Invoice</th>
                                    <th className="px-5 py-3">Customer</th>
                                    <th className="px-5 py-3">Method</th>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Amount</th>
                                    <th className="px-5 py-3">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50">

                                        <td className="px-5 py-4 font-medium text-slate-800">
                                            {payment.invoice?.invoiceNumber || "—"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-800">
                                                {payment.invoice?.customer?.name || "Unknown"}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {payment.invoice?.customer?.email || ""}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {(payment.method || "—").replace("_", " ")}
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {formatDate(payment.paymentDate)}
                                        </td>

                                        <td className="px-5 py-4 font-semibold text-slate-800">
                                            {formatCurrency(payment.amount)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                {payment.status}
                                            </span>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}
            </div>

            <p className="text-center text-xs text-slate-400">
                Dashboard data is loaded directly from the backend.
            </p>

        </div>
    );
}

export default DashboardPage;
