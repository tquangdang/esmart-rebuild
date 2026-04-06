import { Link } from 'react-router-dom'
import usePageTitle from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('404 — eSmart')

  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 animate-page-in">
      <h1 className="text-8xl font-bold text-blue-900 dark:text-blue-400 mb-4">404</h1>
      <p className="text-2xl font-semibold mb-2 dark:text-white">Page Not Found</p>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="bg-blue-900 dark:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-800 dark:hover:bg-blue-500 active:scale-95 transition-all">Go Home</Link>
    </section>
  )
}
