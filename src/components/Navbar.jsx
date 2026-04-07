import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { useAuth } from '../stores/auth'
import { useTheme } from '../stores/theme'
import { useToast } from '../stores/toast'
import { useTranslation } from 'react-i18next'

const navLinks = [
  { to: '/', en: 'Home', vi: 'Trang Chủ', icon: '🏠' },
  { to: '/about', en: 'About', vi: 'Giới Thiệu', icon: 'ℹ️' },
  { to: '/services', en: 'Services', vi: 'Dịch Vụ', icon: '⚙️' },
  { to: '/blog', en: 'Blog', vi: 'Blog', icon: '📝' },
  { to: '/assessment', en: 'Assessment', vi: 'Đánh Giá', icon: '📊' },
  { to: '/contact', en: 'Contact', vi: 'Liên Hệ', icon: '✉️' },
]

const authLabels = {
  dashboard: { en: 'Dashboard', vi: 'Bảng Điều Khiển' },
  signIn: { en: 'Sign In', vi: 'Đăng Nhập' },
  signOut: { en: 'Sign Out', vi: 'Đăng Xuất' },
}

function StableText({ en, vi, lang }) {
  return (
    <span className="inline-grid place-items-center">
      <span className={`col-start-1 row-start-1 whitespace-nowrap ${lang === 'en' ? '' : 'invisible'}`}>{en}</span>
      <span className={`col-start-1 row-start-1 whitespace-nowrap ${lang === 'vi' ? '' : 'invisible'}`}>{vi}</span>
    </span>
  )
}

export default function Navbar() {
  const { user } = useAuth()
  const { i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const lang = i18n.language

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setDropdownOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut(auth)
    setDropdownOpen(false)
    setMenuOpen(false)
    showToast('Signed out successfully')
    navigate('/')
  }

  const closeMenu = () => setMenuOpen(false)
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav
      className={`fixed top-5 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 rounded-2xl border transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 shadow-xl shadow-gray-900/10 dark:shadow-black/30 border-blue-500/50 dark:border-blue-400/40'
          : 'bg-white/90 dark:bg-gray-900/90 shadow-lg shadow-gray-900/5 dark:shadow-black/20 border-gray-200 dark:border-gray-700'
      } backdrop-blur-xl`}
    >
      {/* Desktop */}
      <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3 gap-4">
        {/* Logo */}
        <div className="justify-self-start">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">e</div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">eSmart</span>
          </Link>
        </div>

        {/* Center nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive(link.to)
                  ? 'text-blue-900 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-xs">{link.icon}</span>
              <StableText en={link.en} vi={link.vi} lang={lang} />
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5 justify-self-end">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <svg className="w-4.5 h-4.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          {/* Language flags */}
          <div className="flex gap-1">
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'en'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >🇺🇸 EN</button>
            <button
              onClick={() => i18n.changeLanguage('vi')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'vi'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >🇻🇳 VI</button>
          </div>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-blue-100 dark:ring-blue-800 shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                    {user.displayName?.[0] || '?'}
                  </div>
                )}
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-900/10 dark:shadow-black/30 py-2 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                      </svg>
                      <span>{lang === 'en' ? authLabels.dashboard.en : authLabels.dashboard.vi}</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      <span>{lang === 'en' ? authLabels.signOut.en : authLabels.signOut.vi}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/signin" className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-400 active:scale-95 transition-all text-center">
              <StableText en={authLabels.signIn.en} vi={authLabels.signIn.vi} lang={lang} />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex md:hidden justify-between items-center px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">e</div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">eSmart</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition active:scale-90"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
          <div className="flex gap-0.5">
            <button onClick={() => i18n.changeLanguage('en')} className={`px-1.5 py-1 rounded-lg text-xs font-bold transition ${lang === 'en' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'text-gray-400'}`}>🇺🇸</button>
            <button onClick={() => i18n.changeLanguage('vi')} className={`px-1.5 py-1 rounded-lg text-xs font-bold transition ${lang === 'vi' ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'text-gray-400'}`}>🇻🇳</button>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeMenu}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive(link.to) ? 'text-blue-900 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-600 dark:text-gray-400 hover:text-blue-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-sm">{link.icon}</span>
              {lang === 'en' ? link.en : link.vi}
            </Link>
          ))}

          {user ? (
            <>
              <Link to="/dashboard" onClick={closeMenu} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive('/dashboard') ? 'text-blue-900 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}>
                📋 {lang === 'en' ? authLabels.dashboard.en : authLabels.dashboard.vi}
              </Link>
              <div className="flex items-center gap-3 px-3 py-3 mt-1 border-t border-gray-100 dark:border-gray-800">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-blue-100 dark:ring-blue-800" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                    {user.displayName?.[0] || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{user.displayName}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <button onClick={handleSignOut} className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 font-medium transition">
                  {lang === 'en' ? authLabels.signOut.en : authLabels.signOut.vi}
                </button>
              </div>
            </>
          ) : (
            <Link to="/signin" onClick={closeMenu} className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-3 rounded-lg text-center font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition mt-2">
              {lang === 'en' ? authLabels.signIn.en : authLabels.signIn.vi}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
