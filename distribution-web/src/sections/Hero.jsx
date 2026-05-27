import { MessageCircle, ChevronDown } from 'lucide-react'

export default function Hero() {
  const wa = import.meta.env.VITE_WHATSAPP_NUMBER

  return (
    <section className="relative min-h-screen bg-navy flex items-center justify-center overflow-hidden pt-16">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #4ECFA8 0%, transparent 50%), radial-gradient(circle at 75% 75%, #E8A838 0%, transparent 50%)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mint/15 text-mint text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
          F&B Distribution Partner
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
          Your Trusted
          <span className="block text-mint">F&B Distribution</span>
          Partner
        </h1>

        <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Connecting quality food & beverage products with businesses across the region.
          Fast delivery, fresh stock, and reliable partnerships — built for growth.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`https://wa.me/${wa}?text=Hello%20DistribuCore%2C%20I'd%20like%20to%20place%20an%20order.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-mint text-navy font-bold text-base rounded-xl hover:bg-mint-600 transition-all shadow-lg shadow-mint/20"
          >
            <MessageCircle size={20} />
            Order via WhatsApp
          </a>
          <a
            href="#about"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-medium text-base rounded-xl hover:bg-white/10 transition-all"
          >
            Learn More
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl mx-auto">
          {[['5+', 'Categories'], ['100+', 'Products'], ['B2B Ready', 'Wholesale']].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-white">{val}</p>
              <p className="text-white/40 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 hover:text-white/60 transition-colors animate-bounce">
        <ChevronDown size={24} />
      </a>
    </section>
  )
}
