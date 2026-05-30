import { Outlet, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Truck,
  BarChart3, Settings, Bell, Menu, Zap
} from 'lucide-react'
import api from '../api/client'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/operations', icon: Zap, label: 'Operations' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const [alerts, setAlerts] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/batches/low-stock'),
      api.get('/batches/expiring?days=30'),
    ]).then(([low, expiring]) => {
      setAlerts(low.data.length + expiring.data.length)
    }).catch(() => {})
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-60 bg-navy flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <img src="/logo.png" alt="Golden Cedar" className="w-10 h-10 rounded-lg object-contain" />
          <div>
            <span className="text-white font-semibold text-lg block">Golden Cedar</span>
            <span className="text-white/60 text-xs">Trading Company</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Golden Cedar" className="w-8 h-8 rounded-full object-contain" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Golden Cedar</p>
              <p className="text-white/40 text-xs capitalize">Trading Co.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
          <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <button className="relative text-gray-500 hover:text-navy transition-colors">
            <Bell size={20} />
            {alerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {alerts > 9 ? '9+' : alerts}
              </span>
            )}
          </button>
          <span className="text-sm text-gray-600 font-medium">Golden Cedar Trading</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
