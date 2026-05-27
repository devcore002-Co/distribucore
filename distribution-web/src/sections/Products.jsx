const categories = [
  { emoji: '🥛', name: 'Dairy', desc: 'Fresh milk, cheese, yogurt, cream, butter — sourced from trusted farms and delivered chilled.' },
  { emoji: '🧃', name: 'Juice', desc: 'Natural and processed fruit juices, nectars, and drinks in a wide range of flavors and pack sizes.' },
  { emoji: '🥤', name: 'Beverage', desc: 'Carbonated drinks, energy drinks, water, and specialty beverages for every market segment.' },
  { emoji: '🌾', name: 'Dried Goods', desc: 'Grains, legumes, dried fruits, nuts, and pantry staples with extended shelf life.' },
  { emoji: '🍬', name: 'Confectionery', desc: 'Chocolates, candies, gum, biscuits, and sweet snacks from leading regional and international brands.' },
]

export default function Products() {
  return (
    <section id="products" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-mint font-semibold text-sm uppercase tracking-widest">Our Portfolio</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mt-2 mb-4">What We Distribute</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Five core F&B categories, carefully curated to meet the demands of modern retail and wholesale markets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(({ emoji, name, desc }) => (
            <div key={name} className="group bg-white rounded-2xl p-7 border border-gray-100 hover:border-mint/40 hover:shadow-xl transition-all duration-200">
              <div className="text-4xl mb-4">{emoji}</div>
              <h3 className="font-bold text-navy text-xl mb-2">{name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              <div className="mt-5 w-10 h-1 rounded-full bg-mint opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}

          {/* CTA card */}
          <div className="bg-navy rounded-2xl p-7 flex flex-col justify-between">
            <div>
              <p className="text-mint font-semibold text-sm mb-3">Looking for something specific?</p>
              <h3 className="text-white font-bold text-xl mb-2">Let's talk about your needs</h3>
              <p className="text-white/50 text-sm leading-relaxed">Our team can source and supply a wide range beyond our standard catalogue.</p>
            </div>
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block px-5 py-2.5 bg-mint text-navy font-semibold text-sm rounded-lg hover:bg-mint-600 transition-colors text-center"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
