
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";

function CustomerNavbar({ onMenuClick }) {
    const navigate = useNavigate();

    let user = {};

    try {
        user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
        user = {};
    }

    const handleLogout = () => {
        logoutUser();
        navigate("/login", { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-4 shadow-sm md:px-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="text-2xl text-gray-700 md:hidden"
                    aria-label="Open menu"
                >
                    ☰
                </button>

                <div>
                    <h1 className="text-lg font-bold text-gray-800 md:text-xl">
                        Customer Portal
                    </h1>
                    <p className="hidden text-xs text-gray-500 sm:block">
                        Subscription Management
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-gray-800">
                        {user.name || "Customer"}
                    </p>
                    <p className="text-xs text-gray-500">
                        {user.email || ""}
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default CustomerNavbar;
