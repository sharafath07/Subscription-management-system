
import { useCallback, useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    getDashboardAnalytics,
    getRevenueAnalytics,
    getRecentPayments,
} from "../services/analyticsService";

// Format amounts as Indian Rupees.
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatMonth = (month) => {
    if (!month) return "";

    const [year, monthNumber] = month.split("-");
    const date = new Date(Number(year), Number(monthNumber) - 1);

    return date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    });
};

const getErrorMessage = (error) => {
    return (
        error.response?.data?.message ||
        error.message ||
        "Something went wrong while loading analytics."
    );
};

function StatCard({ title, value, description, icon, color }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h2 className="mt-3 text-2xl font-bold text-gray-900">
                        {value}
                    </h2>
                    <p className="mt-2 text-xs text-gray-500">{description}</p>
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg text-xl ${color}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function PaymentStatus({ status }) {
    const styles = {
        COMPLETED: "bg-green-100 text-green-700",
        PENDING: "bg-yellow-100 text-yellow-700",
        FAILED: "bg-red-100 text-red-700",
        REFUNDED: "bg-purple-100 text-purple-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
                }`}
        >
            {status || "UNKNOWN"}
        </span>
    );
}

function RevenueChart({ monthlyRevenue }) {
    const chartData = monthlyRevenue.map((item) => ({
        month: formatMonth(item.month),
        revenue: Number(item.revenue) || 0,
    }));

    return (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    Monthly Revenue
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Revenue from completed payments, grouped by payment date.
                </p>
            </div>

            {chartData.length === 0 ? (
                <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                    No monthly revenue data available.
                </div>
            ) : (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />

                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                            />

                            <YAxis
                                tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                                tick={{ fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={85}
                            />

                            <Tooltip
                                formatter={(value) => [formatCurrency(value), "Revenue"]}
                                contentStyle={{
                                    borderRadius: "10px",
                                    border: "1px solid #e5e7eb",
                                }}
                            />

                            <Bar
                                dataKey="revenue"
                                fill="#4f46e5"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={55}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
}

function RecentPayments({ payments }) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
                <h2 className="text-lg font-semibold text-gray-900">
                    Recent Payments
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Latest payment transactions.
                </p>
            </div>

            {payments.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                    No recent payments found.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-sm">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Invoice</th>
                                <th className="px-5 py-3 font-semibold">Customer</th>
                                <th className="px-5 py-3 font-semibold">Method</th>
                                <th className="px-5 py-3 font-semibold">Date</th>
                                <th className="px-5 py-3 font-semibold">Amount</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-4 font-medium text-gray-900">
                                        {payment.invoice?.invoiceNumber || "—"}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="font-medium text-gray-800">
                                            {payment.invoice?.customer?.name || "Unknown"}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {payment.invoice?.customer?.email || ""}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-gray-600">
                                        {(payment.method || "—").replace("_", " ")}
                                    </td>

                                    <td className="px-5 py-4 text-gray-600">
                                        {formatDate(payment.paymentDate)}
                                    </td>

                                    <td className="px-5 py-4 font-semibold text-gray-900">
                                        {formatCurrency(payment.amount)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <PaymentStatus status={payment.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default function Analytics() {
    const [dashboard, setDashboard] = useState(null);
    const [revenue, setRevenue] = useState(null);
    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [dashboardResponse, revenueResponse, paymentsResponse] =
                await Promise.all([
                    getDashboardAnalytics(),
                    getRevenueAnalytics(),
                    getRecentPayments(5),
                ]);

            if (!dashboardResponse.success || !dashboardResponse.data) {
                throw new Error("Unable to load dashboard analytics.");
            }

            if (!revenueResponse.success || !revenueResponse.data) {
                throw new Error("Unable to load revenue analytics.");
            }

            setDashboard(dashboardResponse.data);
            setRevenue(revenueResponse.data);
            setPayments(
                Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []
            );
        } catch (err) {
            console.error("Analytics loading error:", err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
                    <p className="mt-4 text-sm text-gray-500">
                        Loading analytics dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error && !dashboard) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h2 className="font-semibold text-red-700">
                    Unable to load analytics
                </h2>
                <p className="mt-2 text-sm text-red-600">{error}</p>
                <button
                    onClick={fetchAnalytics}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const monthlyRevenue = revenue?.monthlyRevenue || [];

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Page heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Analytics Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Monitor subscriptions, revenue, invoices, and payments.
                    </p>
                </div>

                <button
                    onClick={fetchAnalytics}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    ↻ Refresh Data
                </button>
            </div>

            {/* Error while refreshing */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Some analytics data could not be refreshed: {error}
                </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    title="Active Subscriptions"
                    value={dashboard?.activeSubscriptions ?? 0}
                    description={`${dashboard?.totalSubscriptions ?? 0} total subscriptions`}
                    icon="↗"
                    color="bg-blue-100 text-blue-700"
                />

                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(revenue?.totalRevenue ?? dashboard?.totalRevenue)}
                    description="Revenue received from completed payments"
                    icon="₹"
                    color="bg-green-100 text-green-700"
                />

                <StatCard
                    title="Total Payments"
                    value={payments.length}
                    description="Payments in the latest 5 records"
                    icon="▤"
                    color="bg-purple-100 text-purple-700"
                />

                <StatCard
                    title="Outstanding Amount"
                    value={formatCurrency(dashboard?.pendingRevenue)}
                    description="Unpaid balance on non-void invoices"
                    icon="◷"
                    color="bg-orange-100 text-orange-700"
                />

                <StatCard
                    title="Overdue Invoices"
                    value="—"
                    description="Awaiting the overdue invoices API"
                    icon="!"
                    color="bg-red-100 text-red-700"
                />
            </div>

            {/* Additional overview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-500">Total Customers</p>
                    <p className="mt-2 text-xl font-bold text-gray-900">
                        {dashboard?.totalCustomers ?? 0}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-500">Active Products</p>
                    <p className="mt-2 text-xl font-bold text-gray-900">
                        {dashboard?.totalProducts ?? 0}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-sm text-gray-500">Active Plans</p>
                    <p className="mt-2 text-xl font-bold text-gray-900">
                        {dashboard?.totalPlans ?? 0}
                    </p>
                </div>
            </div>

            {/* Revenue chart */}
            <RevenueChart monthlyRevenue={monthlyRevenue} />

            {/* Recent payments */}
            <RecentPayments payments={payments} />

            <p className="text-xs text-gray-400">
                Analytics are based on the latest backend data. Date filtering,
                payment summaries, and overdue invoice details will be added when
                their backend APIs are available.
            </p>
        </div>
    );
}
