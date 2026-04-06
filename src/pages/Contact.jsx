import { useState } from 'react'
import FadeIn from '../components/FadeIn'
import { useToast } from '../stores/toast'
import usePageTitle from '../hooks/usePageTitle'

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

  const inputClass = (field) =>
    `w-full p-4 border rounded-xl focus:outline-none focus:ring-2 transition bg-white dark:bg-gray-800 dark:text-white ${
      errors[field]
        ? 'border-red-300 dark:border-red-500 focus:ring-red-400'
        : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
    }`

  return (
    <div className="animate-page-in">
      <section className="py-32 px-6 bg-gradient-to-br from-gray-900 to-gray-700 text-white text-center">
        <FadeIn>
          <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-gray-300">Let's discuss how we can help your business grow.</p>
        </FadeIn>
      </section>

      <section className="py-20 px-6 max-w-2xl mx-auto">
        <FadeIn>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={inputClass('name')}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.name}</p>}
            </div>
            <div>
              <input
                type="email"
                placeholder="Your Email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={inputClass('email')}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.email}</p>}
            </div>
            <div>
              <textarea
                placeholder="Your Message"
                rows="5"
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                className={inputClass('message')}
              />
              {errors.message && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-blue-900 dark:bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-800 dark:hover:bg-blue-500 hover:shadow-lg active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </FadeIn>
      </section>
    </div>
  )
}
