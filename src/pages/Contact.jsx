import { useState } from 'react'
import FadeIn from '../components/FadeIn'
import { useToast } from '../stores/toast'
import usePageTitle from '../hooks/usePageTitle'
import { IconMail, IconPhone, IconMapPin } from '../components/Icons'

const contactInfo = [
  { icon: IconMail, label: 'Email', value: 'hello@esmart.agency', href: 'mailto:hello@esmart.agency' },
  { icon: IconPhone, label: 'Phone', value: '+1 (555) 123-4567', href: 'tel:+15551234567' },
  { icon: IconMapPin, label: 'Office', value: 'San Francisco, CA', href: null },
]

export default function Contact() {
  usePageTitle('Contact — eSmart')
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.'
    if (!form.message.trim()) e.message = 'Message is required.'
    return e
  }

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSending(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSending(false)
    setForm({ name: '', email: '', message: '' })
    showToast('Message sent! We\'ll get back to you within 24 hours.')
  }

  return (
    <div className="animate-page-in">
      {/* Hero */}
      <section className="hero-pattern hero-glow py-36 px-6 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8 text-sm text-blue-200">
            Get in Touch
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">Contact Us</h1>
          <p className="text-xl text-blue-200/80 max-w-2xl mx-auto">Let's discuss how we can help your business grow.</p>
        </FadeIn>
      </section>

      {/* Two-column layout */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left - info cards */}
          <div className="lg:col-span-2 space-y-6">
            <FadeIn>
              <h2 className="text-2xl font-bold mb-2 dark:text-white">Let's talk</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                Have a project in mind? We'd love to hear about it. Reach out and we'll respond within 24 hours.
              </p>
            </FadeIn>
            {contactInfo.map((info, i) => (
              <FadeIn key={info.label} delay={i * 100}>
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <info.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{info.label}</p>
                    {info.href ? (
                      <a href={info.href} className="text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{info.value}</a>
                    ) : (
                      <p className="text-gray-900 dark:text-white font-medium">{info.value}</p>
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Right - form */}
          <div className="lg:col-span-3">
            <FadeIn delay={200}>
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800/50 p-8 md:p-10 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full p-3.5 border rounded-xl focus:outline-none focus:ring-2 transition bg-gray-50 dark:bg-gray-900/50 dark:text-white placeholder:text-gray-400 ${
                      errors.name ? 'border-red-300 dark:border-red-500 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1.5">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@company.com"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full p-3.5 border rounded-xl focus:outline-none focus:ring-2 transition bg-gray-50 dark:bg-gray-900/50 dark:text-white placeholder:text-gray-400 ${
                      errors.email ? 'border-red-300 dark:border-red-500 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1.5">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <textarea
                    placeholder="Tell us about your project..."
                    rows="5"
                    value={form.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className={`w-full p-3.5 border rounded-xl focus:outline-none focus:ring-2 transition bg-gray-50 dark:bg-gray-900/50 dark:text-white placeholder:text-gray-400 resize-none ${
                      errors.message ? 'border-red-300 dark:border-red-500 focus:ring-red-400' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
                    }`}
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1.5">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Sending...
                    </span>
                  ) : 'Send Message'}
                </button>
              </form>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  )
}
