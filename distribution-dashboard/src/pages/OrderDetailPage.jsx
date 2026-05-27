import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { formatCurrency, formatDate, statusColor } from '../utils/format'
import { Table, Th, Td, Tr } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [payModal, setPayModal] = useState(false)
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = () => api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(() => {})
  useEffect(() => { load() }, [id])

  const recordPayment = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post(`/orders/${id}/payments`, {
        amount: Math.round(parseFloat(payForm.amount) * 100),
        method: payForm.method,
        notes: payForm.notes || null,
      })
      toast.success('Payment recorded')
      setPayModal(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to record payment')
    } finally { setSubmitting(false) }
  }

  const updateStatus = async (status) => {
    try {
      await api.put(`/orders/${id}/status`, { status })
      toast.success('Status updated')
      load()
    } catch { toast.error('Failed to update status') }
  }

  if (!order) return <div className="text-gray-400 text-center py-12">Loading…</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/orders" className="text-gray-400 hover:text-navy"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Order #{order.id}</h1>
        <Badge className={statusColor(order.status)}>{order.status}</Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Client</p>
          <p className="font-semibold text-gray-900">{order.client_name}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Order Date</p>
          <p className="font-semibold text-gray-900">{formatDate(order.order_date)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Balance Due</p>
          <p className={`font-semibold text-lg ${order.balance_due > 0 ? 'text-amber-600' : 'text-mint-600'}`}>
            {formatCurrency(order.balance_due)}
          </p>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-8">
        <div><p className="text-xs text-gray-500">Total</p><p className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</p></div>
        <div><p className="text-xs text-gray-500">Paid</p><p className="font-bold text-mint-600">{formatCurrency(order.paid_amount)}</p></div>
        <div className="flex-1" />
        <div className="flex gap-2">
          {order.balance_due > 0 && (
            <button onClick={() => setPayModal(true)} className="btn-primary">Record Payment</button>
          )}
          <select value={order.status} onChange={e => updateStatus(e.target.value)} className="input-field text-sm">
            <option value="pending">Pending</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="partial">Partial</option>
            <option value="credited">Credited</option>
          </select>
        </div>
      </div>

      {/* Items */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Items</h2>
        <Table>
          <thead><tr><Th>Product</Th><Th>Qty</Th><Th>Unit Price</Th><Th>Subtotal</Th></tr></thead>
          <tbody>
            {order.items.map(i => (
              <Tr key={i.id}>
                <Td>{i.product_name}</Td>
                <Td>{i.quantity}</Td>
                <Td>{formatCurrency(i.unit_price)}</Td>
                <Td className="font-medium">{formatCurrency(i.subtotal)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Payments */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Payment History</h2>
        {order.payments.length === 0 ? (
          <p className="text-sm text-gray-400">No payments recorded</p>
        ) : (
          <Table>
            <thead><tr><Th>Date</Th><Th>Amount</Th><Th>Method</Th><Th>Notes</Th></tr></thead>
            <tbody>
              {order.payments.map(p => (
                <Tr key={p.id}>
                  <Td>{formatDate(p.payment_date)}</Td>
                  <Td className="font-medium text-mint-700">{formatCurrency(p.amount)}</Td>
                  <Td className="capitalize">{p.method.replace('_', ' ')}</Td>
                  <Td>{p.notes || '—'}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Notes</p>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}

      <Modal open={payModal} onClose={() => setPayModal(false)} title="Record Payment">
        <form onSubmit={recordPayment} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Amount ($) *</label>
            <input required type="number" step="0.01" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} className="input-field" placeholder="0.00" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Method</label>
            <select value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value }))} className="input-field">
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
            <textarea value={payForm.notes} onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))} className="input-field" rows={2} />
          </div>
          <button type="submit" disabled={submitting} className="w-full btn-primary">
            {submitting ? 'Saving…' : 'Record Payment'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
