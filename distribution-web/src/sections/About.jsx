import { Users, Handshake, TrendingUp } from 'lucide-react'

const pillars = [
  { icon: Users, title: 'Partnership-Driven', desc: 'We operate as a collaborative venture — three partners united by a shared vision of excellence in F&B distribution.' },
  { icon: Handshake, title: 'B2B Focused', desc: 'Our model is built around long-term business relationships: wholesalers, distributors, and retail chains across the region.' },
  { icon: TrendingUp, title: 'Growth Oriented', desc: 'We continuously expand our product portfolio and geographic reach to bring more value to our clients.' },
]

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-mint font-semibold text-sm uppercase tracking-widest">Who We Are</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mt-2 mb-4">About DistribuCore</h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            DistribuCore is a specialist food and beverage distribution company dedicated to bridging quality producers
            with the businesses that need them. We handle the full supply chain — from sourcing to delivery — so you can
            focus on what you do best.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group text-center p-8 rounded-2xl border border-gray-100 hover:border-mint/30 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-xl bg-navy flex items-center justify-center mx-auto mb-5 group-hover:bg-mint transition-colors">
                <Icon size={24} className="text-mint group-hover:text-navy transition-colors" />
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
