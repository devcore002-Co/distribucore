import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Truck, Plus, X, RefreshCw, Video, VideoOff, Pencil, Trash2, Wifi, WifiOff, Bell } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const storeIcon = new L.DivIcon({
  html: `<div style="width: 40px; height: 40px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2); border: 3px solid white; color: white; font-size: 20px;">🏪</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

const vehicleIcon = new L.DivIcon({
  html: `<div style="width: 40px; height: 40px; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2); border: 3px solid white; color: white; font-size: 20px; animation: pulse 2s infinite;">🚚</div><style>@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }</style>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

const STATUS_COLORS = { active: 'bg-green-100 text-green-700', parked: 'bg-gray-100 text-gray-600', maintenance: 'bg-amber-100 text-amber-700' }

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 })
    }
  }, [points.length])
  return null
}

function VehicleModal({ vehicle, onClose, onSaved }) {
  const [form, setForm] = useState(vehicle || { name: '', plate_number: '', driver_name: '', status: 'parked', latitude: '', longitude: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.name || !form.plate_number) return toast.error('Name and plate are required')
    setSaving(true)
    try {
      const payload = { ...form, latitude: form.latitude !== '' ? parseFloat(form.latitude) : null, longitude: form.longitude !== '' ? parseFloat(form.longitude) : null }
      if (vehicle) await api.patch(`/vehicles/${vehicle.id}`, payload)
      else await api.post('/vehicles', payload)
      toast.success(vehicle ? 'Vehicle updated' : 'Vehicle added')
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
          <h2 className="text-lg font-semibold text-gray-900">{vehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="space-y-4">
          {[['name', 'Vehicle Name'], ['plate_number', 'Plate Number'], ['driver_name', 'Driver Name (optional)']].map(([k, label]) => (
            <div key={k}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input className="input-field" value={form[k]} onChange={e => set(k, e.target.value)} placeholder={label} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active (on route)</option>
              <option value="parked">Parked</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['latitude', 'Latitude'], ['longitude', 'Longitude']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input className="input-field" type="number" step="any" value={form[k]} onChange={e => set(k, e.target.value)} placeholder="e.g. 24.7136" />
              </div>
            ))}
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

function ClientLocationModal({ client, onClose, onSaved }) {
  const [lat, setLat] = useState(client.latitude ?? '')
  const [lng, setLng] = useState(client.longitude ?? '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await api.patch(`/clients/${client.id}`, {
        latitude: lat !== '' ? parseFloat(lat) : null,
        longitude: lng !== '' ? parseFloat(lng) : null,
      })
      toast.success('Location saved')
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
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Set Store Location</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">{client.name}</p>
        <div className="grid grid-cols-2 gap-3">
          {[['Latitude', lat, setLat], ['Longitude', lng, setLng]].map(([label, val, setVal]) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input className="input-field" type="number" step="any" value={val} onChange={e => setVal(e.target.value)} placeholder="e.g. 24.7136" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

function CameraFormModal({ camera, onClose, onSaved }) {
  const [form, setForm] = useState(camera || { name: '', location: '', stream_url: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.name || !form.location) return toast.error('Name and location are required')
    setSaving(true)
    try {
      const payload = { ...form, stream_url: form.stream_url || null }
      if (camera) await api.patch(`/cameras/${camera.id}`, payload)
      else await api.post('/cameras', payload)
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
            <button type="button" onClick={() => set('is_active', !form.is_active)} className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
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
      <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
        {hasStream && !imgError ? (
          <img src={camera.stream_url} alt={camera.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-600">
            {camera.is_active ? <Video size={32} className="text-gray-500" /> : <VideoOff size={32} className="text-gray-600" />}
            <span className="text-xs text-gray-400">{!camera.is_active ? 'Camera offline' : imgError ? 'Stream unavailable' : 'No stream configured'}</span>
          </div>
        )}
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${camera.is_active ? 'bg-green-500/90 text-white' : 'bg-gray-700/80 text-gray-300'}`}>
          {camera.is_active ? <Wifi size={10} /> : <WifiOff size={10} />}
          {camera.is_active ? 'Live' : 'Offline'}
        </div>
        {camera.is_active && hasStream && !imgError && (
          <div className="absolute top-2 left-2">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          </div>
        )}
      </div>
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

export default function OperationsPage() {
  const [clients, setClients] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)
  const [vehicleModal, setVehicleModal] = useState(null)
  const [clientModal, setClientModal] = useState(null)
  const [cameraModal, setCameraModal] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [cameraFilter, setCameraFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const [c, v, cam] = await Promise.all([api.get('/clients'), api.get('/vehicles'), api.get('/cameras')])
      setClients(c.data.filter(cl => cl.is_active))
      setVehicles(v.data)
      setCameras(cam.data)
    } catch {
      toast.error('Failed to load operations data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const deleteVehicle = async (id) => {
    if (!confirm('Delete this vehicle?')) return
    try {
      await api.delete(`/vehicles/${id}`)
      toast.success('Vehicle removed')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const deleteCamera = async (camera) => {
    if (!confirm(`Remove "${camera.name}"?`)) return
    try {
      await api.delete(`/cameras/${camera.id}`)
      toast.success('Camera removed')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const mappedStores = clients.filter(c => c.latitude && c.longitude)
  const mappedVehicles = vehicles.filter(v => v.latitude && v.longitude)
  const unmappedStores = clients.filter(c => !c.latitude || !c.longitude)
  const filteredCameras = cameras.filter(c => cameraFilter === 'all' ? true : cameraFilter === 'active' ? c.is_active : !c.is_active)

  const allPoints = [
    ...(activeFilter !== 'vehicles' ? mappedStores.map(c => [c.latitude, c.longitude]) : []),
    ...(activeFilter !== 'stores' ? mappedVehicles.map(v => [v.latitude, v.longitude]) : []),
  ]

  const defaultCenter = allPoints.length > 0 ? allPoints[0] : [5.6037, -0.1870]
  const active = cameras.filter(c => c.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operations</h1>
        <p className="text-sm text-gray-500 mt-1">Manage vehicles, stores location, and CCTV cameras</p>
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Operations Map</h2>
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-outline flex items-center gap-1.5 text-sm"><RefreshCw size={14} /> Refresh</button>
            <button onClick={() => setVehicleModal('new')} className="btn-primary flex items-center gap-1.5 text-sm"><Plus size={14} /> Add Vehicle</button>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-4">
          {[['all', 'All'], ['stores', 'Stores'], ['vehicles', 'Vehicles']].map(([val, label]) => (
            <button key={val} onClick={() => setActiveFilter(val)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{label}</button>
          ))}
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '400px' }}>
          {!loading && (
            <MapContainer center={defaultCenter} zoom={10} style={{ height: '100%', width: '100%' }} zoomControl={true}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {allPoints.length > 1 && <FitBounds points={allPoints} />}

              {activeFilter !== 'vehicles' && mappedStores.map(client => (
                <Marker key={`store-${client.id}`} position={[client.latitude, client.longitude]} icon={storeIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{client.name}</p>
                      <p className="text-gray-500 capitalize">{client.type}</p>
                      {client.address && <p className="text-gray-400 text-xs mt-1">{client.address}</p>}
                      <button className="text-blue-600 text-xs mt-2 hover:underline" onClick={() => setClientModal(client)}>Edit location</button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {activeFilter !== 'stores' && mappedVehicles.map(vehicle => (
                <Marker key={`vehicle-${vehicle.id}`} position={[vehicle.latitude, vehicle.longitude]} icon={vehicleIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{vehicle.name}</p>
                      <p className="text-gray-500">{vehicle.plate_number}</p>
                      {vehicle.driver_name && <p className="text-gray-400 text-xs">{vehicle.driver_name}</p>}
                      <span className={`inline-block text-xs px-1.5 py-0.5 rounded mt-1 capitalize ${STATUS_COLORS[vehicle.status]}`}>{vehicle.status}</span>
                      <div className="flex gap-2 mt-2">
                        <button className="text-blue-600 text-xs hover:underline" onClick={() => setVehicleModal(vehicle)}>Edit</button>
                        <button className="text-red-500 text-xs hover:underline" onClick={() => deleteVehicle(vehicle.id)}>Remove</button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
          {loading && <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading map…</div>}
        </div>
      </div>

      {/* Cameras Section */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">CCTV Cameras</h2>
            <p className="text-sm text-gray-500 mt-0.5">{active} active · {cameras.length - active} offline</p>
          </div>
          <button onClick={() => setCameraModal('new')} className="btn-primary flex items-center gap-1.5 text-sm"><Plus size={14} /> Add Camera</button>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-4">
          {[['all', 'All'], ['active', 'Active'], ['inactive', 'Offline']].map(([val, label]) => (
            <button key={val} onClick={() => setCameraFilter(val)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${cameraFilter === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl aspect-video animate-pulse" />
            ))}
          </div>
        ) : filteredCameras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Video size={40} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No cameras {cameraFilter !== 'all' ? `(${cameraFilter})` : ''}</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Camera" to register a new CCTV camera.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCameras.map(camera => (
              <CameraCard key={camera.id} camera={camera} onEdit={setCameraModal} onDelete={deleteCamera} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {vehicleModal && <VehicleModal vehicle={vehicleModal === 'new' ? null : vehicleModal} onClose={() => setVehicleModal(null)} onSaved={load} />}
      {clientModal && <ClientLocationModal client={clientModal} onClose={() => setClientModal(null)} onSaved={load} />}
      {cameraModal && <CameraFormModal camera={cameraModal === 'new' ? null : cameraModal} onClose={() => setCameraModal(null)} onSaved={load} />}
    </div>
  )
}
