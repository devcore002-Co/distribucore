import { useEffect, useState, useCallback } from 'react'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { formatCurrency } from '../utils/format'
import { Table, Th, Td, Tr } from '../components/ui/Table'
import Drawer from '../components/ui/Drawer'
import Pagination from '../components/ui/Pagination'

function SupplierForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', contact_name: '', phone: '', email: '', address: '', notes: '' })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/suppliers', form)
      toast.success('Supplier added')
      onSuccess()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Supplier Name *</label>
        <input required value={form.name} onChange={set('name')} className="input-field" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Contact Name</label>
        <input value={form.contact_name} onChange={set('contact_name')} className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Phone</label>
          <input value={form.phone} onChange={set('phone')} className="input-field" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Email</label>
          <input type="email" value={form.email} onChange={set('email')} className="input-field" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Address</label>
        <textarea value={form.address} onChange={set('address')} className="input-field" rows={2} />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
        <textarea value={form.notes} onChange={set('notes')} className="input-field" rows={2} />
      </div>
      <button type="submit" className="w-full btn-primary">Add Supplier</button>
    </form>
  )
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState({})
  const [supplierProducts, setSupplierProducts] = useState({})
  const [drawerOpen, setDrawerOpen] = useState(false)

  const load = useCallback(() => {
    api.get('/suppliers', { params: { page, page_size: 20 } }).then(r => setSuppliers(r.data)).catch(() => {})
  }, [page])

  useEffect(() => { load() }, [load])

  const toggleExpand = async (id) => {
    if (!expanded[id] && !supplierProducts[id]) {
      const { data } = await api.get(`/suppliers/${id}/products`)
      setSupplierProducts(p => ({ ...p, [id]: data }))
    }
    setExpanded(e => ({ ...e, [id]: !e[id] }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Suppliers</h1>
        <button onClick={() => setDrawerOpen(true)} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Add Supplier</button>
      </div>

      <Table>
        <thead>
          <tr>
            <Th></Th>
            <Th>Name</Th>
            <Th>Contact</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(s => (
            <>
              <Tr key={s.id} onClick={() => toggleExpand(s.id)}>
                <Td>{expanded[s.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</Td>
                <Td><span className="font-medium text-gray-900">{s.name}</span></Td>
                <Td>{s.contact_name || '—'}</Td>
                <Td>{s.phone || '—'}</Td>
                <Td>{s.email || '—'}</Td>
              </Tr>
              {expanded[s.id] && (
                <tr key={`${s.id}-products`} className="bg-gray-50">
                  <Td colSpan={5} className="pl-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Products from {s.name}</p>
                    <div className="space-y-1">
                      {(supplierProducts[s.id] || []).map(p => (
                        <div key={p.id} className="flex justify-between text-xs text-gray-600 py-1">
                          <span>{p.name}</span>
                          <span className="text-gray-400">Stock: {p.total_stock} | {formatCurrency(p.selling_price)}</span>
                        </div>
                      ))}
                      {(supplierProducts[s.id] || []).length === 0 && <p className="text-xs text-gray-400">No products</p>}
                    </div>
                  </Td>
                </tr>
              )}
            </>
          ))}
          {suppliers.length === 0 && <Tr><Td colSpan={5} className="text-center text-gray-400 py-8">No suppliers</Td></Tr>}
        </tbody>
      </Table>

      <Pagination page={page} pageSize={20} total={999} onPage={setPage} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Supplier">
        <SupplierForm onSuccess={() => { setDrawerOpen(false); load() }} />
      </Drawer>
    </div>
  )
}
