
import { useEffect, useState } from "react";
import { getCustomerInvoices } from "../../services/customerPortalService";

import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import CustomerLoading from "../../components/customer/CustomerLoading";
import CustomerError from "../../components/customer/CustomerError";
import CustomerEmptyState from "../../components/customer/CustomerEmptyState";
import CustomerStatusBadge from "../../components/customer/CustomerStatusBadge";

import {
    formatCurrency,
    formatDate,
} from "../../utils/customerFormatters";

function CustomerInvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCustomerInvoices();

            if (!response.success || !Array.isArray(response.data)) {
                throw new Error("Unable to load invoices.");
            }

            setInvoices(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load invoices."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const filteredInvoices = invoices.filter((invoice) => {
        const matchesSearch =
            `${invoice.invoiceNumber || ""} ${invoice.status || ""}`
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            invoice.status?.toLowerCase() === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <CustomerPageHeader
                title="My Invoices"
                description="View your invoices, payment status and outstanding balances."
            />

            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    placeholder="Search invoice number or status..."
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
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            {loading && <CustomerLoading message="Loading invoices..." />}

            {!loading && error && (
                <CustomerError
                    message={error}
                    onRetry={fetchInvoices}
                />
            )}

            {!loading && !error && filteredInvoices.length === 0 && (
                <CustomerEmptyState
                    title="No invoices found"
                    message="Try changing your search or status filter."
                />
            )}

            {!loading && !error && filteredInvoices.length > 0 && (
                <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
                    <table className="w-full min-w-[750px] text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-4">Invoice Number</th>
                                <th className="p-4">Issue Date</th>
                                <th className="p-4">Due Date</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Paid</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="border-t">
                                    <td className="p-4 font-semibold text-gray-800">
                                        {invoice.invoiceNumber || "—"}
                                    </td>

                                    <td className="p-4 text-gray-600">
                                        {formatDate(invoice.issueDate)}
                                    </td>

                                    <td className="p-4 text-gray-600">
                                        {formatDate(invoice.dueDate)}
                                    </td>

                                    <td className="p-4 font-medium">
                                        {formatCurrency(invoice.total)}
                                    </td>

                                    <td className="p-4 text-green-700">
                                        {formatCurrency(invoice.amountPaid)}
                                    </td>

                                    <td className="p-4">
                                        <CustomerStatusBadge status={invoice.status} />
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

export default CustomerInvoicesPage;
