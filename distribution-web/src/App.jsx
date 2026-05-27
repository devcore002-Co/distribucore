import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import About from './sections/About'
import Products from './sections/Products'
import WhyUs from './sections/WhyUs'
import Contact from './sections/Contact'
import Footer from './sections/Footer'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Products />
        <WhyUs />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
