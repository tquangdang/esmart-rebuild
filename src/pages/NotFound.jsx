import { Link } from 'react-router-dom'
import FadeIn from '../components/FadeIn'
import usePageTitle from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('404 — eSmart')

  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 animate-page-in relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-60" />
      </div>

      <FadeIn>
        {/* SVG illustration */}
        <div className="mb-8">
          <svg className="w-48 h-48 mx-auto text-blue-100 dark:text-blue-900/30" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" />
            <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="1.5" />
            <path d="M70 90 Q100 130 130 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-blue-200 dark:text-blue-800" />
            <circle cx="80" cy="80" r="5" fill="currentColor" className="text-blue-300 dark:text-blue-700" />
            <circle cx="120" cy="80" r="5" fill="currentColor" className="text-blue-300 dark:text-blue-700" />
            <path d="M60 60 L40 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-blue-200 dark:text-blue-800" />
            <path d="M140 60 L160 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-blue-200 dark:text-blue-800" />
            <path d="M100 160 L100 180" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-blue-200 dark:text-blue-800" />
          </svg>
        </div>

        <h1 className="text-8xl md:text-9xl font-extrabold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">404</h1>
        <p className="text-2xl font-bold mb-2 dark:text-white">Page Not Found</p>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md">The page you're looking for doesn't exist or has been moved.</p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:scale-95 transition-all">
            Go Home
          </Link>
          <Link to="/blog" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-6 py-3 rounded-xl font-medium transition-colors">
            Read Blog
          </Link>
          <Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-6 py-3 rounded-xl font-medium transition-colors">
            Contact Us
          </Link>
        </div>
      </FadeIn>
    </section>
  )
}
