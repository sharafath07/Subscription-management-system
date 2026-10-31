
import { useState } from "react";

const payments = [
    {
        id: "PAY-001",
        amount: "999.00",
        method: "UPI",
        status: "COMPLETED",
        transactionId: "UPI-DEMO-001",
        paymentDate: "2026-10-31",
    },
    {
        id: "PAY-002",
        amount: "1500.00",
        method: "CARD",
        status: "COMPLETED",
        transactionId: "CARD-DEMO-002",
        paymentDate: "2026-10-25",
    },
    {
        id: "PAY-003",
        amount: "500.00",
        method: "BANK_TRANSFER",
        status: "PENDING",
        transactionId: "BANK-DEMO-003",
        paymentDate: "2026-10-20",
    },
];

function CustomerPaymentsPage() {
    const [filter, setFilter] = useState("ALL");

    const filtered = payments.filter(
        (payment) => filter === "ALL" || payment.status === filter
    );

    const statusStyle = {
        COMPLETED: "bg-emerald-50 text-emerald-700",
        PENDING: "bg-amber-50 text-amber-700",
        FAILED: "bg-red-50 text-red-700",
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-slate-400">Customer Portal / Payments</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-800">
                    My Payments
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    View your payment history and transaction details.
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <label className="mb-2 block text-sm font-medium text-slate-600">
                    Filter payments
                </label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 sm:w-64"
                >
                    <option value="ALL">All payments</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[750px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-5 py-4">Payment ID</th>
                            <th className="px-5 py-4">Amount</th>
                            <th className="px-5 py-4">Method</th>
                            <th className="px-5 py-4">Transaction ID</th>
                            <th className="px-5 py-4">Date</th>
                            <th className="px-5 py-4">Status</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {filtered.map((payment) => (
                            <tr key={payment.id}>
                                <td className="px-5 py-4 font-medium text-slate-800">
                                    {payment.id}
                                </td>
                                <td className="px-5 py-4 font-semibold text-slate-800">
                                    ₹{Number(payment.amount).toLocaleString("en-IN")}
                                </td>
                                <td className="px-5 py-4 text-slate-600">
                                    {payment.method.replace("_", " ")}
                                </td>
                                <td className="px-5 py-4 text-slate-500">
                                    {payment.transactionId}
                                </td>
                                <td className="px-5 py-4 text-slate-500">
                                    {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                                </td>
                                <td className="px-5 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[payment.status] || "bg-slate-100 text-slate-600"}`}>
                                        {payment.status}
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-10 text-center text-slate-500">
                                    No payments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-center text-xs text-slate-400">
                Sample payment data — awaiting Customer API integration.
            </p>
        </div>
    );
}

export default CustomerPaymentsPage;
