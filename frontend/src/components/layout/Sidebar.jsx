
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Users,
    Package,
    ClipboardList,
    Repeat,
    FileText,
    Receipt,
    CreditCard,
    Percent,
    BarChart3,
    Settings,
    X,
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Plans', path: '/plans', icon: ClipboardList },
    { name: 'Subscriptions', path: '/subscriptions', icon: Repeat },
    { name: 'Quotations', path: '/quotations', icon: FileText },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Discounts', path: '/discounts', icon: Percent },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
]

function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-slate-700 px-5">
                    <h1 className="text-xl font-bold tracking-wide">
                        Subscript<span className="text-blue-400">Pro</span>
                    </h1>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-slate-800 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Main Menu
                    </p>

                    {navigation.map((item) => {
                        const Icon = item.icon

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                            >
                                <Icon size={19} />
                                {item.name}
                            </NavLink>
                        )
                    })}
                </nav>

                <div className="border-t border-slate-700 p-4">
                    <p className="text-xs text-slate-400">
                        Subscription Management System
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        Odoo Make-A-Ton 9.0 Hackathon
                    </p>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
