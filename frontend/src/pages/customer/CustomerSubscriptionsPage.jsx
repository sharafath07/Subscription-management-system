
import { useEffect, useState } from "react";
import { getCustomerSubscriptions } from "../../services/customerPortalService";

import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import CustomerLoading from "../../components/customer/CustomerLoading";
import CustomerError from "../../components/customer/CustomerError";
import CustomerEmptyState from "../../components/customer/CustomerEmptyState";
import CustomerStatusBadge from "../../components/customer/CustomerStatusBadge";

import {
    formatCurrency,
    formatDate,
} from "../../utils/customerFormatters";

function CustomerSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCustomerSubscriptions();

            if (!response.success || !Array.isArray(response.data)) {
                throw new Error("Unable to load subscriptions.");
            }

            setSubscriptions(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load subscriptions."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const filteredSubscriptions = subscriptions.filter((subscription) => {
        const matchesSearch =
            `${subscription.plan?.name || ""} ${subscription.status || ""}`
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            subscription.status?.toLowerCase() === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <CustomerPageHeader
                title="My Subscriptions"
                description="View and track your active and previous subscriptions."
            />

            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3"
                >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                </select>
            </div>

            {loading && (
                <CustomerLoading message="Loading subscriptions..." />
            )}

            {!loading && error && (
                <CustomerError
                    message={error}
                    onRetry={fetchSubscriptions}
                />
            )}

            {!loading && !error && filteredSubscriptions.length === 0 && (
                <CustomerEmptyState
                    title="No subscriptions found"
                    message="Try changing your search or status filter."
                />
            )}

            {!loading && !error && filteredSubscriptions.length > 0 && (
                <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
                    <table className="w-full min-w-[700px] text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-4">Plan</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Start Date</th>
                                <th className="p-4">Next Billing</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredSubscriptions.map((subscription) => (
                                <tr key={subscription.id} className="border-t">
                                    <td className="p-4 font-semibold text-gray-800">
                                        {subscription.plan?.name || "Subscription"}
                                    </td>

                                    <td className="p-4">
                                        {formatCurrency(subscription.plan?.price)}
                                    </td>

                                    <td className="p-4 text-gray-600">
                                        {formatDate(subscription.startDate)}
                                    </td>

                                    <td className="p-4 text-gray-600">
                                        {formatDate(subscription.nextBillingDate)}
                                    </td>

                                    <td className="p-4">
                                        <CustomerStatusBadge status={subscription.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CustomerSubscriptionsPage;
