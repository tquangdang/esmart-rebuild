import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import FadeIn from '../components/FadeIn'
import useCountUp from '../hooks/useCountUp'
import usePageTitle from '../hooks/usePageTitle'

function StatItem({ target, suffix, label }) {
  const { count, ref } = useCountUp(target)
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-400">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  )
}

export default function Home() {
  usePageTitle('eSmart Solutions Agency')
  const { t } = useTranslation()

  const services = [
    { title: t('home.service1Title'), desc: t('home.service1Desc'), icon: '🤖' },
    { title: t('home.service2Title'), desc: t('home.service2Desc'), icon: '📈' },
    { title: t('home.service3Title'), desc: t('home.service3Desc'), icon: '🔍' },
  ]

  const testimonials = [
    { name: 'Sarah Johnson', role: 'CEO, TechStart', quote: 'eSmart transformed our content strategy. Our organic traffic increased by 200% in just 3 months.' },
    { name: 'Michael Chen', role: 'Marketing Director', quote: 'The AI content tools saved us countless hours while maintaining quality our audience loves.' },
    { name: 'Emily Davis', role: 'Founder, GrowthLab', quote: 'Professional, innovative, and results-driven. The best digital agency we\'ve worked with.' },
  ]

  const steps = [
    { num: '1', title: 'Tell Us Your Needs', desc: 'Pick your content type, topic, keywords, and preferred tone.' },
    { num: '2', title: 'AI Generates Content', desc: 'Our AI engine creates high-quality, SEO-optimized content in seconds.' },
    { num: '3', title: 'Review & Publish', desc: 'Edit, refine, and publish across your channels with one click.' },
  ]

  return (
    <div className="animate-page-in">
      <section className="flex flex-col items-center justify-center text-center py-32 px-6 bg-gradient-to-br from-blue-900 to-indigo-800 text-white">
        <FadeIn><h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{t('home.heroTitle')}</h1></FadeIn>
        <FadeIn delay={150}><p className="text-xl max-w-2xl mb-8 text-blue-100">{t('home.heroSubtitle')}</p></FadeIn>
        <FadeIn delay={300}>
          <Link to="/assessment" className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 hover:shadow-lg active:scale-95 transition-all duration-300">
            {t('home.heroCta')}
          </Link>
        </FadeIn>
      </section>

      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <StatItem target={500} suffix="+" label="Clients Served" />
          <StatItem target={10000} suffix="+" label="Content Pieces" />
          <StatItem target={98} suffix="%" label="Client Satisfaction" />
        </div>
      </section>

      <section className="py-20 px-6">
        <FadeIn><h2 className="text-3xl font-bold text-center mb-12 dark:text-white">{t('home.servicesTitle')}</h2></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, i) => (
            <FadeIn key={service.title} delay={i * 150}>
              <div className="p-8 rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-300">
                <span className="text-4xl">{service.icon}</span>
                <h3 className="text-xl font-semibold mt-4 mb-3 dark:text-white">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{service.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800/50">
        <FadeIn>
          <h2 className="text-3xl font-bold text-center mb-4 dark:text-white">How It Works</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-16 max-w-xl mx-auto">Go from idea to published content in three simple steps.</p>
        </FadeIn>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 dark:from-blue-800 dark:via-blue-600 dark:to-blue-800" />
          {steps.map((step, i) => (
            <FadeIn key={step.num} delay={i * 200}>
              <div className="text-center relative">
                <div className="w-16 h-16 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-lg relative z-10">{step.num}</div>
                <h3 className="text-lg font-bold mb-2 dark:text-white">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="py-20 px-6">
        <FadeIn><h2 className="text-3xl font-bold text-center mb-12 dark:text-white">{t('home.testimonialsTitle')}</h2></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((tst, i) => (
            <FadeIn key={tst.name} delay={i * 150}>
              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic leading-relaxed">"{tst.quote}"</p>
                <p className="font-semibold dark:text-white">{tst.name}</p>
                <p className="text-sm text-gray-400">{tst.role}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-br from-blue-900 to-indigo-800 text-white text-center">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Content Strategy?</h2>
          <p className="text-blue-200 text-lg max-w-xl mx-auto mb-8">Join hundreds of businesses using eSmart to create better content, faster.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signin" className="bg-white text-blue-900 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 hover:shadow-lg active:scale-95 transition-all duration-300">Get Started Free</Link>
            <Link to="/contact" className="border-2 border-white/30 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 active:scale-95 transition-all duration-300">Talk to Us</Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
