
import { useEffect, useState } from "react";
import { getCustomerPlans } from "../../services/customerPortalService";

import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import CustomerLoading from "../../components/customer/CustomerLoading";
import CustomerError from "../../components/customer/CustomerError";
import CustomerEmptyState from "../../components/customer/CustomerEmptyState";

import {
    formatCurrency,
    formatBillingInterval,
} from "../../utils/customerFormatters";

function CustomerPlansPage() {
    const [plans, setPlans] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPlans = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCustomerPlans();

            if (!response.success || !Array.isArray(response.data)) {
                throw new Error("Unable to load subscription plans.");
            }

            setPlans(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load plans."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const filteredPlans = plans.filter((plan) =>
        `${plan.name || ""} ${plan.description || ""} ${plan.product?.name || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div>
            <CustomerPageHeader
                title="Subscription Plans"
                description="Find the right subscription plan for your needs."
            />

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search plans..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
            </div>

            {loading && <CustomerLoading message="Loading plans..." />}

            {!loading && error && (
                <CustomerError message={error} onRetry={fetchPlans} />
            )}

            {!loading && !error && filteredPlans.length === 0 && (
                <CustomerEmptyState
                    title="No plans found"
                    message="No subscription plans match your search."
                />
            )}

            {!loading && !error && filteredPlans.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredPlans.map((plan) => (
                        <div
                            key={plan.id}
                            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                                📋
                            </div>

                            <h2 className="text-xl font-bold text-gray-800">
                                {plan.name}
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                {plan.description || "No description available."}
                            </p>

                            <p className="mt-4 text-sm text-gray-500">
                                Product:{" "}
                                <span className="font-medium text-gray-800">
                                    {plan.product?.name || "Not specified"}
                                </span>
                            </p>

                            <div className="mt-5 border-t pt-5">
                                <p className="text-3xl font-bold text-blue-600">
                                    {formatCurrency(plan.price)}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    per {formatBillingInterval(plan.billingInterval)}
                                </p>

                                <p className="mt-3 text-sm text-gray-600">
                                    Trial period: {plan.trialDays || 0} days
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CustomerPlansPage;
