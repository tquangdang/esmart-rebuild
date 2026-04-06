import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { useAuth } from '../../stores/auth'
import { useToast } from '../../stores/toast'

export default function DashboardNav() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleSignOut = async () => {
    await signOut(auth)
    showToast('Signed out successfully')
    navigate('/')
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-blue-900 dark:text-blue-400 hover:opacity-80 transition">
        eSmart
      </Link>
      <div className="flex items-center gap-3">
        {user?.photoURL && (
          <img
            src={user.photoURL}
            alt=""
            className="w-8 h-8 rounded-full ring-2 ring-blue-100 dark:ring-blue-800"
            referrerPolicy="no-referrer"
          />
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
          {user?.displayName}
        </span>
        <button
          onClick={handleSignOut}
          className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition active:scale-95 ml-1"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
