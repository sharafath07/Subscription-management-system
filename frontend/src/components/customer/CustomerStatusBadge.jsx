function CustomerStatusBadge({ status }) {
    const colors = {
        active: "bg-green-100 text-green-700",
        completed: "bg-green-100 text-green-700",
        paid: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        unpaid: "bg-yellow-100 text-yellow-700",
        overdue: "bg-red-100 text-red-700",
        cancelled: "bg-gray-100 text-gray-700",
        failed: "bg-red-100 text-red-700",
        expired: "bg-gray-100 text-gray-700",
    };

    const normalized = (status || "unknown").toLowerCase();

    return (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[normalized] || "bg-gray-100 text-gray-700"
            }`}>
            {status || "Unknown"}
        </span>
    );
}

export default CustomerStatusBadge;