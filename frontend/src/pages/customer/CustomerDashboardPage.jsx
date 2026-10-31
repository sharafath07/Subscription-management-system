
import { Link } from "react-router-dom";

const stats = [
    {
        title: "Active Subscriptions",
        value: "2",
        description: "Currently active",
        icon: "📦",
        color: "bg-indigo-50 text-indigo-600",
    },
    {
        title: "Total Invoices",
        value: "5",
        description: "Invoices generated",
        icon: "📄",
        color: "bg-blue-50 text-blue-600",
    },
    {
        title: "Pending Payments",
        value: "₹1,500",
        description: "Awaiting payment",
        icon: "💳",
        color: "bg-amber-50 text-amber-600",
    },
    {
        title: "Completed Payments",
        value: "₹8,500",
        description: "Successfully paid",
        icon: "✅",
        color: "bg-emerald-50 text-emerald-600",
    },
];

const recentSubscriptions = [
    {
        name: "Premium Plan",
        product: "Business Management",
        date: "25 Oct 2026",
        status: "ACTIVE",
    },
    {
        name: "Basic Plan",
        product: "Cloud Storage",
        date: "20 Oct 2026",
        status: "ACTIVE",
    },
];

const recentInvoices = [
    {
        number: "INV-2026-001",
        date: "28 Oct 2026",
        amount: "₹1,500",
        status: "PENDING",
    },
    {
        number: "INV-2026-002",
        date: "20 Oct 2026",
        amount: "₹4,500",
        status: "PAID",
    },
    {
        number: "INV-2026-003",
        date: "15 Oct 2026",
        amount: "₹4,000",
        status: "PAID",
    },
];

function CustomerDashboardPage() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return (
        <div className="space-y-8">

            {/* Welcome section */}
            <section>
                <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                    Welcome back, {user?.name || "Customer"}! 👋
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Here's an overview of your subscriptions and payments.
                </p>
            </section>

            {/* Quick actions */}
            <section className="flex flex-wrap gap-3">
                <Link
                    to="/customer/products"
                    className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                    Browse Products
                </Link>

                <Link
                    to="/customer/plans"
                    className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    Explore Plans
                </Link>
            </section>

            {/* Statistics */}
            <section>
                <h2 className="mb-4 text-lg font-semibold text-slate-800">
                    Account Overview
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.title}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-500">
                                    {stat.title}
                                </p>

                                <span className={`rounded-lg p-3 ${stat.color}`}>
                                    {stat.icon}
                                </span>
                            </div>

                            <h3 className="mt-4 text-2xl font-bold text-slate-800">
                                {stat.value}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                {stat.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent subscriptions */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                    <h2 className="font-semibold text-slate-800">
                        Recent Subscriptions
                    </h2>

                    <Link
                        to="/customer/subscriptions"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        View all
                    </Link>
                </div>

                <div className="divide-y divide-slate-100">
                    {recentSubscriptions.map((subscription) => (
                        <div
                            key={subscription.name}
                            className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                        >
                            <div>
                                <h3 className="font-medium text-slate-800">
                                    {subscription.name}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {subscription.product}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-500">
                                    {subscription.date}
                                </span>

                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    {subscription.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent invoices */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                    <h2 className="font-semibold text-slate-800">
                        Recent Invoices
                    </h2>

                    <Link
                        to="/customer/invoices"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        View all
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-5 py-3 font-medium">Invoice</th>
                                <th className="px-5 py-3 font-medium">Date</th>
                                <th className="px-5 py-3 font-medium">Amount</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {recentInvoices.map((invoice) => (
                                <tr key={invoice.number}>
                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                                        {invoice.number}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                        {invoice.date}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                                        {invoice.amount}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${invoice.status === "PAID"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-amber-50 text-amber-700"
                                                }`}
                                        >
                                            {invoice.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <p className="text-center text-xs text-slate-400">
                Dashboard preview — sample data only.
            </p>

        </div>
    );
}

export default CustomerDashboardPage;
