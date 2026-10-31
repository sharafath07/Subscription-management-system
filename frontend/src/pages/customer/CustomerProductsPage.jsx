
import { useEffect, useState } from "react";
import { getCustomerProducts } from "../../services/customerPortalService";

import CustomerPageHeader from "../../components/customer/CustomerPageHeader";
import CustomerLoading from "../../components/customer/CustomerLoading";
import CustomerError from "../../components/customer/CustomerError";
import CustomerEmptyState from "../../components/customer/CustomerEmptyState";

function CustomerProductsPage() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getCustomerProducts();

            if (!response.success || !Array.isArray(response.data)) {
                throw new Error("Unable to load products.");
            }

            setProducts(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) =>
        `${product.name || ""} ${product.description || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div>
            <CustomerPageHeader
                title="Products"
                description="Explore the products available in our subscription platform."
            />

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
            </div>

            {loading && <CustomerLoading message="Loading products..." />}

            {!loading && error && (
                <CustomerError message={error} onRetry={fetchProducts} />
            )}

            {!loading && !error && filteredProducts.length === 0 && (
                <CustomerEmptyState
                    title="No products found"
                    message="Try another search or check back later."
                />
            )}

            {!loading && !error && filteredProducts.length > 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                                📦
                            </div>

                            <h2 className="text-lg font-bold text-gray-800">
                                {product.name}
                            </h2>

                            <p className="mt-2 min-h-12 text-sm text-gray-500">
                                {product.description || "No description available."}
                            </p>

                            <div className="mt-5 border-t pt-4">
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                    Available
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CustomerProductsPage;
