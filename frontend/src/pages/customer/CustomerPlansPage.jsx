
import { useState } from "react";
import { Link } from "react-router-dom";

const samplePlans = [
    {
        id: "plan-1",
        name: "Monthly Premium",
        description: "Premium features for growing businesses.",
        price: "999.00",
        billingInterval: "MONTHLY",
        trialDays: 7,
        product: {
            id: "product-1",
            name: "Premium Software",
        },
    },
    {
        id: "plan-2",
        name: "Yearly Premium",
        description: "Enjoy premium features with annual billing.",
        price: "9999.00",
        billingInterval: "YEARLY",
        trialDays: 14,
        product: {
            id: "product-1",
            name: "Premium Software",
        },
    },
    {
        id: "plan-3",
        name: "Monthly Basic",
        description: "Essential tools for individuals and small teams.",
        price: "499.00",
        billingInterval: "MONTHLY",
        trialDays: 0,
        product: {
            id: "product-2",
            name: "Business Management",
        },
    },
];

function CustomerPlansPage() {
    const [search, setSearch] = useState("");
    const [billingFilter, setBillingFilter] = useState("ALL");

    const filteredPlans = samplePlans.filter((plan) => {
        const matchesSearch =
            plan.name.toLowerCase().includes(search.toLowerCase()) ||
            plan.product.name.toLowerCase().includes(search.toLowerCase());

        const matchesBilling =
            billingFilter === "ALL" ||
            plan.billingInterval === billingFilter;

        return matchesSearch && matchesBilling;
    });

    const formatPrice = (price) =>
        Number(price).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        });

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <p className="text-sm text-slate-400">
                    Customer Portal / Plans
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-800">
                    Browse Plans
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Choose a subscription plan that suits your needs.
                </p>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
                <input
                    type="text"
                    placeholder="Search plans or products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <select
                    value={billingFilter}
                    onChange={(e) => setBillingFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
                    <option value="ALL">All Billing Types</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                </select>
            </div>

            {/* Plans */}
            {filteredPlans.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredPlans.map((plan) => (
                        <div
                            key={plan.id}
                            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                                    {plan.billingInterval}
                                </span>

                                {plan.trialDays > 0 && (
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        {plan.trialDays} Days Free Trial
                                    </span>
                                )}
                            </div>

                            <p className="mt-5 text-sm font-medium text-slate-500">
                                {plan.product.name}
                            </p>

                            <h2 className="mt-2 text-xl font-bold text-slate-800">
                                {plan.name}
                            </h2>

                            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                                {plan.description}
                            </p>

                            <div className="mt-6 border-t border-slate-100 pt-5">
                                <p className="text-3xl font-bold text-slate-900">
                                    {formatPrice(plan.price)}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    per {plan.billingInterval === "MONTHLY" ? "month" : "year"}
                                </p>
                            </div>

                            <Link
                                to="/customer/subscriptions"
                                className="mt-6 block rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Select Plan
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                    <div className="text-4xl">📋</div>

                    <h2 className="mt-4 font-semibold text-slate-800">
                        No plans found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Try another search or billing filter.
                    </p>
                </div>
            )}

            <p className="text-center text-xs text-slate-400">
                Preview using sample plans. Live plan data will be connected when
                the Customer API is ready.
            </p>

        </div>
    );
}

export default CustomerPlansPage;
