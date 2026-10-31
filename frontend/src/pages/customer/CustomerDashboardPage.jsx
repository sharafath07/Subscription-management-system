
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getCustomerProfile,
    getCustomerSubscriptions,
    getCustomerInvoices,
    getCustomerPayments,
} from "../../services/customerPortalService";

import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import CustomerLoading from "../../components/customer/CustomerLoading";
import CustomerError from "../../components/customer/CustomerError";
import CustomerEmptyState from "../../components/customer/CustomerEmptyState";
import CustomerStatusBadge from "../../components/customer/CustomerStatusBadge";

import {
    formatCurrency,
    formatDate,
} from "../../utils/customerFormatters";

function CustomerDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [dashboard, setDashboard] = useState({
        profile: {},
        subscriptions: [],
        invoices: [],
        payments: [],
    });

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const [profileRes, subscriptionsRes, invoicesRes, paymentsRes] =
                await Promise.all([
                    getCustomerProfile(),
                    getCustomerSubscriptions(),
                    getCustomerInvoices(),
                    getCustomerPayments(),
                ]);

            if (
                !profileRes.success ||
                !profileRes.data ||
                !subscriptionsRes.success ||
                !Array.isArray(subscriptionsRes.data) ||
                !invoicesRes.success ||
                !Array.isArray(invoicesRes.data) ||
                !paymentsRes.success ||
                !Array.isArray(paymentsRes.data)
            ) {
                throw new Error("Invalid dashboard response from server.");
            }

            setDashboard({
                profile: profileRes.data,
                subscriptions: subscriptionsRes.data,
                invoices: invoicesRes.data,
                payments: paymentsRes.data,
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return <CustomerLoading message="Loading dashboard..." />;
    }

    if (error) {
        return (
            <CustomerError
                message={error}
                onRetry={fetchDashboard}
            />
        );
    }

    const activeSubscriptions = dashboard.subscriptions.filter(
        (item) => item.status?.toLowerCase() === "active"
    ).length;

    const cancelledSubscriptions = dashboard.subscriptions.filter(
        (item) => item.status?.toLowerCase() === "cancelled"
    ).length;

    const expiredSubscriptions = dashboard.subscriptions.filter(
        (item) => item.status?.toLowerCase() === "expired"
    ).length;

    const pendingInvoices = dashboard.invoices.filter(
        (item) =>
            ["pending", "unpaid", "overdue"].includes(
                item.status?.toLowerCase()
            )
    );

    const pendingAmount = pendingInvoices.reduce(
        (total, item) =>
            total +
            Math.max(
                0,
                Number(item.total || 0) - Number(item.amountPaid || 0)
            ),
        0
    );

    const completedPayments = dashboard.payments.filter(
        (item) => item.status?.toLowerCase() === "completed"
    );

    const paymentTotal = completedPayments.reduce(
        (total, item) => total + Number(item.amount || 0),
        0
    );

    const stats = [
        {
            title: "Total Subscriptions",
            value: dashboard.subscriptions.length,
            icon: "🔄",
            color: "bg-blue-100 text-blue-700",
        },
        {
            title: "Active Subscriptions",
            value: activeSubscriptions,
            icon: "✅",
            color: "bg-green-100 text-green-700",
        },
        {
            title: "Cancelled Subscriptions",
            value: cancelledSubscriptions,
            icon: "❌",
            color: "bg-red-100 text-red-700",
        },
        {
            title: "Expired Subscriptions",
            value: expiredSubscriptions,
            icon: "⌛",
            color: "bg-gray-100 text-gray-700",
        },
        {
            title: "Pending Invoice Balance",
            value: formatCurrency(pendingAmount),
            icon: "🧾",
            color: "bg-orange-100 text-orange-700",
        },
        {
            title: "Successful Payments",
            value: formatCurrency(paymentTotal),
            icon: "💳",
            color: "bg-purple-100 text-purple-700",
        },
    ];

    return (
        <div className="space-y-8">
            <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white shadow">
                <h1 className="text-2xl font-bold md:text-3xl">
                    Welcome back, {dashboard.profile.name || "Customer"}!
                </h1>

                <p className="mt-2 text-blue-100">
                    Here's an overview of your subscriptions and account activity.
                </p>
            </section>

            <section>
                <CustomerPageHeader
                    title="Account Overview"
                    description="Your subscription and payment summary."
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.title}
                            className="rounded-xl bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {stat.title}
                                    </p>

                                    <h3 className="mt-2 text-2xl font-bold text-gray-800">
                                        {stat.value}
                                    </h3>
                                </div>

                                <div className={`rounded-xl p-3 text-2xl ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <CustomerPageHeader
                    title="Quick Access"
                    description="Quickly access your account information."
                />

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        {
                            title: "Browse Products",
                            path: "/customer/products",
                            icon: "📦",
                        },
                        {
                            title: "Explore Plans",
                            path: "/customer/plans",
                            icon: "📋",
                        },
                        {
                            title: "My Invoices",
                            path: "/customer/invoices",
                            icon: "🧾",
                        },
                        {
                            title: "My Profile",
                            path: "/customer/profile",
                            icon: "👤",
                        },
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="rounded-xl bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <span className="text-3xl">{item.icon}</span>

                            <p className="mt-3 text-sm font-semibold text-gray-700">
                                {item.title}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">
                        Recent Subscriptions
                    </h2>

                    <Link
                        to="/customer/subscriptions"
                        className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                        View All
                    </Link>
                </div>

                {dashboard.subscriptions.length === 0 ? (
                    <CustomerEmptyState
                        title="No subscriptions found"
                        message="Your subscriptions will appear here."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-left text-sm">
                            <thead>
                                <tr className="border-b text-gray-500">
                                    <th className="p-3">Plan</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Next Billing</th>
                                </tr>
                            </thead>

                            <tbody>
                                {dashboard.subscriptions.slice(0, 5).map((subscription) => (
                                    <tr key={subscription.id} className="border-b last:border-0">
                                        <td className="p-3 font-medium text-gray-800">
                                            {subscription.plan?.name || "Subscription"}
                                        </td>

                                        <td className="p-3">
                                            {formatCurrency(subscription.plan?.price)}
                                        </td>

                                        <td className="p-3">
                                            <CustomerStatusBadge status={subscription.status} />
                                        </td>

                                        <td className="p-3 text-gray-600">
                                            {formatDate(subscription.nextBillingDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default CustomerDashboardPage;
