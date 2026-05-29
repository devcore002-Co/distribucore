// Mock data for development - remove when backend auth is fixed
const mockData = {
  vehicles: [
    { id: 1, name: 'Vehicle 1', plate_number: 'GH-001-AA', driver_name: 'John Doe', status: 'active', latitude: 5.6037, longitude: -0.1870 },
    { id: 2, name: 'Vehicle 2', plate_number: 'GH-002-AA', driver_name: 'Jane Smith', status: 'parked', latitude: 5.6100, longitude: -0.1900 },
    { id: 3, name: 'Vehicle 3', plate_number: 'GH-003-AA', driver_name: 'Bob Johnson', status: 'maintenance', latitude: 5.6050, longitude: -0.1850 },
  ],
  cameras: [
    { id: 1, name: 'Entrance', location: 'Front Gate', stream_url: null, is_active: true },
    { id: 2, name: 'Warehouse A', location: 'Storage Area', stream_url: null, is_active: true },
    { id: 3, name: 'Parking', location: 'Lot B', stream_url: null, is_active: false },
  ],
  clients: [
    { id: 1, name: 'Client A', type: 'wholesaler', latitude: 5.6150, longitude: -0.1800, is_active: true },
    { id: 2, name: 'Client B', type: 'retailer', latitude: 5.5950, longitude: -0.1950, is_active: true },
  ]
}

const api = {
  get: async (endpoint) => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 300))

    if (endpoint === '/vehicles') return { data: mockData.vehicles }
    if (endpoint === '/cameras') return { data: mockData.cameras }
    if (endpoint === '/clients') return { data: mockData.clients }

    return { data: [] }
  },
  post: async (endpoint, data) => {
    await new Promise(r => setTimeout(r, 300))
    const newItem = { ...data, id: Math.random() }
    if (endpoint === '/vehicles') mockData.vehicles.push(newItem)
    if (endpoint === '/cameras') mockData.cameras.push(newItem)
    return { data: newItem }
  },
  patch: async (endpoint, data) => {
    await new Promise(r => setTimeout(r, 300))
    return { data }
  },
  delete: async (endpoint) => {
    await new Promise(r => setTimeout(r, 300))
    return { data: null }
  }
}

export default api
