
import { Navigate, Outlet } from "react-router-dom";

function CustomerProtectedRoute() {
    const token = localStorage.getItem("token");

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        user = null;
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "CUSTOMER") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default CustomerProtectedRoute;
