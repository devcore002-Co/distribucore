import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pageSize, total, onPage }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
      <span>Page {page} of {totalPages}</span>
      <div className="flex gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
