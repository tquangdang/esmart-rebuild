import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import usePageTitle from '../hooks/usePageTitle'
import { IconSparkles } from '../components/Icons'

export default function SignIn() {
  usePageTitle('Sign In — eSmart')
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/dashboard')
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Loading...
        </div>
      </div>
    )
  }

  if (user) return <Navigate to="/dashboard" />

  return (
    <section className="min-h-screen flex animate-page-in">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 hero-pattern hero-glow flex-col items-center justify-center p-12 text-white">
        <div className="text-center max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to Home
          </Link>
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <IconSparkles className="w-10 h-10 text-blue-300" />
          </div>
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Welcome to eSmart</h2>
          <p className="text-blue-200/80 text-lg leading-relaxed">
            Your AI-powered content creation platform. Sign in to access the dashboard and start generating.
          </p>
          <div className="mt-10 flex items-center justify-center gap-8 text-sm text-blue-300/60">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />AI Content</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />SEO Tools</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" />Analytics</span>
          </div>
        </div>
        {/* Decorative shapes */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
      </div>

      {/* Right sign-in card */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm mb-8">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
              Back to Home
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl shadow-gray-900/5 dark:shadow-black/20 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">e</div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">eSmart</span>
            </div>

            <h1 className="text-2xl font-bold mb-2 dark:text-white">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to access the Creator AI dashboard</p>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-600 py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all font-medium dark:text-white active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <p className="text-center text-xs text-gray-400 mt-6">
              By signing in, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
