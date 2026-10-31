
import { useState } from "react";
import { Outlet } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import CustomerSideBar from "./CustomerSideBar";
import CustomerFooter from "./CustomerFooter";

function CustomerLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <CustomerSideBar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <CustomerNavbar
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 p-4 md:p-6">
                    <Outlet />
                </main>

                <CustomerFooter />
            </div>
        </div>
    );
}

export default CustomerLayout;
