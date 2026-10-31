function CustomerLoading({ message = "Loading..." }) {
    return (
        <div className="flex min-h-48 items-center justify-center">
            <div className="text-center">
                <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="text-sm text-gray-500">{message}</p>
            </div>
        </div>
    );
}

export default CustomerLoading;