
import { useState } from "react";
import { Link } from "react-router-dom";

const sampleProducts = [
    {
        id: "product-1",
        name: "Premium Software",
        description: "Premium subscription software for managing your business efficiently.",
        isActive: true,
    },
    {
        id: "product-2",
        name: "Business Management",
        description: "Tools to help organise and manage your business operations.",
        isActive: true,
    },
    {
        id: "product-3",
        name: "Cloud Storage",
        description: "Secure cloud storage for your important business documents.",
        isActive: true,
    },
];

function CustomerProductsPage() {
    const [search, setSearch] = useState("");

    const filteredProducts = sampleProducts.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <p className="text-sm text-slate-400">
                    Customer Portal / Products
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-800">
                    Browse Products
                </h1>

                <p className="mt-2 text-slate-500">
                    Explore our available products and find the right solution for you.
                </p>
            </div>

            {/* Search */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
            </div>

            {/* Product cards */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                                    📦
                                </div>

                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    Available
                                </span>
                            </div>

                            <h2 className="mt-5 text-xl font-semibold text-slate-800">
                                {product.name}
                            </h2>

                            <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                                {product.description}
                            </p>

                            <Link
                                to="/customer/plans"
                                className="mt-6 block rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Explore Plans
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
                    <div className="text-4xl">🔍</div>

                    <h2 className="mt-4 font-semibold text-slate-800">
                        No products found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Try searching with a different product name.
                    </p>
                </div>
            )}

            <p className="text-center text-xs text-slate-400">
                Preview using sample products. Live product data will be connected
                when the Customer API is ready.
            </p>

        </div>
    );
}

export default CustomerProductsPage;
