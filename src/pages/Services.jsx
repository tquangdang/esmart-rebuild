import { Link } from 'react-router-dom'
import FadeIn from '../components/FadeIn'
import { services } from '../data/services'
import usePageTitle from '../hooks/usePageTitle'
import { IconRobot, IconSearch, IconChart } from '../components/Icons'

const iconMap = { robot: IconRobot, search: IconSearch, chart: IconChart }

export default function Services() {
  usePageTitle('Services — eSmart')

  return (
    <div className="animate-page-in">
      {/* Hero */}
      <section className="hero-pattern hero-glow py-36 px-6 bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-900 text-white text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8 text-sm text-blue-200">
            What We Offer
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">Our Services</h1>
          <p className="text-xl text-blue-200/80 max-w-2xl mx-auto">Everything you need to grow your digital presence.</p>
        </FadeIn>
      </section>

      {/* Service cards */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((s, i) => {
          const Icon = iconMap[s.iconName] || IconRobot
          return (
            <FadeIn key={s.slug} delay={i * 150}>
              <Link to={`/services/${s.slug}`} className="group block h-full">
                <div className="p-8 border border-gray-100 dark:border-gray-700/50 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-800/50 h-full flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl ${s.iconColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-white">{s.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 flex-1 leading-relaxed">{s.heroDesc}</p>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 inline-flex items-center gap-1.5 transition-transform">
                    Learn More
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </span>
                </div>
              </Link>
            </FadeIn>
          )
        })}
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-800/50 text-center">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Ready to Get Started?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto">
            Take our free marketing assessment to see where you stand, or jump right in.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/assessment" className="bg-blue-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:scale-95 transition-all">
              Free Assessment
            </Link>
            <Link to="/contact" className="border border-gray-200 dark:border-gray-600 px-8 py-3.5 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all dark:text-white">
              Contact Us
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
