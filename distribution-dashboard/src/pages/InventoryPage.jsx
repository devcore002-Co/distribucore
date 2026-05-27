import { useEffect, useState, useRef, useCallback } from 'react'
import { Plus, Search, Upload, Download, ChevronDown, ChevronRight, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { formatCurrency, formatDate } from '../utils/format'
import Drawer from '../components/ui/Drawer'
import Modal from '../components/ui/Modal'
import { Table, Th, Td, Tr } from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Pagination from '../components/ui/Pagination'

function ProductForm({ onSuccess, categories, suppliers }) {
  const [form, setForm] = useState({ barcode: '', name: '', category_id: '', supplier_id: '', cost_price: '', selling_price: '', min_stock_threshold: 0 })
  const barcodeRef = useRef()

  useEffect(() => { setTimeout(() => barcodeRef.current?.focus(), 100) }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
        cost_price: Math.round(parseFloat(form.cost_price || 0) * 100),
        selling_price: Math.round(parseFloat(form.selling_price || 0) * 100),
        min_stock_threshold: parseInt(form.min_stock_threshold || 0),
      }
      const { data } = await api.post('/products', payload)
      onSuccess(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create product')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Barcode (USB scanner or manual)</label>
        <input ref={barcodeRef} value={form.barcode} onChange={set('barcode')} className="input-field" placeholder="Scan or type barcode…" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Product Name *</label>
        <input required value={form.name} onChange={set('name')} className="input-field" placeholder="Product name" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
          <select value={form.category_id} onChange={set('category_id')} className="input-field">
            <option value="">— Select —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Supplier</label>
          <select value={form.supplier_id} onChange={set('supplier_id')} className="input-field">
            <option value="">— Select —</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Cost Price ($)</label>
          <input type="number" step="0.01" value={form.cost_price} onChange={set('cost_price')} className="input-field" placeholder="0.00" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Selling Price ($)</label>
          <input type="number" step="0.01" value={form.selling_price} onChange={set('selling_price')} className="input-field" placeholder="0.00" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Min Stock Threshold</label>
        <input type="number" value={form.min_stock_threshold} onChange={set('min_stock_threshold')} className="input-field" placeholder="0" />
      </div>
      <button type="submit" className="w-full btn-primary">Save Product</button>
    </form>
  )
}

function BatchForm({ productId, onSuccess }) {
  const [form, setForm] = useState({ quantity: '', expiry_date: '', purchase_date: '', cost_price_at_time: '', notes: '' })
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/batches', {
        product_id: productId,
        quantity: parseInt(form.quantity),
        expiry_date: form.expiry_date || null,
        purchase_date: form.purchase_date || null,
        cost_price_at_time: Math.round(parseFloat(form.cost_price_at_time || 0) * 100),
        notes: form.notes || null,
      })
      toast.success('Batch added')
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add batch')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Quantity *</label>
        <input required type="number" value={form.quantity} onChange={set('quantity')} className="input-field" placeholder="Units" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Purchase Date</label>
          <input type="date" value={form.purchase_date} onChange={set('purchase_date')} className="input-field" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Expiry Date</label>
          <input type="date" value={form.expiry_date} onChange={set('expiry_date')} className="input-field" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Cost Price at Time ($)</label>
        <input type="number" step="0.01" value={form.cost_price_at_time} onChange={set('cost_price_at_time')} className="input-field" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
        <textarea value={form.notes} onChange={set('notes')} className="input-field" rows={2} />
      </div>
      <button type="submit" className="w-full btn-primary">Add Batch</button>
    </form>
  )
}

export default function InventoryPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState({})
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [batchModal, setBatchModal] = useState(null)
  const fileRef = useRef()

  const load = useCallback(() => {
    const params = { page, page_size: 20 }
    if (search) params.search = search
    if (categoryId) params.category_id = categoryId
    if (supplierId) params.supplier_id = supplierId
    api.get('/products', { params }).then(r => setProducts(r.data)).catch(() => {})
  }, [search, categoryId, supplierId, page])

  useEffect(() => {
    load()
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    api.get('/suppliers').then(r => setSuppliers(r.data)).catch(() => {})
  }, [load])

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const handleProductCreated = (product) => {
    setDrawerOpen(false)
    setBatchModal(product.id)
    load()
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await api.post('/import/products', fd)
      toast.success(`Imported ${data.created} products`)
      load()
    } catch { toast.error('Import failed') }
    e.target.value = ''
  }

  const handleExport = () => { window.open(`${import.meta.env.VITE_API_URL}/export/products`, '_blank') }

  const expiryBadge = (d) => {
    if (!d) return null
    const days = Math.ceil((new Date(d) - new Date()) / 86400000)
    if (days < 7) return <Badge className="bg-red-100 text-red-700">Exp {formatDate(d)}</Badge>
    if (days < 30) return <Badge className="bg-amber-100 text-amber-700">Exp {formatDate(d)}</Badge>
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={handleImport} />
          <button onClick={() => fileRef.current.click()} className="btn-outline flex items-center gap-1.5"><Upload size={15} /> Import</button>
          <button onClick={handleExport} className="btn-outline flex items-center gap-1.5"><Download size={15} /> Export</button>
          <button onClick={() => setDrawerOpen(true)} className="btn-primary flex items-center gap-1.5"><Plus size={15} /> Add Item</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="input-field pl-9" placeholder="Search by name or barcode…" />
        </div>
        <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1) }} className="input-field w-40">
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={supplierId} onChange={e => { setSupplierId(e.target.value); setPage(1) }} className="input-field w-40">
          <option value="">All suppliers</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <Table>
        <thead>
          <tr>
            <Th></Th>
            <Th>Name</Th>
            <Th>Barcode</Th>
            <Th>Category</Th>
            <Th>Supplier</Th>
            <Th>Stock</Th>
            <Th>Cost</Th>
            <Th>Selling</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <>
              <Tr key={p.id} onClick={() => toggleExpand(p.id)}>
                <Td>{expanded[p.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</Td>
                <Td><span className="font-medium text-gray-900">{p.name}</span></Td>
                <Td><span className="font-mono text-xs text-gray-500">{p.barcode || '—'}</span></Td>
                <Td>{p.category?.name || '—'}</Td>
                <Td>{p.supplier?.name || '—'}</Td>
                <Td>
                  <span className={`font-semibold ${p.total_stock < p.min_stock_threshold ? 'text-amber-600' : 'text-gray-900'}`}>
                    {p.total_stock}
                  </span>
                </Td>
                <Td>{formatCurrency(p.cost_price)}</Td>
                <Td>{formatCurrency(p.selling_price)}</Td>
                <Td>
                  <button onClick={e => { e.stopPropagation(); setBatchModal(p.id) }} className="text-xs text-navy font-medium hover:underline">+ Batch</button>
                </Td>
              </Tr>
              {expanded[p.id] && (
                <tr key={`${p.id}-batches`} className="bg-gray-50">
                  <Td className="pl-8" colSpan={9}>
                    <BatchesInline productId={p.id} />
                  </Td>
                </tr>
              )}
            </>
          ))}
          {products.length === 0 && (
            <Tr><Td colSpan={9} className="text-center text-gray-400 py-8">No products found</Td></Tr>
          )}
        </tbody>
      </Table>

      <Pagination page={page} pageSize={20} total={999} onPage={setPage} />

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Item">
        <ProductForm onSuccess={handleProductCreated} categories={categories} suppliers={suppliers} />
      </Drawer>

      <Modal open={!!batchModal} onClose={() => { setBatchModal(null); load() }} title="Add Stock Batch">
        {batchModal && <BatchForm productId={batchModal} onSuccess={() => { setBatchModal(null); load() }} />}
      </Modal>
    </div>
  )
}

function BatchesInline({ productId }) {
  const [batches, setBatches] = useState([])
  useEffect(() => {
    api.get(`/products/${productId}`).then(r => setBatches(r.data.batches || [])).catch(() => {})
  }, [productId])

  if (batches.length === 0) return <p className="text-xs text-gray-400 py-2">No batches</p>
  return (
    <div className="space-y-1 py-1">
      <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-gray-400 uppercase px-2">
        <span>Qty</span><span>Purchase Date</span><span>Expiry Date</span><span>Cost</span>
      </div>
      {batches.map(b => (
        <div key={b.id} className="grid grid-cols-4 gap-4 text-xs text-gray-600 px-2 py-1">
          <span className="font-medium">{b.quantity}</span>
          <span>{formatDate(b.purchase_date)}</span>
          <span className={b.expiry_date && new Date(b.expiry_date) < new Date(Date.now() + 30*86400000) ? 'text-amber-600 font-semibold' : ''}>
            {formatDate(b.expiry_date)}
          </span>
          <span>{formatCurrency(b.cost_price_at_time)}</span>
        </div>
      ))}
    </div>
  )
}
