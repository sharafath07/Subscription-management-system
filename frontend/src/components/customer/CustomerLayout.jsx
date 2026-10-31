import { Link, Outlet, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";

function CustomerLayout() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        logoutUser();
        navigate("/login", { replace: true });
    };

    const navItems = [
        { name: "Dashboard", path: "/customer/dashboard" },
        { name: "Browse Products", path: "/customer/products" },
        { name: "Browse Plans", path: "/customer/plans" },
        { name: "My Subscriptions", path: "/customer/subscriptions" },
        { name: "My Invoices", path: "/customer/invoices" },
        { name: "My Payments", path: "/customer/payments" },
        { name: "My Profile", path: "/customer/profile" },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-indigo-600">
                            Subscription Portal
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage your subscriptions
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">
                            Welcome, {user?.name || "Customer"}
                        </span>

                        <button
                            onClick={handleLogout}
                            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </header>

            <main className="mx-auto max-w-7xl p-6">
                <Outlet />
            </main>
        </div>
    );
}

export default CustomerLayout;