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
  ],
  salesMonthly: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, revenue: Math.floor(Math.random() * 50000) + 10000 })),
  topProducts: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Product ${i + 1}`, quantity: Math.floor(Math.random() * 100) + 10, revenue: Math.floor(Math.random() * 10000) + 1000 })),
  categories: [
    { name: 'Dairy', value: 3500 },
    { name: 'Juice', value: 2800 },
    { name: 'Beverage', value: 3200 },
    { name: 'Dried Goods', value: 1800 },
    { name: 'Confectionery', value: 2700 },
  ],
  margins: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, name: `Product ${i + 1}`, cost_price: Math.floor(Math.random() * 10) + 5, selling_price: Math.floor(Math.random() * 20) + 15, margin: Math.floor(Math.random() * 50) + 5, margin_pct: Math.floor(Math.random() * 40) + 10 })),
  creditOverview: { total: 15000, buckets: { current: 5000, '30': 3000, '60': 4000, '90+': 3000 }, clients: [] },
  inventoryValue: { total_cost: 45000, total_selling: 75000, by_category: [{ name: 'Dairy', cost: 12000, selling: 20000 }, { name: 'Juice', cost: 10000, selling: 18000 }, { name: 'Others', cost: 23000, selling: 37000 }] },
  expiryRisk: [{ batch_code: 'B001', product_name: 'Milk', expiry_date: '2026-06-15', days_to_expiry: 17 }],
  lowStock: []
}

let nextId = { vehicles: 100, cameras: 100 }

const api = {
  get: async (endpoint) => {
    await new Promise(r => setTimeout(r, 300))
    if (endpoint === '/vehicles') return { data: mockData.vehicles }
    if (endpoint === '/cameras') return { data: mockData.cameras }
    if (endpoint === '/clients') return { data: mockData.clients }
    if (endpoint.includes('/analytics/sales-monthly')) return { data: mockData.salesMonthly }
    if (endpoint.includes('/analytics/top-products')) return { data: mockData.topProducts }
    if (endpoint.includes('/analytics/category-breakdown')) return { data: mockData.categories }
    if (endpoint.includes('/analytics/profit-margins')) return { data: mockData.margins }
    if (endpoint.includes('/analytics/credit-overview')) return { data: mockData.creditOverview }
    if (endpoint.includes('/analytics/inventory-value')) return { data: mockData.inventoryValue }
    if (endpoint.includes('/analytics/expiry-risk')) return { data: mockData.expiryRisk }
    if (endpoint.includes('/analytics/low-stock')) return { data: mockData.lowStock }
    return { data: [] }
  },
  post: async (endpoint, data) => {
    await new Promise(r => setTimeout(r, 300))
    if (endpoint === '/vehicles') {
      const newVehicle = { ...data, id: nextId.vehicles++ }
      mockData.vehicles.push(newVehicle)
      return { data: newVehicle }
    }
    if (endpoint === '/cameras') {
      const newCamera = { ...data, id: nextId.cameras++ }
      mockData.cameras.push(newCamera)
      return { data: newCamera }
    }
    return { data }
  },
  patch: async (endpoint, data) => {
    await new Promise(r => setTimeout(r, 300))
    const id = parseInt(endpoint.split('/').pop())
    if (endpoint.includes('/vehicles')) {
      const idx = mockData.vehicles.findIndex(v => v.id === id)
      if (idx >= 0) mockData.vehicles[idx] = { ...mockData.vehicles[idx], ...data }
    }
    if (endpoint.includes('/cameras')) {
      const idx = mockData.cameras.findIndex(c => c.id === id)
      if (idx >= 0) mockData.cameras[idx] = { ...mockData.cameras[idx], ...data }
    }
    if (endpoint.includes('/clients')) {
      const idx = mockData.clients.findIndex(c => c.id === id)
      if (idx >= 0) mockData.clients[idx] = { ...mockData.clients[idx], ...data }
    }
    return { data }
  },
  delete: async (endpoint) => {
    await new Promise(r => setTimeout(r, 300))
    const id = parseInt(endpoint.split('/').pop())
    if (endpoint.includes('/vehicles')) {
      const idx = mockData.vehicles.findIndex(v => v.id === id)
      if (idx >= 0) mockData.vehicles.splice(idx, 1)
    }
    if (endpoint.includes('/cameras')) {
      const idx = mockData.cameras.findIndex(c => c.id === id)
      if (idx >= 0) mockData.cameras.splice(idx, 1)
    }
    return { data: null }
  }
}

export default api
