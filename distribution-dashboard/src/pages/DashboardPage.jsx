import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, ShoppingCart, AlertTriangle, Package, Plus } from 'lucide-react'
import api from '../api/client'
import { formatCurrency, formatDate } from '../utils/format'

function MetricCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [expiring, setExpiring] = useState([])

  useEffect(() => {
    const year = new Date().getFullYear()
    Promise.all([
      api.get(`/analytics/sales-monthly?year=${year}`),
      api.get('/analytics/low-stock'),
      api.get('/batches/expiring?days=30'),
      api.get('/analytics/credit-overview'),
      api.get('/products?page_size=1'),
    ]).then(([sales, low, exp, credit, products]) => {
      const thisMonth = new Date().getMonth() + 1
      const rev = sales.data.find(m => m.month === thisMonth)?.revenue || 0
      const orders = sales.data.find(m => m.month === thisMonth)?.order_count || 0
      setMetrics({
        revenue: rev,
        orders,
        credit: credit.data.total,
        products: products.data.length,
      })
      setLowStock(low.data.slice(0, 8))
      setExpiring(exp.data.slice(0, 8))
    }).catch(() => {})
  }, [])

  const today = new Date()
  const expiryColor = (d) => {
    const days = Math.ceil((new Date(d) - today) / 86400000)
    return days < 7 ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back — here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/inventory" className="flex items-center gap-1.5 px-3 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy-600 transition-colors">
            <Plus size={15} /> Add Item
          </Link>
          <Link to="/orders" className="flex items-center gap-1.5 px-3 py-2 bg-mint text-navy text-sm font-medium rounded-lg hover:bg-mint-600 transition-colors">
            <ShoppingCart size={15} /> New Order
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={DollarSign} label="Revenue This Month" value={formatCurrency(metrics?.revenue)} accent="bg-mint" sub="Current month" />
        <MetricCard icon={ShoppingCart} label="Orders This Month" value={metrics?.orders ?? '—'} accent="bg-navy" />
        <MetricCard
          icon={AlertTriangle}
          label="Outstanding Credit"
          value={formatCurrency(metrics?.credit)}
          accent={metrics?.credit > 0 ? 'bg-amber' : 'bg-mint'}
          sub={metrics?.credit > 0 ? 'Requires attention' : 'All clear'}
        />
        <MetricCard icon={Package} label="Active Products" value={metrics?.products ?? '—'} accent="bg-navy" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Low Stock Alerts</h2>
            <Link to="/inventory" className="text-xs text-navy font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {lowStock.length === 0 && <p className="text-sm text-gray-400 p-5 text-center">No low stock items</p>}
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-700 rounded-full">
                  {p.current_stock} / {p.min_stock_threshold} units
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expiry Warnings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Expiry Warnings (30 days)</h2>
            <Link to="/analytics" className="text-xs text-navy font-medium hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {expiring.length === 0 && <p className="text-sm text-gray-400 p-5 text-center">No upcoming expiries</p>}
            {expiring.map(b => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Batch #{b.id}</p>
                  <p className="text-xs text-gray-400">{b.quantity} units</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${expiryColor(b.expiry_date)}`}>
                  {formatDate(b.expiry_date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
