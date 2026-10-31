function CustomerEmptyState({
    title = "No records found",
    message = "There is no information available yet.",
    actionText,
    onAction,
}) {
    return (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <div className="mb-3 text-4xl">📂</div>

            <h3 className="text-lg font-bold text-gray-800">
                {title}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
                {message}
            </p>

            {actionText && onAction && (
                <button
                    onClick={onAction}
                    className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                    {actionText}
                </button>
            )}
        </div>
    );
}

export default CustomerEmptyState;