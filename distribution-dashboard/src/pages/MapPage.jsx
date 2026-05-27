import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Truck, Plus, X, RefreshCw } from 'lucide-react'
import api from '../api/client'
import toast from 'react-hot-toast'

// Fix Leaflet default icon URLs broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
})

const vehicleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
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
      const payload = {
        ...form,
        latitude: form.latitude !== '' ? parseFloat(form.latitude) : null,
        longitude: form.longitude !== '' ? parseFloat(form.longitude) : null,
      }
      if (vehicle) {
        await api.patch(`/vehicles/${vehicle.id}`, payload)
      } else {
        await api.post('/vehicles', payload)
      }
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

export default function MapPage() {
  const [clients, setClients] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [vehicleModal, setVehicleModal] = useState(null) // null | 'new' | vehicle obj
  const [clientModal, setClientModal] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all') // all | stores | vehicles

  const load = async () => {
    setLoading(true)
    try {
      const [c, v] = await Promise.all([api.get('/clients'), api.get('/vehicles')])
      setClients(c.data.filter(cl => cl.is_active))
      setVehicles(v.data)
    } catch {
      toast.error('Failed to load map data')
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

  const mappedStores = clients.filter(c => c.latitude && c.longitude)
  const mappedVehicles = vehicles.filter(v => v.latitude && v.longitude)
  const unmappedStores = clients.filter(c => !c.latitude || !c.longitude)

  const allPoints = [
    ...(activeFilter !== 'vehicles' ? mappedStores.map(c => [c.latitude, c.longitude]) : []),
    ...(activeFilter !== 'stores' ? mappedVehicles.map(v => [v.latitude, v.longitude]) : []),
  ]

  const defaultCenter = allPoints.length > 0 ? allPoints[0] : [24.7136, 46.6753] // Riyadh default

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Operations Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {mappedStores.length} stores · {mappedVehicles.length} vehicles on map
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-outline flex items-center gap-1.5 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setVehicleModal('new')} className="btn-primary flex items-center gap-1.5 text-sm">
            <Plus size={14} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-shrink-0">
        {[['all', 'All'], ['stores', 'Stores'], ['vehicles', 'Vehicles']].map(([val, label]) => (
          <button key={val} onClick={() => setActiveFilter(val)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm min-h-0" style={{ height: 'calc(100vh - 230px)' }}>
          {!loading && (
            <MapContainer center={defaultCenter} zoom={10} style={{ height: '100%', width: '100%' }} zoomControl={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {allPoints.length > 1 && <FitBounds points={allPoints} />}

              {activeFilter !== 'vehicles' && mappedStores.map(client => (
                <Marker key={`store-${client.id}`} position={[client.latitude, client.longitude]} icon={storeIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{client.name}</p>
                      <p className="text-gray-500 capitalize">{client.type}</p>
                      {client.address && <p className="text-gray-400 text-xs mt-1">{client.address}</p>}
                      <button className="text-blue-600 text-xs mt-2 hover:underline" onClick={() => setClientModal(client)}>
                        Edit location
                      </button>
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

        {/* Side panel */}
        <div className="w-72 flex-shrink-0 space-y-4 overflow-y-auto">
          {/* Legend */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Legend</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700"><MapPin size={14} className="text-blue-500" /> Store / Client</div>
              <div className="flex items-center gap-2 text-sm text-gray-700"><Truck size={14} className="text-green-600" /> Company Vehicle</div>
            </div>
          </div>

          {/* Vehicles list */}
          {activeFilter !== 'stores' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Vehicles ({vehicles.length})</p>
              <div className="space-y-2">
                {vehicles.map(v => (
                  <div key={v.id} className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{v.name}</p>
                      <p className="text-xs text-gray-400">{v.plate_number}{v.driver_name ? ` · ${v.driver_name}` : ''}</p>
                      <span className={`inline-block text-xs px-1.5 py-0.5 rounded mt-1 capitalize ${STATUS_COLORS[v.status]}`}>{v.status}</span>
                    </div>
                    <button onClick={() => setVehicleModal(v)} className="text-xs text-gray-400 hover:text-navy flex-shrink-0 mt-0.5">Edit</button>
                  </div>
                ))}
                {vehicles.length === 0 && <p className="text-xs text-gray-400">No vehicles added yet.</p>}
              </div>
            </div>
          )}

          {/* Unmapped stores */}
          {activeFilter !== 'vehicles' && unmappedStores.length > 0 && (
            <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">
                Missing Location ({unmappedStores.length})
              </p>
              <div className="space-y-1.5">
                {unmappedStores.slice(0, 10).map(c => (
                  <button key={c.id} onClick={() => setClientModal(c)}
                    className="w-full text-left text-xs text-gray-600 hover:text-navy py-1 border-b border-gray-50 last:border-0 truncate">
                    + {c.name}
                  </button>
                ))}
                {unmappedStores.length > 10 && <p className="text-xs text-gray-400">+{unmappedStores.length - 10} more…</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {vehicleModal && (
        <VehicleModal
          vehicle={vehicleModal === 'new' ? null : vehicleModal}
          onClose={() => setVehicleModal(null)}
          onSaved={load}
        />
      )}
      {clientModal && (
        <ClientLocationModal
          client={clientModal}
          onClose={() => setClientModal(null)}
          onSaved={load}
        />
      )}
    </div>
  )
}
