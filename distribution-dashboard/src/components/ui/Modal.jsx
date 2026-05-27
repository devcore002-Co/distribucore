import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  )
}
