import { MessageCircle, Mail, MapPin } from 'lucide-react'

export default function Contact() {
  const wa = import.meta.env.VITE_WHATSAPP_NUMBER

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-mint font-semibold text-sm uppercase tracking-widest">Get In Touch</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mt-2 mb-4">Contact Us</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Ready to start? Reach out via WhatsApp for the fastest response, or send us an email.
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-4">
          <a
            href={`https://wa.me/${wa}?text=Hello%20DistribuCore%2C%20I%27d%20like%20to%20enquire%20about%20your%20products.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-mint/40 hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0">
              <MessageCircle size={22} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-navy">WhatsApp (Recommended)</p>
              <p className="text-gray-400 text-sm">+{wa} · Fastest response</p>
            </div>
            <span className="ml-auto text-mint opacity-0 group-hover:opacity-100 transition-opacity font-semibold text-sm">Chat →</span>
          </a>

          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-navy/10 flex items-center justify-center shrink-0">
              <Mail size={22} className="text-navy" />
            </div>
            <div>
              <p className="font-semibold text-navy">Email</p>
              <p className="text-gray-400 text-sm">info@distribucore.com</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-navy/10 flex items-center justify-center shrink-0">
              <MapPin size={22} className="text-navy" />
            </div>
            <div>
              <p className="font-semibold text-navy">Location</p>
              <p className="text-gray-400 text-sm">Serving the region — contact us for area coverage details</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
