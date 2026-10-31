
import { Menu, LogOut, UserCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authService";

function Navbar({ onMenuClick }) {
    const location = useLocation();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const pageName =
        location.pathname === "/"
            ? "Dashboard"
            : location.pathname
                .split("/")
                .filter(Boolean)[0]
                .replace(/^\w/, (letter) => letter.toUpperCase());

    const handleLogout = () => {
        logoutUser();
        navigate("/login", { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">

            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                    aria-label="Open sidebar"
                >
                    <Menu size={22} />
                </button>

                <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        {pageName}
                    </h2>

                    <p className="hidden text-xs text-slate-500 sm:block">
                        Subscription Management System
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">

                {/* Logged-in User */}
                <div className="hidden items-center gap-2 sm:flex">
                    <UserCircle size={32} className="text-blue-600" />

                    <div>
                        <p className="text-sm font-semibold text-slate-800">
                            {user?.name || "User"}
                        </p>

                        <p className="text-xs text-slate-500">
                            {user?.role || "User"}
                        </p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Logout</span>
                </button>

            </div>
        </header>
    );
}

export default Navbar;
