
import { NavLink } from "react-router-dom";

const menuItems = [
    { name: "Dashboard", path: "/customer/dashboard", icon: "📊" },
    { name: "Products", path: "/customer/products", icon: "📦" },
    { name: "Plans", path: "/customer/plans", icon: "📋" },
    { name: "Subscriptions", path: "/customer/subscriptions", icon: "🔄" },
    { name: "Invoices", path: "/customer/invoices", icon: "🧾" },
    { name: "Payments", path: "/customer/payments", icon: "💳" },
    { name: "My Profile", path: "/customer/profile", icon: "👤" },
];

function CustomerSideBar({ isOpen, onClose }) {
    return (
        <>
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                />
            )}

            <aside
                className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          bg-gray-900 p-5 text-white transition-transform duration-300
          md:sticky md:top-0 md:h-screen md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Subscription</h2>
                        <p className="mt-1 text-xs text-gray-400">Customer Workspace</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-2xl md:hidden"
                        aria-label="Close menu"
                    >
                        ×
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                }`
                            }
                        >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-gray-700 pt-4 text-xs text-gray-400">
                    Customer Portal v1.0
                </div>
            </aside>
        </>
    );
}

export default CustomerSideBar;
