import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { formatCurrency, typeColor } from '../utils/format'
import { Table, Th, Td, Tr } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Drawer from '../components/ui/Drawer'
import Pagination from '../components/ui/Pagination'

function ClientForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', type: 'b2b', phone: '', email: '', address: '', notes: '' })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/clients', form)
      toast.success('Client added')
      onSuccess()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to add client') }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Name *</label>
        <input required value={form.name} onChange={set('name')} className="input-field" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Type</label>
        <select value={form.type} onChange={set('type')} className="input-field">
          <option value="b2b">B2B</option>
          <option value="wholesaler">Wholesaler</option>
          <option value="distributor">Distributor</option>
        </select>
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
      <button type="submit" className="w-full btn-primary">Add Client</button>
    </form>
  )
}

export default function ClientsPage() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const load = useCallback(() => {
    api.get('/clients', { params: { page, page_size: 20 } }).then(r => setClients(r.data)).catch(() => {})
  }, [page])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Clients</h1>
        <button onClick={() => setDrawerOpen(true)} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Add Client</button>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Phone</Th>
            <Th>Email</Th>
            <Th>Outstanding Balance</Th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <Tr key={c.id} onClick={() => navigate(`/clients/${c.id}`)}>
              <Td><span className="font-medium text-gray-900">{c.name}</span></Td>
              <Td><Badge className={typeColor(c.type)}>{c.type}</Badge></Td>
              <Td>{c.phone || '—'}</Td>
              <Td>{c.email || '—'}</Td>
              <Td>
                <span className={c.outstanding_balance > 0 ? 'text-amber-600 font-semibold' : 'text-gray-400'}>
                  {formatCurrency(c.outstanding_balance)}
                </span>
              </Td>
            </Tr>
          ))}
          {clients.length === 0 && <Tr><Td colSpan={5} className="text-center text-gray-400 py-8">No clients found</Td></Tr>}
        </tbody>
      </Table>

      <Pagination page={page} pageSize={20} total={999} onPage={setPage} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Client">
        <ClientForm onSuccess={() => { setDrawerOpen(false); load() }} />
      </Drawer>
    </div>
  )
}
