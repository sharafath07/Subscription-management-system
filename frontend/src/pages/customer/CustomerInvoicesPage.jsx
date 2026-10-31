
import { useState } from "react";

const invoices = [
    {
        id: "INV-20261031-001",
        issueDate: "2026-10-31",
        dueDate: "2026-11-07",
        total: "999.00",
        amountPaid: "0.00",
        status: "SENT",
    },
    {
        id: "INV-20261020-002",
        issueDate: "2026-10-20",
        dueDate: "2026-10-27",
        total: "1500.00",
        amountPaid: "1500.00",
        status: "PAID",
    },
    {
        id: "INV-20261015-003",
        issueDate: "2026-10-15",
        dueDate: "2026-10-22",
        total: "2000.00",
        amountPaid: "500.00",
        status: "PARTIALLY_PAID",
    },
];

function CustomerInvoicesPage() {
    const [filter, setFilter] = useState("ALL");

    const filtered = invoices.filter(
        (invoice) => filter === "ALL" || invoice.status === filter
    );

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-IN");

    const statusStyle = {
        PAID: "bg-emerald-50 text-emerald-700",
        SENT: "bg-amber-50 text-amber-700",
        PARTIALLY_PAID: "bg-blue-50 text-blue-700",
        OVERDUE: "bg-red-50 text-red-700",
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm text-slate-400">Customer Portal / Invoices</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-800">My Invoices</h1>
                <p className="mt-2 text-sm text-slate-500">
                    View your billing history and outstanding amounts.
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <label className="mb-2 block text-sm font-medium text-slate-600">
                    Filter invoices
                </label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 sm:w-64"
                >
                    <option value="ALL">All invoices</option>
                    <option value="PAID">Paid</option>
                    <option value="SENT">Sent</option>
                    <option value="PARTIALLY_PAID">Partially paid</option>
                    <option value="OVERDUE">Overdue</option>
                </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[750px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-5 py-4">Invoice Number</th>
                            <th className="px-5 py-4">Issue Date</th>
                            <th className="px-5 py-4">Due Date</th>
                            <th className="px-5 py-4">Total</th>
                            <th className="px-5 py-4">Paid</th>
                            <th className="px-5 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map((invoice) => (
                            <tr key={invoice.id}>
                                <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                                    {invoice.id}
                                </td>
                                <td className="px-5 py-4 text-slate-500">
                                    {formatDate(invoice.issueDate)}
                                </td>
                                <td className="px-5 py-4 text-slate-500">
                                    {formatDate(invoice.dueDate)}
                                </td>
                                <td className="px-5 py-4 font-medium">
                                    ₹{Number(invoice.total).toLocaleString("en-IN")}
                                </td>
                                <td className="px-5 py-4">
                                    ₹{Number(invoice.amountPaid).toLocaleString("en-IN")}
                                </td>
                                <td className="px-5 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[invoice.status] || "bg-slate-100 text-slate-600"}`}>
                                        {invoice.status.replace("_", " ")}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-10 text-center text-slate-500">
                                    No invoices found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <p className="text-center text-xs text-slate-400">
                Sample invoice data — awaiting Customer API integration.
            </p>
        </div>
    );
}

export default CustomerInvoicesPage;
