
import { useState } from "react";

const sampleSubscriptions = [
    {
        id: "SUB-001",
        status: "ACTIVE",
        startDate: "2026-10-01T00:00:00.000Z",
        nextBillingDate: "2026-11-01T00:00:00.000Z",
        quantity: 1,
        plan: {
            name: "Monthly Premium",
            price: "999.00",
            billingInterval: "MONTHLY",
        },
    },
    {
        id: "SUB-002",
        status: "DRAFT",
        startDate: "2026-10-15T00:00:00.000Z",
        nextBillingDate: null,
        quantity: 2,
        plan: {
            name: "Yearly Premium",
            price: "9999.00",
            billingInterval: "YEARLY",
        },
    },
];

function CustomerSubscriptionsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredSubscriptions = sampleSubscriptions.filter((subscription) => {
        const matchesSearch =
            subscription.id.toLowerCase().includes(search.toLowerCase()) ||
            subscription.plan.name.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "ALL" || subscription.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatDate = (date) => {
        if (!date) return "Not scheduled";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const statusStyle = {
        ACTIVE: "bg-emerald-50 text-emerald-700",
        DRAFT: "bg-amber-50 text-amber-700",
        CONFIRMED: "bg-blue-50 text-blue-700",
        CLOSED: "bg-slate-100 text-slate-600",
        QUOTATION: "bg-purple-50 text-purple-700",
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-slate-400">
                    Customer Portal / My Subscriptions
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-800">
                    My Subscriptions
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    View and track your subscription plans.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                    title="Total Subscriptions"
                    value={sampleSubscriptions.length}
                />
                <SummaryCard
                    title="Active Subscriptions"
                    value={sampleSubscriptions.filter((s) => s.status === "ACTIVE").length}
                />
                <SummaryCard
                    title="Draft Subscriptions"
                    value={sampleSubscriptions.filter((s) => s.status === "DRAFT").length}
                />
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
                <input
                    type="text"
                    placeholder="Search subscription or plan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="QUOTATION">Quotation</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 p-5">
                    <h2 className="font-semibold text-slate-800">
                        Subscription History
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-5 py-4">Subscription</th>
                                <th className="px-5 py-4">Plan</th>
                                <th className="px-5 py-4">Price</th>
                                <th className="px-5 py-4">Start Date</th>
                                <th className="px-5 py-4">Next Billing</th>
                                <th className="px-5 py-4">Quantity</th>
                                <th className="px-5 py-4">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredSubscriptions.map((subscription) => (
                                <tr key={subscription.id} className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                                        {subscription.id}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                                        {subscription.plan.name}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                                        ₹{Number(subscription.plan.price).toLocaleString("en-IN")}
                                        <span className="text-xs text-slate-400">
                                            {" "}/ {subscription.plan.billingInterval.toLowerCase()}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                        {formatDate(subscription.startDate)}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                        {formatDate(subscription.nextBillingDate)}
                                    </td>

                                    <td className="px-5 py-4 text-slate-600">
                                        {subscription.quantity}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[subscription.status] ||
                                                "bg-slate-100 text-slate-600"
                                                }`}
                                        >
                                            {subscription.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {filteredSubscriptions.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                                        No subscriptions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="text-center text-xs text-slate-400">
                Preview using sample subscriptions. Live data will be connected
                when the Customer API is ready.
            </p>
        </div>
    );
}

function SummaryCard({ title, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{title}</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-800">{value}</h3>
        </div>
    );
}

export default CustomerSubscriptionsPage;