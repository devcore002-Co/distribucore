import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { formatCurrency, formatDate, statusColor, typeColor } from '../utils/format'
import { Table, Th, Td, Tr } from '../components/ui/Table'
import Badge from '../components/ui/Badge'

export default function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [balance, setBalance] = useState(null)
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    api.get(`/clients/${id}`).then(r => setClient(r.data)).catch(() => {})
    api.get(`/clients/${id}/orders`).then(r => setOrders(r.data)).catch(() => {})
    api.get(`/clients/${id}/balance`).then(r => setBalance(r.data)).catch(() => {})
  }, [id])

  if (!client) return <div className="text-gray-400 text-center py-12">Loading…</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/clients" className="text-gray-400 hover:text-navy"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
        <Badge className={typeColor(client.type)}>{client.type}</Badge>
      </div>

      {/* Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Phone</p>
          <p className="font-medium text-gray-900">{client.phone || '—'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Email</p>
          <p className="font-medium text-gray-900 truncate">{client.email || '—'}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Orders</p>
          <p className="font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Outstanding Balance</p>
          <p className={`font-bold text-lg ${client.outstanding_balance > 0 ? 'text-amber-600' : 'text-mint-600'}`}>
            {formatCurrency(client.outstanding_balance)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['orders', 'credit'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? 'border-navy text-navy' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'credit' ? 'Credit & Payments' : 'Order History'}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <Table>
          <thead><tr><Th>Order #</Th><Th>Date</Th><Th>Status</Th><Th>Total</Th><Th>Balance Due</Th></tr></thead>
          <tbody>
            {orders.map(o => (
              <Tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)}>
                <Td><span className="font-mono text-navy font-medium">#{o.id}</span></Td>
                <Td>{formatDate(o.order_date)}</Td>
                <Td><Badge className={statusColor(o.status)}>{o.status}</Badge></Td>
                <Td>{formatCurrency(o.total_amount)}</Td>
                <Td><span className={o.balance_due > 0 ? 'text-amber-600 font-semibold' : 'text-gray-400'}>{formatCurrency(o.balance_due)}</span></Td>
              </Tr>
            ))}
            {orders.length === 0 && <Tr><Td colSpan={5} className="text-center text-gray-400 py-8">No orders</Td></Tr>}
          </tbody>
        </Table>
      )}

      {tab === 'credit' && balance && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(balance.buckets).map(([key, val]) => (
              <div key={key} className="bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">{key === 'current' ? 'Current (≤30d)' : `${key} days`}</p>
                <p className={`font-bold ${val > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{formatCurrency(val)}</p>
              </div>
            ))}
          </div>

          <Table>
            <thead><tr><Th>Order #</Th><Th>Date</Th><Th>Total</Th><Th>Balance Due</Th><Th>Status</Th></tr></thead>
            <tbody>
              {orders.filter(o => o.balance_due > 0).map(o => (
                <Tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)}>
                  <Td><span className="font-mono text-navy font-medium">#{o.id}</span></Td>
                  <Td>{formatDate(o.order_date)}</Td>
                  <Td>{formatCurrency(o.total_amount)}</Td>
                  <Td><span className="text-amber-600 font-semibold">{formatCurrency(o.balance_due)}</span></Td>
                  <Td><Badge className={statusColor(o.status)}>{o.status}</Badge></Td>
                </Tr>
              ))}
              {orders.filter(o => o.balance_due > 0).length === 0 && (
                <Tr><Td colSpan={5} className="text-center text-gray-400 py-6">No outstanding orders</Td></Tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  )
}
