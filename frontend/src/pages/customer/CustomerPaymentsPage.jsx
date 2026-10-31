
import { useEffect, useState } from "react";
import { getCustomerPayments } from "../../services/customerPortalService";

import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import CustomerLoading from "../../components/customer/CustomerLoading";
import CustomerError from "../../components/customer/CustomerError";
import CustomerEmptyState from "../../components/customer/CustomerEmptyState";
import CustomerStatusBadge from "../../components/customer/CustomerStatusBadge";

import {
    formatCurrency,
    formatDate,
} from "../../utils/customerFormatters";

function CustomerPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCustomerPayments();

            if (!response.success || !Array.isArray(response.data)) {
                throw new Error("Unable to load payments.");
            }

            setPayments(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load payments."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filteredPayments = payments.filter((payment) => {
        const matchesSearch =
            `${payment.transactionId || ""} ${payment.method || ""} ${payment.status || ""}`
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            payment.status?.toLowerCase() === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <CustomerPageHeader
                title="Payment History"
                description="Review your previous subscription payments."
            />

            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    placeholder="Search transaction or payment method..."
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
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {loading && <CustomerLoading message="Loading payments..." />}

            {!loading && error && (
                <CustomerError
                    message={error}
                    onRetry={fetchPayments}
                />
            )}

            {!loading && !error && filteredPayments.length === 0 && (
                <CustomerEmptyState
                    title="No payments found"
                    message="Try changing your search or status filter."
                />
            )}

            {!loading && !error && filteredPayments.length > 0 && (
                <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
                    <table className="w-full min-w-[750px] text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-4">Transaction ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Method</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id} className="border-t">
                                    <td className="p-4 font-medium text-gray-800">
                                        {payment.transactionId || "—"}
                                    </td>

                                    <td className="p-4 text-gray-600">
                                        {formatDate(payment.paymentDate)}
                                    </td>

                                    <td className="p-4 text-gray-600">
                                        {payment.method || "—"}
                                    </td>

                                    <td className="p-4 font-semibold">
                                        {formatCurrency(payment.amount)}
                                    </td>

                                    <td className="p-4">
                                        <CustomerStatusBadge status={payment.status} />
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

export default CustomerPaymentsPage;
