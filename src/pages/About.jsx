import FadeIn from '../components/FadeIn'
import usePageTitle from '../hooks/usePageTitle'
import { IconShield, IconBolt, IconGlobe, IconLightBulb, IconUsers, IconDocument, IconTrophy } from '../components/Icons'

function StatBlock({ value, label, icon: Icon }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  )
}

export default function About() {
  usePageTitle('About — eSmart')

  const team = [
    { name: 'Alex Nguyen', role: 'CEO & Founder', initial: 'A', gradient: 'from-blue-500 to-indigo-600' },
    { name: 'Sarah Kim', role: 'Head of AI', initial: 'S', gradient: 'from-emerald-500 to-teal-600' },
    { name: 'David Park', role: 'Marketing Lead', initial: 'D', gradient: 'from-purple-500 to-pink-600' },
  ]

  const values = [
    { icon: IconBolt, title: 'Lightning Fast', desc: 'Generate production-ready content in seconds, not hours.' },
    { icon: IconShield, title: 'Enterprise Security', desc: 'Your data is encrypted and never shared with third parties.' },
    { icon: IconGlobe, title: 'Global Reach', desc: 'Multi-language support to reach audiences worldwide.' },
    { icon: IconLightBulb, title: 'Smart Insights', desc: 'AI-driven analytics that adapt to your brand voice.' },
  ]

  return (
    <div className="animate-page-in">
      {/* Hero */}
      <section className="hero-pattern hero-glow py-36 px-6 bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8 text-sm text-indigo-200">
            Our Story
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">About eSmart</h1>
          <p className="text-xl max-w-2xl mx-auto text-indigo-200/80 leading-relaxed">
            We're a team of developers, marketers, and AI enthusiasts building the future of digital content creation.
          </p>
        </FadeIn>
      </section>

      {/* Mission -- split layout */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6 dark:text-white">Democratizing AI-Powered Marketing</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                eSmart Solutions Agency combines cutting-edge AI technology with proven marketing strategies to help businesses create high-quality content at scale.
              </p>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                We believe every business deserves access to professional-grade digital marketing tools, regardless of size or budget.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-10 border border-indigo-100 dark:border-indigo-800/30">
              <div className="grid grid-cols-2 gap-6">
                {values.slice(0, 2).map((v) => (
                  <div key={v.title} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400 mb-3">
                      <v.icon className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-sm dark:text-white">{v.title}</p>
                  </div>
                ))}
                {values.slice(2).map((v) => (
                  <div key={v.title} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400 mb-3">
                      <v.icon className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-sm dark:text-white">{v.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why Choose Us -- feature grid */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-800/50">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 dark:text-white">Why Choose Us</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-14 max-w-xl mx-auto">Our platform adapts to your brand and delivers measurable results.</p>
        </FadeIn>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <FadeIn key={v.title} delay={i * 100}>
              <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <v.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg dark:text-white mb-1">{v.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-16 px-6 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <FadeIn><StatBlock value="5+" label="Years in Business" icon={IconTrophy} /></FadeIn>
          <FadeIn delay={100}><StatBlock value="20+" label="Team Members" icon={IconUsers} /></FadeIn>
          <FadeIn delay={200}><StatBlock value="500+" label="Projects Delivered" icon={IconDocument} /></FadeIn>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6">
        <FadeIn><h2 className="text-3xl md:text-4xl font-bold text-center mb-4 dark:text-white">Our Team</h2></FadeIn>
        <FadeIn delay={100}><p className="text-gray-500 dark:text-gray-400 text-center mb-14 max-w-xl mx-auto">The people behind the platform.</p></FadeIn>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <FadeIn key={member.name} delay={i * 150}>
              <div className="bg-white dark:bg-gray-800/50 p-8 rounded-2xl text-center border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-20 h-20 bg-gradient-to-br ${member.gradient} rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-5 shadow-lg`}>
                  {member.initial}
                </div>
                <h3 className="font-bold text-lg dark:text-white">{member.name}</h3>
                <span className="inline-block mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">{member.role}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  )
}
