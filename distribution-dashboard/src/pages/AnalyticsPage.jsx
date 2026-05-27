import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '../api/client'
import { formatCurrency } from '../utils/format'
import { Table, Th, Td, Tr } from '../components/ui/Table'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const PIE_COLORS = ['#0D3B6E', '#4ECFA8', '#E8A838', '#5086C5', '#2DB98D', '#8AAED9']

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function PeriodSelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="input-field w-32 text-xs">
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
      <option value="365d">Last 365 days</option>
    </select>
  )
}

export default function AnalyticsPage() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [salesData, setSalesData] = useState([])
  const [topPeriod, setTopPeriod] = useState('30d')
  const [topBy, setTopBy] = useState('revenue')
  const [topProducts, setTopProducts] = useState([])
  const [catPeriod, setCatPeriod] = useState('30d')
  const [categories, setCategories] = useState([])
  const [margins, setMargins] = useState([])
  const [creditData, setCreditData] = useState(null)
  const [invValue, setInvValue] = useState(null)
  const [expiryData, setExpiryData] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [marginSort, setMarginSort] = useState({ col: 'margin_pct', dir: 'desc' })

  useEffect(() => {
    api.get(`/analytics/sales-monthly?year=${year}`).then(r => setSalesData(r.data)).catch(() => {})
  }, [year])

  useEffect(() => {
    api.get(`/analytics/top-products?period=${topPeriod}&by=${topBy}&limit=10`).then(r => setTopProducts(r.data)).catch(() => {})
  }, [topPeriod, topBy])

  useEffect(() => {
    api.get(`/analytics/category-breakdown?period=${catPeriod}`).then(r => setCategories(r.data)).catch(() => {})
  }, [catPeriod])

  useEffect(() => {
    api.get('/analytics/profit-margins').then(r => setMargins(r.data)).catch(() => {})
    api.get('/analytics/credit-overview').then(r => setCreditData(r.data)).catch(() => {})
    api.get('/analytics/inventory-value').then(r => setInvValue(r.data)).catch(() => {})
    api.get('/analytics/expiry-risk').then(r => setExpiryData(r.data)).catch(() => {})
    api.get('/analytics/low-stock').then(r => setLowStock(r.data)).catch(() => {})
  }, [])

  const sortedMargins = [...margins].sort((a, b) => {
    const mul = marginSort.dir === 'asc' ? 1 : -1
    return (a[marginSort.col] - b[marginSort.col]) * mul
  })

  const toggleSort = (col) => setMarginSort(s => ({ col, dir: s.col === col && s.dir === 'desc' ? 'asc' : 'desc' }))

  const marginColor = (pct) => pct > 30 ? 'text-green-600' : pct >= 15 ? 'text-amber-600' : 'text-red-600'

  const creditPieData = creditData ? [
    { name: 'Current', value: creditData.buckets.current },
    { name: '30 days', value: creditData.buckets['30'] },
    { name: '60 days', value: creditData.buckets['60'] },
    { name: '90+ days', value: creditData.buckets['90+'] },
  ].filter(d => d.value > 0) : []

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1 - Monthly Sales */}
        <Card title="Monthly Sales Revenue">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Year</span>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="input-field w-28 text-xs">
              {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData.map(d => ({ ...d, name: MONTHS[d.month - 1], revenue: d.revenue / 100 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#0D3B6E' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#4ECFA8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Card 2 - Top Products */}
        <Card title="Top Selling Items">
          <div className="flex gap-2 mb-4">
            <PeriodSelect value={topPeriod} onChange={setTopPeriod} />
            <select value={topBy} onChange={e => setTopBy(e.target.value)} className="input-field w-32 text-xs">
              <option value="revenue">By Revenue</option>
              <option value="quantity">By Quantity</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts.map(p => ({ ...p, value: topBy === 'revenue' ? p.total_revenue / 100 : p.total_qty }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => topBy === 'revenue' ? `$${v}` : v} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#0D3B6E' }} />
              <Tooltip formatter={(v) => [topBy === 'revenue' ? `$${v.toFixed(2)}` : v, topBy === 'revenue' ? 'Revenue' : 'Qty']} />
              <Bar dataKey="value" fill="#0D3B6E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Card 3 - Category Breakdown */}
        <Card title="Category Breakdown">
          <div className="flex justify-end mb-4"><PeriodSelect value={catPeriod} onChange={setCatPeriod} /></div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categories} dataKey="revenue" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend iconType="circle" iconSize={8} formatter={(v, entry) => `${v} (${entry.payload.percentage}%)`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Card 4 - Profit Margins */}
        <Card title="Profit Margin per Product">
          <div className="flex justify-end mb-4">
            <button onClick={() => window.open(`${import.meta.env.VITE_API_URL}/export/products`, '_blank')} className="btn-outline flex items-center gap-1 text-xs">
              <Download size={13} /> Export
            </button>
          </div>
          <div className="overflow-auto max-h-56">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Product</th>
                  {[['cost_price', 'Cost'], ['selling_price', 'Sell Price'], ['margin', 'Margin $'], ['margin_pct', 'Margin %']].map(([col, label]) => (
                    <th key={col} className="text-right py-2 text-gray-500 font-medium cursor-pointer hover:text-navy" onClick={() => toggleSort(col)}>
                      {label} {marginSort.col === col ? (marginSort.dir === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedMargins.slice(0, 20).map(p => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-1.5 pr-4 truncate max-w-32">{p.name}</td>
                    <td className="py-1.5 text-right">{formatCurrency(p.cost_price)}</td>
                    <td className="py-1.5 text-right">{formatCurrency(p.selling_price)}</td>
                    <td className="py-1.5 text-right font-medium">{formatCurrency(p.margin)}</td>
                    <td className={`py-1.5 text-right font-semibold ${marginColor(p.margin_pct)}`}>{p.margin_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Card 5 - Credit & Payments */}
        <Card title="Credit & Outstanding Payments">
          {creditData && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[['Total', creditData.total], ['Current', creditData.buckets.current], ['30d', creditData.buckets['30']], ['90d+', creditData.buckets['90+']]].map(([k, v]) => (
                  <div key={k} className="text-center">
                    <p className="text-xs text-gray-500">{k}</p>
                    <p className={`font-bold text-sm ${v > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{formatCurrency(v)}</p>
                  </div>
                ))}
              </div>
              {creditPieData.length > 0 && (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={creditPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                      {creditPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="max-h-40 overflow-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-gray-100"><th className="text-left py-1.5 text-gray-500">Client</th><th className="text-right text-gray-500">Owed</th><th className="text-right text-gray-500">Days</th></tr></thead>
                  <tbody>
                    {creditData.clients.map(c => (
                      <tr key={c.id} className="border-b border-gray-50">
                        <td className="py-1.5">{c.name}</td>
                        <td className="text-right text-amber-600 font-semibold">{formatCurrency(c.outstanding_balance)}</td>
                        <td className="text-right text-gray-500">{c.days_overdue}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>

        {/* Card 6 - Inventory Value */}
        <Card title="Inventory Value">
          {invValue && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Cost Value</p>
                  <p className="text-xl font-bold text-navy">{formatCurrency(invValue.total_cost)}</p>
                </div>
                <div className="bg-mint-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Selling Value</p>
                  <p className="text-xl font-bold text-mint-700">{formatCurrency(invValue.total_selling)}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={invValue.by_category.map(c => ({ ...c, cost: c.cost / 100, selling: c.selling / 100 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}`} />
                  <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
                  <Bar dataKey="cost" fill="#0D3B6E" name="Cost" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="selling" fill="#4ECFA8" name="Selling" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Card 7 - Expiry Risk */}
        <Card title="Expiry Risk Dashboard">
          {expiryData && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: '30', label: '< 30 days', color: 'text-red-600 bg-red-50 border-red-100' },
                { key: '60', label: '31–60 days', color: 'text-amber-600 bg-amber-50 border-amber-100' },
                { key: '90', label: '61–90 days', color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
              ].map(({ key, label, color }) => (
                <div key={key} className={`rounded-lg border p-3 ${color}`}>
                  <p className="text-xs font-semibold mb-2">{label}</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {expiryData[key].length === 0 && <p className="text-xs opacity-60">None</p>}
                    {expiryData[key].map(b => (
                      <div key={b.batch_id} className="text-xs">
                        <p className="font-medium truncate">{b.product_name}</p>
                        <p className="opacity-70">{b.quantity} units · exp {b.expiry_date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Card 8 - Low Stock Alerts */}
        <Card title="Low Stock Alerts">
          <div className="overflow-auto max-h-64">
            <Table>
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Category</Th>
                  <Th>Stock</Th>
                  <Th>Min</Th>
                  <Th>Shortage</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {lowStock.length === 0 && <Tr><Td colSpan={6} className="text-center text-gray-400">All stocked</Td></Tr>}
                {lowStock.map(p => (
                  <Tr key={p.id}>
                    <Td><span className="font-medium text-gray-900">{p.name}</span></Td>
                    <Td>{p.category || '—'}</Td>
                    <Td>{p.current_stock}</Td>
                    <Td>{p.min_stock_threshold}</Td>
                    <Td><span className="text-amber-600 font-semibold">{p.shortage}</span></Td>
                    <Td>
                      <a href="/inventory" className="text-xs text-navy font-medium hover:underline">Restock</a>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
