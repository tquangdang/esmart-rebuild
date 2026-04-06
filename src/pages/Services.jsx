import { Link } from 'react-router-dom'
import FadeIn from '../components/FadeIn'
import { services } from '../data/services'
import usePageTitle from '../hooks/usePageTitle'

export default function Services() {
  usePageTitle('Services — eSmart')

  return (
    <div className="animate-page-in">
      <section className="py-32 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 text-white text-center">
        <FadeIn>
          <h1 className="text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-blue-100">Everything you need to grow your digital presence.</p>
        </FadeIn>
      </section>

      <section className="py-20 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((s, i) => (
          <FadeIn key={s.slug} delay={i * 150}>
            <Link to={`/services/${s.slug}`} className="group block h-full">
              <div className="p-8 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-800 h-full">
                <span className="text-4xl">{s.icon}</span>
                <h3 className="text-2xl font-bold mt-4 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-white">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{s.heroDesc}</p>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 inline-block transition-transform">
                  Learn More &rarr;
                </span>
              </div>
            </Link>
          </FadeIn>
        ))}
      </section>

      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800/50 text-center">
        <FadeIn>
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Ready to Get Started?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            Take our free marketing assessment to see where you stand, or jump right in.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/assessment" className="bg-blue-900 dark:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-800 dark:hover:bg-blue-500 active:scale-95 transition-all">
              Free Assessment
            </Link>
            <Link to="/contact" className="border-2 border-gray-200 dark:border-gray-600 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all dark:text-white">
              Contact Us
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
