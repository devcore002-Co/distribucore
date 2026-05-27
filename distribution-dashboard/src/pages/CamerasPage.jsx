import { useEffect, useState } from 'react'
import { Video, VideoOff, Plus, X, Pencil, Trash2, Wifi, WifiOff } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

function CameraFormModal({ camera, onClose, onSaved }) {
  const [form, setForm] = useState(camera || { name: '', location: '', stream_url: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.name || !form.location) return toast.error('Name and location are required')
    setSaving(true)
    try {
      const payload = { ...form, stream_url: form.stream_url || null }
      if (camera) {
        await api.patch(`/cameras/${camera.id}`, payload)
      } else {
        await api.post('/cameras', payload)
      }
      toast.success(camera ? 'Camera updated' : 'Camera added')
      onSaved()
      onClose()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{camera ? 'Edit Camera' : 'Add Camera'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Camera Name</label>
            <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Entrance Camera" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Location / Zone</label>
            <input className="input-field" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Warehouse Entrance, Storage Zone A" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Stream URL <span className="text-gray-400 font-normal">(optional — MJPEG/HLS)</span></label>
            <input className="input-field" value={form.stream_url} onChange={e => set('stream_url', e.target.value)} placeholder="http://192.168.x.x/video" />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('is_active', !form.is_active)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm text-gray-700">{form.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

function CameraCard({ camera, onEdit, onDelete }) {
  const hasStream = !!camera.stream_url
  const [imgError, setImgError] = useState(false)

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col ${camera.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
      {/* Feed area */}
      <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
        {hasStream && !imgError ? (
          <img
            src={camera.stream_url}
            alt={camera.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-600">
            {camera.is_active ? <Video size={32} className="text-gray-500" /> : <VideoOff size={32} className="text-gray-600" />}
            <span className="text-xs text-gray-400">
              {!camera.is_active ? 'Camera offline' : imgError ? 'Stream unavailable' : 'No stream configured'}
            </span>
          </div>
        )}

        {/* Status badge */}
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${camera.is_active ? 'bg-green-500/90 text-white' : 'bg-gray-700/80 text-gray-300'}`}>
          {camera.is_active ? <Wifi size={10} /> : <WifiOff size={10} />}
          {camera.is_active ? 'Live' : 'Offline'}
        </div>

        {/* Live pulse indicator */}
        {camera.is_active && hasStream && !imgError && (
          <div className="absolute top-2 left-2">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{camera.name}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">{camera.location}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(camera)} className="p-1.5 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-50 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(camera)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CamerasPage() {
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'new' | camera obj
  const [filter, setFilter] = useState('all') // all | active | inactive

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/cameras')
      setCameras(data)
    } catch {
      toast.error('Failed to load cameras')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (camera) => {
    if (!confirm(`Remove "${camera.name}"?`)) return
    try {
      await api.delete(`/cameras/${camera.id}`)
      toast.success('Camera removed')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const filtered = cameras.filter(c =>
    filter === 'all' ? true : filter === 'active' ? c.is_active : !c.is_active
  )

  const active = cameras.filter(c => c.is_active).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">CCTV Cameras</h1>
          <p className="text-sm text-gray-500 mt-0.5">{active} active · {cameras.length - active} offline</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={14} /> Add Camera
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[['all', 'All'], ['active', 'Active'], ['inactive', 'Offline']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl aspect-video animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Video size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No cameras {filter !== 'all' ? `(${filter})` : ''}</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Camera" to register a new CCTV camera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(camera => (
            <CameraCard
              key={camera.id}
              camera={camera}
              onEdit={setModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modal && (
        <CameraFormModal
          camera={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
    </div>
  )
}
