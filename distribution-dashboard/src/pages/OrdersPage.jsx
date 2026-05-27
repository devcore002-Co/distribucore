import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { formatCurrency, formatDate, statusColor } from '../utils/format'
import { Table, Th, Td, Tr } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Drawer from '../components/ui/Drawer'
import Pagination from '../components/ui/Pagination'

function NewOrderForm({ onSuccess }) {
  const [step, setStep] = useState(1)
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [items, setItems] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [productResults, setProductResults] = useState([])
  const [payment, setPayment] = useState({ amount: '', method: 'cash' })
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/clients', { params: { page_size: 100 } }).then(r => setClients(r.data)).catch(() => {})
  }, [])

  const searchProducts = useCallback(async (q) => {
    if (!q) { setProductResults([]); return }
    const { data } = await api.get('/products', { params: { search: q, page_size: 10 } })
    setProductResults(data)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => searchProducts(productSearch), 300)
    return () => clearTimeout(t)
  }, [productSearch, searchProducts])

  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product_id: product.id, name: product.name, unit_price: product.selling_price, quantity: 1 }]
    })
    setProductSearch('')
    setProductResults([])
  }

  const updateQty = (id, qty) => setItems(prev => prev.map(i => i.product_id === id ? { ...i, quantity: parseInt(qty) || 1 } : i))
  const removeItem = (id) => setItems(prev => prev.filter(i => i.product_id !== id))

  const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  const submit = async () => {
    if (!clientId || items.length === 0) { toast.error('Select a client and add items'); return }
    setSubmitting(true)
    try {
      await api.post('/orders', {
        client_id: parseInt(clientId),
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })),
        notes: notes || null,
        initial_payment: payment.amount ? Math.round(parseFloat(payment.amount) * 100) : null,
        payment_method: payment.method,
      })
      toast.success('Order created')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create order')
    } finally { setSubmitting(false) }
  }

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
  const selectedClient = clients.find(c => c.id === parseInt(clientId))

  return (
    <div className="space-y-6">
      {/* Step 1: Client */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">1. Select Client</h4>
        <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="input-field mb-2" placeholder="Search clients…" />
        <select value={clientId} onChange={e => setClientId(e.target.value)} className="input-field" size={4}>
          {filteredClients.map(c => (
            <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
          ))}
        </select>
        {selectedClient && <p className="text-xs text-mint-600 mt-1 font-medium">Selected: {selectedClient.name}</p>}
      </div>

      {/* Step 2: Items */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">2. Add Items</h4>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={productSearch}
            onChange={e => setProductSearch(e.target.value)}
            className="input-field pl-8"
            placeholder="Search product by name or scan barcode…"
          />
          {productResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {productResults.map(p => (
                <button key={p.id} onClick={() => addItem(p)} className="w-full flex justify-between items-center px-3 py-2 text-sm hover:bg-gray-50 text-left">
                  <span>{p.name}</span>
                  <span className="text-gray-400 text-xs">{formatCurrency(p.selling_price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-3 space-y-2">
            {items.map(i => (
              <div key={i.product_id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span className="flex-1 text-sm">{i.name}</span>
                <input
                  type="number"
                  min={1}
                  value={i.quantity}
                  onChange={e => updateQty(i.product_id, e.target.value)}
                  className="w-16 input-field text-center"
                />
                <span className="text-sm text-gray-500 w-20 text-right">{formatCurrency(i.quantity * i.unit_price)}</span>
                <button onClick={() => removeItem(i.product_id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 3: Review & Payment */}
      {items.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">3. Review & Initial Payment</h4>
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex justify-between text-sm font-semibold text-gray-900">
              <span>Total</span><span>{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Initial Payment ($)</label>
              <input type="number" step="0.01" value={payment.amount} onChange={e => setPayment(p => ({ ...p, amount: e.target.value }))} className="input-field" placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Method</label>
              <select value={payment.method} onChange={e => setPayment(p => ({ ...p, method: e.target.value }))} className="input-field">
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field" rows={2} />
          </div>
          <button onClick={submit} disabled={submitting} className="w-full btn-primary mt-4">
            {submitting ? 'Creating…' : 'Confirm Order'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('')
  const [clientId, setClientId] = useState('')
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const load = useCallback(() => {
    const params = { page, page_size: 20 }
    if (status) params.status = status
    if (clientId) params.client_id = clientId
    api.get('/orders', { params }).then(r => setOrders(r.data)).catch(() => {})
  }, [status, clientId, page])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <button onClick={() => setDrawerOpen(true)} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> New Order</button>
      </div>

      <div className="flex gap-3">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input-field w-40">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="partial">Partial</option>
          <option value="credited">Credited</option>
        </select>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Order #</Th>
            <Th>Client</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th>Total</Th>
            <Th>Paid</Th>
            <Th>Balance Due</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <Tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)}>
              <Td><span className="font-mono font-medium text-navy">#{o.id}</span></Td>
              <Td>{o.client_name}</Td>
              <Td>{formatDate(o.order_date)}</Td>
              <Td><Badge className={statusColor(o.status)}>{o.status}</Badge></Td>
              <Td>{formatCurrency(o.total_amount)}</Td>
              <Td>{formatCurrency(o.paid_amount)}</Td>
              <Td>
                <span className={o.balance_due > 0 ? 'text-amber-600 font-semibold' : 'text-gray-500'}>
                  {formatCurrency(o.balance_due)}
                </span>
              </Td>
            </Tr>
          ))}
          {orders.length === 0 && <Tr><Td colSpan={7} className="text-center text-gray-400 py-8">No orders found</Td></Tr>}
        </tbody>
      </Table>

      <Pagination page={page} pageSize={20} total={999} onPage={setPage} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="New Order" wide>
        <NewOrderForm onSuccess={() => { setDrawerOpen(false); load() }} />
      </Drawer>
    </div>
  )
}
