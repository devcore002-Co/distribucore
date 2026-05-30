import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '#about', label: 'About' },
  { href: '#products', label: 'Products' },
  { href: '#why-us', label: 'Why Us' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-navy/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center">
          <img src="/logo.png" alt="Golden Cedar" className="h-10 w-10 object-contain" />
        </a>

        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-white/70 hover:text-white text-sm font-medium transition-colors">{l.label}</a>
          ))}
          <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
            className="ml-2 px-4 py-2 bg-mint text-navy text-sm font-semibold rounded-lg hover:bg-mint-600 transition-colors">
            Order via WhatsApp
          </a>
        </nav>

        <button className="md:hidden text-white" onClick={() => setOpen(o => !o)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-navy border-t border-white/10 px-4 py-4 space-y-2">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-white/70 hover:text-white text-sm font-medium py-2">{l.label}</a>
          ))}
          <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
            className="block mt-3 px-4 py-2 bg-mint text-navy text-sm font-semibold rounded-lg text-center">
            Order via WhatsApp
          </a>
        </div>
      )}
    </header>
  )
}
