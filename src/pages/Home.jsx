import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import FadeIn from '../components/FadeIn'
import useCountUp from '../hooks/useCountUp'
import usePageTitle from '../hooks/usePageTitle'
import { IconRobot, IconChart, IconSearch, IconQuote, IconUsers, IconDocument, IconTrophy } from '../components/Icons'

function StatItem({ target, suffix, label, icon: Icon }) {
  const { count, ref } = useCountUp(target)
  return (
    <div ref={ref} className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">{label}</p>
    </div>
  )
}

export default function Home() {
  usePageTitle('eSmart Solutions Agency')
  const { t } = useTranslation()

  const services = [
    { title: t('home.service1Title'), desc: t('home.service1Desc'), icon: IconRobot, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    { title: t('home.service2Title'), desc: t('home.service2Desc'), icon: IconChart, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
    { title: t('home.service3Title'), desc: t('home.service3Desc'), icon: IconSearch, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
  ]

  const testimonials = [
    { name: 'Sarah Johnson', role: 'CEO, TechStart', initial: 'S', color: 'from-blue-500 to-indigo-600', quote: 'eSmart transformed our content strategy. Our organic traffic increased by 200% in just 3 months.' },
    { name: 'Michael Chen', role: 'Marketing Director', initial: 'M', color: 'from-emerald-500 to-teal-600', quote: 'The AI content tools saved us countless hours while maintaining quality our audience loves.' },
    { name: 'Emily Davis', role: 'Founder, GrowthLab', initial: 'E', color: 'from-purple-500 to-pink-600', quote: 'Professional, innovative, and results-driven. The best digital agency we\'ve worked with.' },
  ]

  const steps = [
    { num: '1', title: 'Tell Us Your Needs', desc: 'Pick your content type, topic, keywords, and preferred tone.' },
    { num: '2', title: 'AI Generates Content', desc: 'Our AI engine creates high-quality, SEO-optimized content in seconds.' },
    { num: '3', title: 'Review & Publish', desc: 'Edit, refine, and publish across your channels with one click.' },
  ]

  return (
    <div className="animate-page-in">
      {/* Hero */}
      <section className="hero-pattern hero-glow flex flex-col items-center justify-center text-center py-36 px-6 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8 text-sm text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Marketing Platform
          </div>
        </FadeIn>
        <FadeIn delay={100}><h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight max-w-4xl">{t('home.heroTitle')}</h1></FadeIn>
        <FadeIn delay={200}><p className="text-xl md:text-2xl max-w-2xl mb-10 text-blue-200/80 leading-relaxed">{t('home.heroSubtitle')}</p></FadeIn>
        <FadeIn delay={300}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/assessment" className="bg-white text-blue-900 px-8 py-3.5 rounded-full font-semibold hover:bg-blue-50 hover:shadow-xl hover:shadow-white/10 active:scale-95 transition-all duration-300">
              {t('home.heroCta')}
            </Link>
            <Link to="/services" className="border border-white/20 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 active:scale-95 transition-all duration-300">
              View Services
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <StatItem target={500} suffix="+" label="Clients Served" icon={IconUsers} />
          <StatItem target={10000} suffix="+" label="Content Pieces" icon={IconDocument} />
          <StatItem target={98} suffix="%" label="Client Satisfaction" icon={IconTrophy} />
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-6">
        <FadeIn><h2 className="text-3xl md:text-4xl font-bold text-center mb-4 dark:text-white">{t('home.servicesTitle')}</h2></FadeIn>
        <FadeIn delay={100}><p className="text-gray-500 dark:text-gray-400 text-center mb-14 max-w-xl mx-auto">Comprehensive solutions to supercharge your digital presence.</p></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, i) => (
            <FadeIn key={service.title} delay={i * 150}>
              <div className="p-8 rounded-2xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">{service.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{service.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-800/50">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 dark:text-white">How It Works</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-16 max-w-xl mx-auto">Go from idea to published content in three simple steps.</p>
        </FadeIn>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent" />
          {steps.map((step, i) => (
            <FadeIn key={step.num} delay={i * 200}>
              <div className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-lg shadow-blue-600/25 relative z-10">{step.num}</div>
                <h3 className="text-lg font-bold mb-2 dark:text-white">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <FadeIn><h2 className="text-3xl md:text-4xl font-bold text-center mb-4 dark:text-white">{t('home.testimonialsTitle')}</h2></FadeIn>
        <FadeIn delay={100}><p className="text-gray-500 dark:text-gray-400 text-center mb-14 max-w-xl mx-auto">Trusted by hundreds of businesses worldwide.</p></FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((tst, i) => (
            <FadeIn key={tst.name} delay={i * 150}>
              <div className="relative bg-white dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300">
                <IconQuote className="w-10 h-10 text-blue-100 dark:text-blue-900/50 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">"{tst.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tst.color} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {tst.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-sm dark:text-white">{tst.name}</p>
                    <p className="text-xs text-gray-400">{tst.role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="hero-pattern hero-glow py-28 px-6 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white text-center">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Ready to Transform Your Content Strategy?</h2>
          <p className="text-blue-200/80 text-lg max-w-xl mx-auto mb-10">Join hundreds of businesses using eSmart to create better content, faster.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signin" className="bg-white text-blue-900 px-8 py-3.5 rounded-full font-semibold hover:bg-blue-50 hover:shadow-xl hover:shadow-white/10 active:scale-95 transition-all duration-300">Get Started Free</Link>
            <Link to="/contact" className="border border-white/20 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-white/10 active:scale-95 transition-all duration-300">Talk to Us</Link>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
