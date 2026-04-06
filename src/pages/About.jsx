import FadeIn from '../components/FadeIn'
import usePageTitle from '../hooks/usePageTitle'

export default function About() {
  usePageTitle('About — eSmart')

  const team = [
    { name: 'Alex Nguyen', role: 'CEO & Founder', emoji: '👨‍💼' },
    { name: 'Sarah Kim', role: 'Head of AI', emoji: '👩‍💻' },
    { name: 'David Park', role: 'Marketing Lead', emoji: '📊' },
  ]

  return (
    <div className="animate-page-in">
      <section className="py-32 px-6 bg-gradient-to-br from-indigo-900 to-purple-800 text-white text-center">
        <FadeIn>
          <h1 className="text-5xl font-bold mb-6">About eSmart</h1>
          <p className="text-xl max-w-2xl mx-auto text-indigo-100">
            We're a team of developers, marketers, and AI enthusiasts building the future of digital content creation.
          </p>
        </FadeIn>
      </section>

      <section className="py-20 px-6 max-w-4xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl font-bold mb-6 dark:text-white">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-12">
            eSmart Solutions Agency combines cutting-edge AI technology with proven marketing strategies to help businesses create high-quality content at scale. We believe every business deserves access to professional-grade digital marketing tools.
          </p>
        </FadeIn>
        <FadeIn>
          <h2 className="text-3xl font-bold mb-6 dark:text-white">Why Choose Us</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            Our AI-powered platform generates SEO-optimized content tailored to your brand voice, analyzes performance in real-time, and continuously improves based on results.
          </p>
        </FadeIn>
      </section>

      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800/50">
        <FadeIn><h2 className="text-3xl font-bold text-center mb-12 dark:text-white">Our Team</h2></FadeIn>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <FadeIn key={member.name} delay={i * 150}>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent dark:border-gray-700">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">{member.emoji}</div>
                <h3 className="font-bold text-lg dark:text-white">{member.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{member.role}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  )
}
