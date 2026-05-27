export const formatCurrency = (cents) => {
  if (cents == null) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const statusColor = (status) => ({
  pending: 'bg-amber-100 text-amber-700',
  fulfilled: 'bg-mint-100 text-mint-700',
  partial: 'bg-blue-100 text-blue-700',
  credited: 'bg-purple-100 text-purple-700',
}[status] || 'bg-gray-100 text-gray-700')

export const typeColor = (type) => ({
  b2b: 'bg-blue-100 text-blue-700',
  wholesaler: 'bg-indigo-100 text-indigo-700',
  distributor: 'bg-purple-100 text-purple-700',
}[type] || 'bg-gray-100 text-gray-700')
