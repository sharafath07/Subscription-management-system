
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getPayments,
    createPayment,
} from "../services/paymentService.js";

import {
    getInvoices,
} from "../services/invoiceService.js";

// Currency formatter
const money = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
};

// Date formatter
const dateFormat = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// Local date for date input
const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Payment method labels
const methodLabels = {
    CASH: "Cash",
    CARD: "Card",
    BANK_TRANSFER: "Bank Transfer",
    UPI: "UPI",
    OTHER: "Other",
};

// Payment status badge
function PaymentStatus({ status }) {
    const styles = {
        COMPLETED: "bg-green-100 text-green-700",
        PENDING: "bg-yellow-100 text-yellow-700",
        FAILED: "bg-red-100 text-red-700",
        REFUNDED: "bg-purple-100 text-purple-700",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-700"
                }`}
        >
            {status || "Unknown"}
        </span>
    );
}

export default function Payments() {

    // Backend data
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);

    // Loading and errors
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search and filters
    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Payment form
    const [showForm, setShowForm] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("UPI");
    const [transactionId, setTransactionId] = useState("");
    const [paymentDate, setPaymentDate] = useState(getToday());
    const [notes, setNotes] = useState("");

    // Form state
    const [formError, setFormError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Selected payment details
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Get selected invoice
    const selectedInvoice = invoices.find(
        (invoice) => invoice.id === selectedInvoiceId
    );

    // Calculate outstanding balance
    const balance = selectedInvoice
        ? Math.max(
            0,
            Number(selectedInvoice.total) -
            Number(selectedInvoice.amountPaid)
        )
        : 0;

    // Fetch payments and invoices
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [paymentResponse, invoiceResponse] =
                await Promise.all([
                    getPayments(),
                    getInvoices(),
                ]);

            if (
                !paymentResponse.success ||
                !Array.isArray(paymentResponse.data)
            ) {
                throw new Error(
                    "Invalid payment response from backend."
                );
            }

            if (
                !invoiceResponse.success ||
                !Array.isArray(invoiceResponse.data)
            ) {
                throw new Error(
                    "Invalid invoice response from backend."
                );
            }

            setPayments(paymentResponse.data);
            setInvoices(invoiceResponse.data);

        } catch (err) {
            console.error("Payment loading error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load payment information."
            );

        } finally {
            setLoading(false);
        }
    }, []);

    // Load data on page open
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Search and filter payments
    const filteredPayments = useMemo(() => {
        const query = search.trim().toLowerCase();

        return payments.filter((payment) => {
            const paymentId = String(payment.id || "").toLowerCase();

            const invoiceNumber = String(
                payment.invoice?.invoiceNumber || ""
            ).toLowerCase();

            const customer = String(
                payment.invoice?.customer?.name || ""
            ).toLowerCase();

            const matchesSearch =
                paymentId.includes(query) ||
                invoiceNumber.includes(query) ||
                customer.includes(query) ||
                String(payment.transactionId || "")
                    .toLowerCase()
                    .includes(query);

            const matchesMethod =
                methodFilter === "ALL" ||
                payment.method === methodFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                payment.status === statusFilter;

            return (
                matchesSearch &&
                matchesMethod &&
                matchesStatus
            );
        });
    }, [payments, search, methodFilter, statusFilter]);

    // Summary cards
    const completedPayments = payments.filter(
        (payment) => payment.status === "COMPLETED"
    );

    const totalReceived = completedPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
    );

    const outstandingAmount = invoices.reduce(
        (sum, invoice) => {
            if (invoice.status === "VOID" || invoice.status === "PAID") {
                return sum;
            }

            return sum + Math.max(
                0,
                Number(invoice.total || 0) -
                Number(invoice.amountPaid || 0)
            );
        },
        0
    );

    const stats = [
        {
            title: "Total Payments",
            value: payments.length,
            color: "text-gray-900",
        },
        {
            title: "Total Received",
            value: money(totalReceived),
            color: "text-green-600",
        },
        {
            title: "Completed Payments",
            value: completedPayments.length,
            color: "text-blue-600",
        },
        {
            title: "Outstanding Amount",
            value: money(outstandingAmount),
            color: "text-orange-600",
        },
    ];

    // Reset payment form
    const resetForm = () => {
        setSelectedInvoiceId("");
        setAmount("");
        setMethod("UPI");
        setTransactionId("");
        setPaymentDate(getToday());
        setNotes("");
        setFormError("");
    };

    // Open form
    const openPaymentForm = () => {
        setSuccess("");
        resetForm();
        setShowForm(true);
    };

    // Record payment using backend API
    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormError("");
        setSuccess("");

        if (!selectedInvoice) {
            setFormError("Please select an invoice.");
            return;
        }

        const paymentAmount = Number(amount);

        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
            setFormError("Enter a valid payment amount.");
            return;
        }

        if (paymentAmount > balance) {
            setFormError(
                `Payment cannot exceed the outstanding balance of ${money(balance)}.`
            );
            return;
        }

        if (!paymentDate) {
            setFormError("Please select a payment date.");
            return;
        }

        const allowedStatuses = [
            "SENT",
            "OVERDUE",
            "PARTIALLY_PAID",
        ];

        if (!allowedStatuses.includes(selectedInvoice.status)) {
            setFormError("This invoice is not eligible for payment.");
            return;
        }

        // Build request using actual backend field names
        const paymentData = {
            invoiceId: selectedInvoice.id,
            amount: paymentAmount,
            method,
            paymentDate: new Date(
                `${paymentDate}T00:00:00`
            ).toISOString(),
        };

        // Optional fields
        if (transactionId.trim()) {
            paymentData.transactionId = transactionId.trim();
        }

        if (notes.trim()) {
            paymentData.notes = notes.trim();
        }

        try {
            setSubmitting(true);

            const response = await createPayment(paymentData);

            if (response.success === false) {
                throw new Error(
                    response.message || "Payment could not be recorded."
                );
            }

            setShowForm(false);
            resetForm();

            setSuccess("Payment recorded successfully!");

            // Reload payments and invoices from backend
            await fetchData();

        } catch (err) {
            console.error("Payment recording error:", err);

            setFormError(
                err.response?.data?.message ||
                err.message ||
                "Failed to record payment."
            );

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

            {/* PAGE HEADER */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Payments
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage payment transactions and history.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Refresh
                    </button>

                    <button
                        onClick={openPaymentForm}
                        className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        + Record Payment
                    </button>

                </div>
            </div>

            {/* SUCCESS MESSAGE */}
            {success && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}

                    <button
                        onClick={fetchData}
                        className="font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

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

                        <h2 className={`mt-2 text-2xl font-bold ${stat.color}`}>
                            {stat.value}
                        </h2>
                    </div>
                ))}

            </div>

            {/* SEARCH AND FILTERS */}
            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search payment, invoice or customer..."
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                    <option value="ALL">All Methods</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="OTHER">Other</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                    <option value="ALL">All Payment Statuses</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                </select>

            </div>

            {/* PAYMENT HISTORY */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 p-5">

                    <h2 className="font-semibold text-gray-900">
                        Payment History
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {filteredPayments.length} payment records found
                    </p>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full text-left text-sm">

                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="whitespace-nowrap px-5 py-4">
                                    Payment ID
                                </th>

                                <th className="whitespace-nowrap px-5 py-4">
                                    Invoice
                                </th>

                                <th className="whitespace-nowrap px-5 py-4">
                                    Customer
                                </th>

                                <th className="whitespace-nowrap px-5 py-4">
                                    Amount
                                </th>

                                <th className="whitespace-nowrap px-5 py-4">
                                    Method
                                </th>

                                <th className="whitespace-nowrap px-5 py-4">
                                    Date
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
                                        colSpan="8"
                                        className="px-5 py-12 text-center text-gray-500"
                                    >
                                        Loading payments...
                                    </td>
                                </tr>

                            ) : error ? (

                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-5 py-12 text-center text-gray-500"
                                    >
                                        Unable to load payments.
                                    </td>
                                </tr>

                            ) : filteredPayments.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="8"
                                        className="px-5 py-12 text-center text-gray-500"
                                    >
                                        No payment records found.
                                    </td>
                                </tr>

                            ) : (

                                filteredPayments.map((payment) => (

                                    <tr
                                        key={payment.id}
                                        className="hover:bg-gray-50"
                                    >

                                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-600">
                                            {payment.id}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                                            {payment.invoice?.invoiceNumber || "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                                            {payment.invoice?.customer?.name || "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-green-600">
                                            {money(payment.amount)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            {methodLabels[payment.method] || payment.method}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                                            {dateFormat(payment.paymentDate)}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <PaymentStatus status={payment.status} />
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4">
                                            <button
                                                onClick={() =>
                                                    setSelectedPayment(payment)
                                                }
                                                className="font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                View
                                            </button>
                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>
                    </table>

                </div>
            </div>

            {/* RECORD PAYMENT MODAL */}
            {showForm && (

                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

                    <div className="my-auto w-full max-w-xl rounded-xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b p-5">

                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Record New Payment
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Enter payment information below.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                                className="text-2xl text-gray-500 hover:text-gray-900"
                            >
                                &times;
                            </button>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-5"
                        >

                            {/* ERROR */}
                            {formError && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {formError}
                                </div>
                            )}

                            {/* INVOICE SELECT */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Select Invoice *
                                </label>

                                <select
                                    value={selectedInvoiceId}
                                    onChange={(e) => {
                                        setSelectedInvoiceId(e.target.value);
                                        setAmount("");
                                        setFormError("");
                                    }}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="">
                                        Choose an invoice
                                    </option>

                                    {invoices
                                        .filter((invoice) =>
                                            [
                                                "SENT",
                                                "OVERDUE",
                                                "PARTIALLY_PAID",
                                            ].includes(invoice.status) &&
                                            Number(invoice.total) >
                                            Number(invoice.amountPaid)
                                        )
                                        .map((invoice) => (
                                            <option
                                                key={invoice.id}
                                                value={invoice.id}
                                            >
                                                {invoice.invoiceNumber} -{" "}
                                                {invoice.customer?.name || "Customer"} -{" "}
                                                Balance:{" "}
                                                {money(
                                                    Number(invoice.total) -
                                                    Number(invoice.amountPaid)
                                                )}
                                            </option>
                                        ))}
                                </select>

                                {invoices.length === 0 && (
                                    <p className="mt-2 text-xs text-orange-600">
                                        No invoices are currently available.
                                    </p>
                                )}
                            </div>

                            {/* BALANCE */}
                            {selectedInvoice && (
                                <div className="grid grid-cols-2 gap-3 rounded-lg bg-blue-50 p-4">

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Invoice Total
                                        </p>

                                        <p className="mt-1 font-semibold">
                                            {money(selectedInvoice.total)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Already Paid
                                        </p>

                                        <p className="mt-1 font-semibold text-green-600">
                                            {money(selectedInvoice.amountPaid)}
                                        </p>
                                    </div>

                                    <div className="col-span-2 border-t border-blue-200 pt-3">

                                        <p className="text-xs text-gray-500">
                                            Outstanding Balance
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-blue-700">
                                            {money(balance)}
                                        </p>

                                    </div>

                                </div>
                            )}

                            {/* AMOUNT */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Payment Amount (₹) *
                                </label>

                                <input
                                    type="number"
                                    min="0.01"
                                    max={balance || undefined}
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter payment amount"
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />

                                {selectedInvoice && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAmount(balance.toFixed(2))
                                        }
                                        className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                                    >
                                        Pay full outstanding balance
                                    </button>
                                )}

                            </div>

                            {/* PAYMENT METHOD */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Payment Method *
                                </label>

                                <select
                                    value={method}
                                    onChange={(e) => setMethod(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Card</option>
                                    <option value="BANK_TRANSFER">
                                        Bank Transfer
                                    </option>
                                    <option value="UPI">UPI</option>
                                    <option value="OTHER">Other</option>
                                </select>

                            </div>

                            {/* TRANSACTION ID */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Transaction ID
                                </label>

                                <input
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) =>
                                        setTransactionId(e.target.value)
                                    }
                                    placeholder="Enter transaction reference (optional)"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />

                            </div>

                            {/* PAYMENT DATE */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Payment Date *
                                </label>

                                <input
                                    type="date"
                                    value={paymentDate}
                                    max={getToday()}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />

                            </div>

                            {/* NOTES */}
                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Payment Notes
                                </label>

                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add payment notes (optional)"
                                    rows="3"
                                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />

                            </div>

                            {/* BUTTONS */}
                            <div className="flex justify-end gap-3 border-t pt-5">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        resetForm();
                                    }}
                                    disabled={submitting}
                                    className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        !selectedInvoice ||
                                        balance <= 0
                                    }
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Recording..."
                                        : "Record Payment"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>

            )}

            {/* PAYMENT DETAILS MODAL */}
            {selectedPayment && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b p-5">

                            <h2 className="text-lg font-bold text-gray-900">
                                Payment Details
                            </h2>

                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="text-2xl text-gray-500"
                            >
                                &times;
                            </button>

                        </div>

                        <div className="space-y-4 p-6">

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Payment ID
                                </span>

                                <span className="max-w-56 break-all text-right font-medium">
                                    {selectedPayment.id}
                                </span>
                            </div>

                            <div className="flex justify-between gap-3">
                                <span className="text-gray-500">
                                    Invoice
                                </span>

                                <span className="text-right font-medium">
                                    {selectedPayment.invoice?.invoiceNumber || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Customer
                                </span>

                                <span className="font-medium">
                                    {selectedPayment.invoice?.customer?.name || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Amount
                                </span>

                                <span className="font-bold text-green-600">
                                    {money(selectedPayment.amount)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Method
                                </span>

                                <span className="font-medium">
                                    {methodLabels[selectedPayment.method] ||
                                        selectedPayment.method}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Transaction ID
                                </span>

                                <span className="max-w-48 break-all text-right font-medium">
                                    {selectedPayment.transactionId || "-"}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Payment Date
                                </span>

                                <span className="font-medium">
                                    {dateFormat(selectedPayment.paymentDate)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Status
                                </span>

                                <PaymentStatus status={selectedPayment.status} />
                            </div>

                            <div>
                                <p className="mb-2 text-gray-500">
                                    Notes
                                </p>

                                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                                    {selectedPayment.notes || "No notes"}
                                </p>
                            </div>

                        </div>

                        <div className="border-t p-5 text-right">
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>

            )}

        </div>
    );
}
