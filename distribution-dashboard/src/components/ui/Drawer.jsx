import { X } from 'lucide-react'

export default function Drawer({ open, onClose, title, children, wide = false }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className={`fixed inset-y-0 right-0 z-50 ${wide ? 'w-full max-w-2xl' : 'w-full max-w-md'} bg-white shadow-2xl flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  )
}
