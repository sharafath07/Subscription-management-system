
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getInvoices,
    updateInvoiceStatus,
} from "../services/invoiceService.js";

// Currency formatting
const money = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
};

// Date formatting
const dateFormat = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// Status badge
function StatusBadge({ status }) {
    const styles = {
        DRAFT: "bg-yellow-100 text-yellow-700",
        SENT: "bg-blue-100 text-blue-700",
        PARTIALLY_PAID: "bg-purple-100 text-purple-700",
        PAID: "bg-green-100 text-green-700",
        OVERDUE: "bg-orange-100 text-orange-700",
        VOID: "bg-red-100 text-red-700",
    };

    const labels = {
        DRAFT: "Draft",
        SENT: "Sent",
        PARTIALLY_PAID: "Partially Paid",
        PAID: "Paid",
        OVERDUE: "Overdue",
        VOID: "Void",
    };

    return (
        <span
            className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
                }`}
        >
            {labels[status] || status || "Unknown"}
        </span>
    );
}

export default function Invoices() {

    // Invoice data
    const [invoices, setInvoices] = useState([]);

    // Loading and errors
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search and filter
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    // Selected invoice
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Action loading
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState("");

    // Fetch invoices from backend
    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getInvoices();

            if (!response.success || !Array.isArray(response.data)) {
                throw new Error(
                    "Invalid invoice response from backend."
                );
            }

            setInvoices(response.data);

        } catch (err) {
            console.error("Invoice loading error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load invoices."
            );

        } finally {
            setLoading(false);
        }
    }, []);

    // Load invoices when page opens
    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    // Search and filter
    const filteredInvoices = useMemo(() => {
        return invoices.filter((invoice) => {

            const invoiceNumber = String(
                invoice.invoiceNumber || ""
            ).toLowerCase();

            const customerName = String(
                invoice.customer?.name || ""
            ).toLowerCase();

            const customerEmail = String(
                invoice.customer?.email || ""
            ).toLowerCase();

            const searchValue = search.toLowerCase();

            const matchesSearch =
                invoiceNumber.includes(searchValue) ||
                customerName.includes(searchValue) ||
                customerEmail.includes(searchValue);

            const matchesStatus =
                filter === "ALL" || invoice.status === filter;

            return matchesSearch && matchesStatus;
        });
    }, [invoices, search, filter]);

    // Summary cards
    const stats = [
        {
            title: "Total Invoices",
            value: invoices.filter(
                (invoice) => invoice.status !== "VOID"
            ).length,
            color: "text-gray-900",
        },
        {
            title: "Paid",
            value: invoices.filter(
                (invoice) => invoice.status === "PAID"
            ).length,
            color: "text-green-600",
        },
        {
            title: "Pending",
            value: invoices.filter(
                (invoice) =>
                    invoice.status === "SENT" ||
                    invoice.status === "PARTIALLY_PAID"
            ).length,
            color: "text-blue-600",
        },
        {
            title: "Overdue",
            value: invoices.filter(
                (invoice) => invoice.status === "OVERDUE"
            ).length,
            color: "text-orange-600",
        },
    ];

    // Confirm invoice: DRAFT -> SENT
    const handleConfirm = async (invoice) => {
        try {
            setActionLoading(true);
            setActionError("");

            await updateInvoiceStatus(invoice.id, "SENT");

            await fetchInvoices();

            setSelectedInvoice(null);

        } catch (err) {
            console.error("Confirm invoice error:", err);

            setActionError(
                err.response?.data?.message ||
                err.message ||
                "Unable to confirm invoice."
            );

        } finally {
            setActionLoading(false);
        }
    };

    // Cancel invoice: status -> VOID
    const handleCancel = async (invoice) => {
        const confirmed = window.confirm(
            `Are you sure you want to void invoice ${invoice.invoiceNumber}?`
        );

        if (!confirmed) return;

        try {
            setActionLoading(true);
            setActionError("");

            await updateInvoiceStatus(invoice.id, "VOID");

            await fetchInvoices();

            setSelectedInvoice(null);

        } catch (err) {
            console.error("Cancel invoice error:", err);

            setActionError(
                err.response?.data?.message ||
                err.message ||
                "Unable to cancel invoice."
            );

        } finally {
            setActionLoading(false);
        }
    };

    // Print invoice
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

            {/* HEADER */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Invoices
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage and track customer invoices.
                    </p>
                </div>

                <button
                    onClick={fetchInvoices}
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Loading..." : "Refresh Invoices"}
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm text-gray-500">
                            {stat.title}
                        </p>

                        <h2
                            className={`mt-2 text-3xl font-bold ${stat.color}`}
                        >
                            {stat.value}
                        </h2>
                    </div>
                ))}

            </div>

            {/* SEARCH AND FILTER */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">

                <input
                    type="text"
                    placeholder="Search invoice number, customer or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 sm:flex-1"
                />

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PARTIALLY_PAID">
                        Partially Paid
                    </option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="VOID">Void</option>
                </select>

            </div>

            {/* ERROR */}
            {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}

                    <button
                        onClick={fetchInvoices}
                        className="ml-3 font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* INVOICE TABLE */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 p-5">

                    <h2 className="font-semibold text-gray-900">
                        All Invoices
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {filteredInvoices.length} invoices found
                    </p>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full text-left text-sm">

                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="whitespace-nowrap px-5 py-4">
                                    Invoice Number
                                </th>

                                <th className="whitespace-nowrap px-5 py-4">
                                    Customer
                                </th>

                                <th className="whitespace-nowrap px-5 py-4">
                                    Issue Date
                                </th>

                                <th className="whitespace-nowrap px-5 py-4">
                                    Due Date
                                </th>

                                <th className="whitespace-nowrap px-5 py-4">
                                    Total
                                </th>

                                <th className="whitespace-nowrap px-5 py-4">
                                    Status
                                </th>

                                <th className="whitespace-nowrap px-5 py-4">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-5 py-12 text-center text-gray-500"
                                    >
                                        Loading invoices...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-5 py-12 text-center text-gray-500"
                                    >
                                        Unable to load invoice records.
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-5 py-12 text-center text-gray-500"
                                    >
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => (

                                    <tr
                                        key={invoice.id}
                                        className="hover:bg-gray-50"
                                    >

                                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-600">
                                            {invoice.invoiceNumber}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">

                                            <p className="font-medium text-gray-900">
                                                {invoice.customer?.name || "-"}
                                            </p>

                                            <p className="text-xs text-gray-500">
                                                {invoice.customer?.email || "-"}
                                            </p>

                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                            {dateFormat(invoice.issueDate)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                            {dateFormat(invoice.dueDate)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">
                                            {money(invoice.total)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <StatusBadge
                                                status={invoice.status}
                                            />
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">

                                            <button
                                                onClick={() =>
                                                    setSelectedInvoice(invoice)
                                                }
                                                className="font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                View Details
                                            </button>

                                        </td>

                                    </tr>

                                ))
                            )}

                        </tbody>
                    </table>

                </div>
            </div>

            {/* INVOICE DETAILS MODAL */}
            {selectedInvoice && (

                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

                    <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-xl">

                        {/* MODAL HEADER */}
                        <div className="flex items-center justify-between border-b p-5 print:hidden">

                            <h2 className="text-lg font-bold text-gray-900">
                                Invoice Details
                            </h2>

                            <button
                                onClick={() => {
                                    setSelectedInvoice(null);
                                    setActionError("");
                                }}
                                className="text-2xl text-gray-500 hover:text-gray-900"
                            >
                                &times;
                            </button>

                        </div>

                        {/* PRINTABLE INVOICE */}
                        <div className="print-area p-6 sm:p-8">

                            <div className="mb-8 flex justify-between gap-4">

                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        BRIGHTLOOP
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Software Subscription Management
                                    </p>
                                </div>

                                <div className="text-right">

                                    <h3 className="text-xl font-bold">
                                        INVOICE
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        {selectedInvoice.invoiceNumber}
                                    </p>

                                    <div className="mt-2">
                                        <StatusBadge
                                            status={selectedInvoice.status}
                                        />
                                    </div>

                                </div>

                            </div>

                            {/* CUSTOMER DETAILS */}
                            <div className="mb-8 grid grid-cols-2 gap-4 text-sm">

                                <div>

                                    <p className="mb-2 font-semibold text-gray-500">
                                        BILL TO
                                    </p>

                                    <p className="font-semibold text-gray-900">
                                        {selectedInvoice.customer?.name || "-"}
                                    </p>

                                    <p className="text-gray-500">
                                        {selectedInvoice.customer?.email || "-"}
                                    </p>

                                </div>

                                <div className="text-right">

                                    <p className="text-gray-500">
                                        Invoice Date
                                    </p>

                                    <p className="font-medium">
                                        {dateFormat(selectedInvoice.issueDate)}
                                    </p>

                                    <p className="mt-2 text-gray-500">
                                        Due Date
                                    </p>

                                    <p className="font-medium">
                                        {dateFormat(selectedInvoice.dueDate)}
                                    </p>

                                </div>

                            </div>

                            {/* SUBSCRIPTION DETAILS */}
                            <div className="mb-6 rounded-lg bg-gray-50 p-4 text-sm">

                                <p className="font-semibold text-gray-700">
                                    Subscription Information
                                </p>

                                <p className="mt-2 text-gray-500">
                                    Subscription ID:{" "}
                                    {selectedInvoice.subscriptionId || "No subscription"}
                                </p>

                                <p className="mt-1 text-gray-500">
                                    Subscription Status:{" "}
                                    {selectedInvoice.subscription?.status || "-"}
                                </p>

                            </div>

                            {/* AMOUNT DETAILS */}
                            <div className="border-y py-5">

                                <div className="flex justify-between py-2 text-sm">
                                    <span>Subtotal</span>
                                    <span>
                                        {money(selectedInvoice.subtotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between py-2 text-sm">
                                    <span>
                                        Tax ({Number(selectedInvoice.taxRate) || 0}%)
                                    </span>

                                    <span>
                                        {money(selectedInvoice.taxAmount)}
                                    </span>
                                </div>

                                <div className="flex justify-between py-2 text-sm">
                                    <span>Discount</span>

                                    <span>
                                        -{money(selectedInvoice.discountAmount)}
                                    </span>
                                </div>

                                <div className="mt-3 flex justify-between border-t pt-4 text-lg font-bold">
                                    <span>Total</span>

                                    <span>
                                        {money(selectedInvoice.total)}
                                    </span>
                                </div>

                                <div className="mt-3 flex justify-between text-sm">
                                    <span>Amount Paid</span>

                                    <span className="font-medium text-green-600">
                                        {money(selectedInvoice.amountPaid)}
                                    </span>
                                </div>

                                <div className="mt-2 flex justify-between text-sm font-semibold">
                                    <span>Balance Due</span>

                                    <span>
                                        {money(
                                            Number(selectedInvoice.total) -
                                            Number(selectedInvoice.amountPaid)
                                        )}
                                    </span>
                                </div>

                            </div>

                            {/* PAYMENT HISTORY */}
                            <div className="mt-6">

                                <h3 className="mb-3 font-semibold text-gray-900">
                                    Payment History
                                </h3>

                                {selectedInvoice.payments?.length > 0 ? (

                                    <div className="space-y-2">

                                        {selectedInvoice.payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="flex justify-between rounded-lg bg-gray-50 p-3 text-sm"
                                            >
                                                <div>
                                                    <p className="font-medium">
                                                        {payment.paymentMethod || "Payment"}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {dateFormat(payment.paymentDate)}
                                                    </p>
                                                </div>

                                                <p className="font-semibold">
                                                    {money(payment.amount)}
                                                </p>
                                            </div>
                                        ))}

                                    </div>

                                ) : (

                                    <p className="text-sm text-gray-500">
                                        No payments recorded yet.
                                    </p>

                                )}

                            </div>

                            <p className="mt-8 text-center text-sm text-gray-500">
                                Thank you for your business!
                            </p>

                        </div>

                        {/* ACTION ERROR */}
                        {actionError && (
                            <div className="mx-5 mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 print:hidden">
                                {actionError}
                            </div>
                        )}

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-wrap justify-end gap-2 border-t p-5 print:hidden">

                            {selectedInvoice.status === "DRAFT" && (

                                <button
                                    onClick={() => handleConfirm(selectedInvoice)}
                                    disabled={actionLoading}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {actionLoading
                                        ? "Please wait..."
                                        : "Confirm Invoice"}
                                </button>

                            )}

                            {["DRAFT", "SENT", "OVERDUE"].includes(
                                selectedInvoice.status
                            ) && (

                                    <button
                                        onClick={() => handleCancel(selectedInvoice)}
                                        disabled={actionLoading}
                                        className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                                    >
                                        Cancel Invoice
                                    </button>

                                )}

                            <button
                                onClick={handlePrint}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Print Invoice
                            </button>

                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* PRINT CSS */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    .print-area,
                    .print-area * {
                        visibility: visible !important;
                    }

                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 30px !important;
                    }
                }
            `}</style>

        </div>
    );
}
