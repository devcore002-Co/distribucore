import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { useAuthStore } from '../store/auth'
import { Table, Th, Td, Tr } from '../components/ui/Table'
import Modal from '../components/ui/Modal'

function ChangePasswordForm({ userId, onClose }) {
  const [form, setForm] = useState({ password: '', confirm: '' })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    try {
      await api.put(`/users/${userId}`, { password: form.password })
      toast.success('Password changed')
      onClose()
    } catch { toast.error('Failed to change password') }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">New Password</label>
        <input required type="password" value={form.password} onChange={set('password')} className="input-field" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Confirm Password</label>
        <input required type="password" value={form.confirm} onChange={set('confirm')} className="input-field" />
      </div>
      <button type="submit" className="w-full btn-primary">Change Password</button>
    </form>
  )
}

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [categories, setCategories] = useState([])
  const [newCat, setNewCat] = useState('')
  const [editCat, setEditCat] = useState({})
  const [products, setProducts] = useState([])
  const [thresholds, setThresholds] = useState({})
  const [pwModal, setPwModal] = useState(null)

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    api.get('/products?page_size=100').then(r => {
      setProducts(r.data)
      const t = {}
      r.data.forEach(p => { t[p.id] = p.min_stock_threshold })
      setThresholds(t)
    }).catch(() => {})
  }, [])

  const addCategory = async (e) => {
    e.preventDefault()
    if (!newCat.trim()) return
    try {
      const { data } = await api.post('/categories', { name: newCat.trim() })
      setCategories(c => [...c, data])
      setNewCat('')
      toast.success('Category added')
    } catch { toast.error('Failed to add category') }
  }

  const renameCategory = async (id) => {
    const name = editCat[id]
    if (!name) return
    try {
      const { data } = await api.put(`/categories/${id}`, { name })
      setCategories(cats => cats.map(c => c.id === id ? data : c))
      setEditCat(e => { const n = { ...e }; delete n[id]; return n })
      toast.success('Category renamed')
    } catch { toast.error('Failed') }
  }

  const saveThreshold = async (productId) => {
    try {
      await api.put(`/products/${productId}`, { min_stock_threshold: parseInt(thresholds[productId]) })
      toast.success('Threshold updated')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      {/* Users */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3">User Accounts</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {[{ id: 1, username: 'investor', role: 'investor' }, { id: 2, username: 'ceo', role: 'ceo' }, { id: 3, username: 'operations', role: 'operations' }].map(u => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{u.username}</p>
                <p className="text-xs text-gray-400 capitalize">{u.role}</p>
              </div>
              {user?.id === u.id || user?.role === 'ceo' ? (
                <button onClick={() => setPwModal(u.id)} className="text-xs text-navy font-medium hover:underline">Change Password</button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3">Category Management</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="divide-y divide-gray-50">
            {categories.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-2.5">
                {editCat[c.id] !== undefined ? (
                  <>
                    <input
                      value={editCat[c.id]}
                      onChange={e => setEditCat(ec => ({ ...ec, [c.id]: e.target.value }))}
                      className="input-field flex-1"
                    />
                    <button onClick={() => renameCategory(c.id)} className="text-xs btn-primary">Save</button>
                    <button onClick={() => setEditCat(ec => { const n = { ...ec }; delete n[c.id]; return n })} className="text-xs text-gray-500">Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-800">{c.name}</span>
                    <button onClick={() => setEditCat(ec => ({ ...ec, [c.id]: c.name }))} className="text-xs text-navy font-medium hover:underline">Rename</button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 p-4">
            <form onSubmit={addCategory} className="flex gap-2">
              <input value={newCat} onChange={e => setNewCat(e.target.value)} className="input-field flex-1" placeholder="New category name…" />
              <button type="submit" className="btn-primary">Add</button>
            </form>
          </div>
        </div>
      </section>

      {/* Min Stock Thresholds */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3">Min Stock Thresholds</h2>
        <Table>
          <thead><tr><Th>Product</Th><Th>Threshold</Th><Th></Th></tr></thead>
          <tbody>
            {products.map(p => (
              <Tr key={p.id}>
                <Td>{p.name}</Td>
                <Td>
                  <input
                    type="number"
                    value={thresholds[p.id] ?? p.min_stock_threshold}
                    onChange={e => setThresholds(t => ({ ...t, [p.id]: e.target.value }))}
                    className="input-field w-24"
                  />
                </Td>
                <Td>
                  <button onClick={() => saveThreshold(p.id)} className="text-xs text-navy font-medium hover:underline">Save</button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </section>

      {/* Import / Export */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3">Import / Export</h2>
        <div className="flex gap-3">
          <button onClick={() => window.open(`${import.meta.env.VITE_API_URL}/export/products`)} className="btn-outline">Export Products</button>
          <button onClick={() => window.open(`${import.meta.env.VITE_API_URL}/export/orders`)} className="btn-outline">Export Orders</button>
          <button onClick={() => window.open(`${import.meta.env.VITE_API_URL}/export/clients`)} className="btn-outline">Export Clients</button>
        </div>
      </section>

      <Modal open={!!pwModal} onClose={() => setPwModal(null)} title="Change Password">
        {pwModal && <ChangePasswordForm userId={pwModal} onClose={() => setPwModal(null)} />}
      </Modal>
    </div>
  )
}
