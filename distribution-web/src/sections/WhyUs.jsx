import { ShieldCheck, Truck, RefreshCw, Network } from 'lucide-react'

const features = [
  { icon: ShieldCheck, title: 'Reliability You Can Count On', desc: 'Consistent stock levels, accurate orders, and dependable delivery schedules keep your business running smoothly.' },
  { icon: Truck, title: 'Fast & Fresh Delivery', desc: 'Our logistics network ensures products reach you quickly — fresh, intact, and ready for the shelves.' },
  { icon: RefreshCw, title: 'Always In Stock', desc: 'We maintain deep inventory across all categories and run proactive restocking to prevent shortfalls.' },
  { icon: Network, title: 'Wide Distribution Network', desc: 'Serving B2B clients, wholesalers, and distributors across the region — we scale with your growth.' },
]

export default function WhyUs() {
  return (
    <section id="why-us" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-mint font-semibold text-sm uppercase tracking-widest">Our Advantage</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mt-2 mb-4">Why Choose DistribuCore</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            We're not just a supplier — we're an extension of your supply chain, committed to your success.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-mint/20 transition-all">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center">
                <Icon size={22} className="text-navy" />
              </div>
              <div>
                <h3 className="font-bold text-navy text-base mb-1.5">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
