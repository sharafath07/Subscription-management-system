function CustomerError({ message, onRetry }) {
    return (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <div className="mb-3 text-4xl">⚠️</div>

            <h3 className="text-lg font-bold text-gray-800">
                Something went wrong
            </h3>

            <p className="my-3 text-sm text-red-600">
                {message || "Unable to load information."}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}

export default CustomerError;