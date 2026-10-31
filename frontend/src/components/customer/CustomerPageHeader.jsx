function CustomerPageHeader({ title, description, action }) {
    return (
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    {title}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    {description}
                </p>
            </div>

            {action && <div>{action}</div>}
        </div>
    );
}

export default CustomerPageHeader;