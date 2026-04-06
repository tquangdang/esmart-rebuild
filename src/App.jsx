import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import SignIn from './pages/SignIn'
import Dashboard from './pages/Dashboard'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import MarketingAssessment from './pages/MarketingAssessment'
import NotFound from './pages/NotFound'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './stores/auth'
import { ToastProvider } from './stores/toast'
import { ThemeProvider } from './stores/theme'

function AppLayout() {
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {!isDashboard && <Navbar />}
      <main className={!isDashboard ? 'pt-24' : undefined}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/assessment" element={<MarketingAssessment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </main>
      {!isDashboard && <Footer />}
      <ScrollToTop />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
