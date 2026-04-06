import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { services } from '../data/services'
import FadeIn from '../components/FadeIn'
import usePageTitle from '../hooks/usePageTitle'

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
      >
        <span className="dark:text-gray-200">{q}</span>
        <svg
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-5 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

export default function ServiceDetail() {
  const { slug } = useParams()
  const service = services.find((s) => s.slug === slug)

  usePageTitle(service ? `${service.title} — eSmart` : 'Service Not Found — eSmart')

  if (!service) {
    return (
      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 animate-page-in">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">Service Not Found</h1>
        <Link to="/services" className="text-blue-600 hover:text-blue-800 font-medium">&larr; Back to Services</Link>
      </section>
    )
  }

  return (
    <div className="animate-page-in">
      {/* Hero */}
      <section className="py-28 px-6 bg-gradient-to-br from-blue-900 to-cyan-800 text-white text-center">
        <FadeIn>
          <span className="text-5xl">{service.icon}</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4">{service.title}</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">{service.heroDesc}</p>
        </FadeIn>
      </section>

      {/* Description */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <FadeIn>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{service.description}</p>
        </FadeIn>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Features</h2>
        </FadeIn>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {service.features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 100}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <h3 className="font-bold text-lg mb-2 dark:text-white">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Pricing</h2>
        </FadeIn>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {service.pricing.map((tier, i) => (
            <FadeIn key={tier.name} delay={i * 150}>
              <div className={`p-8 rounded-2xl border-2 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                tier.popular
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                  : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}>
                {tier.popular && (
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Most Popular</span>
                )}
                <h3 className="text-xl font-bold mt-2 dark:text-white">{tier.name}</h3>
                <p className="text-3xl font-bold mt-3 mb-6 text-blue-900 dark:text-blue-400">{tier.price}</p>
                <ul className="space-y-3 text-left mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`block py-3 rounded-xl font-medium active:scale-95 transition-all ${
                    tier.popular
                      ? 'bg-blue-900 dark:bg-blue-600 text-white hover:bg-blue-800 dark:hover:bg-blue-500'
                      : 'border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Frequently Asked Questions</h2>
        </FadeIn>
        <div className="max-w-2xl mx-auto space-y-3">
          {service.faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 80}>
              <FaqItem q={faq.q} a={faq.a} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <FadeIn>
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Ready to Get Started?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            Start with a free trial or talk to our team about a custom plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signin" className="bg-blue-900 dark:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-800 dark:hover:bg-blue-500 active:scale-95 transition-all">
              Start Free Trial
            </Link>
            <Link to="/services" className="border-2 border-gray-200 dark:border-gray-600 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all dark:text-white">
              &larr; All Services
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
