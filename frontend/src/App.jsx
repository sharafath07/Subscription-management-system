import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CustomerProtectedRoute from "./components/auth/CustomerProtectedRoute";

import LoginPage from "./pages/LoginPage";
import CustomerDashboardPage from "./pages/customer/CustomerDashboardPage";

import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import ProductsPage from "./pages/ProductsPage";
import PlansPage from "./pages/PlansPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import InvoicesPage from "./pages/InvoicesPage";
import PaymentsPage from "./pages/PaymentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CustomerLayout from "./components/customer/CustomerLayout";
import CustomerProductsPage from "./pages/customer/CustomerProductsPage";
import CustomerPlansPage from "./pages/customer/CustomerPlansPage";
import CustomerSubscriptionsPage from "./pages/customer/CustomerSubscriptionsPage";
import CustomerInvoicesPage from "./pages/customer/CustomerInvoicesPage";
import CustomerPaymentsPage from "./pages/customer/CustomerPaymentsPage";
import CustomerProfilePage from "./pages/customer/CustomerProfilePage";
import Register from "./pages/Register";

function PlaceholderPage({ title }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <h2 className="text-xl font-semibold text-slate-800">
        {title}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        This module is under development.
      </p>
    </div>
  );
}

// Redirect logged-in users according to their role
function LoginRoute() {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (token && user?.role === "CUSTOMER") {
    return <Navigate to="/customer/dashboard" replace />;
  }

  if (token && ["ADMIN", "STAFF"].includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN and STAFF routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />

            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>

        {/* CUSTOMER routes */}
        <Route element={<CustomerProtectedRoute />}>
          <Route element={<CustomerLayout />}>
            <Route
              path="/customer/dashboard"
              element={<CustomerDashboardPage />}
            />

            <Route
              path="/customer/products"
              element={<CustomerProductsPage />}
            />

            <Route
              path="/customer/plans"
              element={<CustomerPlansPage />}
            />

            <Route
              path="/customer/subscriptions"
              element={<CustomerSubscriptionsPage />}
            />

            <Route path="/customer/invoices" element={<CustomerInvoicesPage />} />

            <Route
              path="/customer/payments"
              element={<CustomerPaymentsPage />}
            />

            <Route
              path="/customer/profile"
              element={<CustomerProfilePage />}
            />
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;