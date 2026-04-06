import { useState } from 'react'
import { useAuth } from '../stores/auth'
import { Navigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import DashboardNav from '../components/dashboard/DashboardNav'
import ContentForm from '../components/dashboard/ContentForm'
import ContentResult from '../components/dashboard/ContentResult'
import ProjectDetail from '../components/dashboard/ProjectDetail'
import { SkeletonCard, SkeletonLine } from '../components/Skeleton'
import usePageTitle from '../hooks/usePageTitle'

const mockProjects = [
  { id: 1, title: 'Q1 Blog Series', type: 'Blog', date: 'Mar 10, 2026', status: 'Completed' },
  { id: 2, title: 'Product Launch Email', type: 'Email', date: 'Mar 15, 2026', status: 'Draft' },
  { id: 3, title: 'Social Campaign — Spring', type: 'Social Media', date: 'Mar 20, 2026', status: 'In Progress' },
]

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen animate-page-in">
      <aside className="w-64 bg-gray-900 p-6 shrink-0">
        <div className="h-6 w-20 bg-gray-700 rounded animate-pulse mb-8" />
        <div className="space-y-3">
          <div className="h-10 bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-10 bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-10 bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </aside>
      <main className="flex-1 p-10 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl space-y-6">
          <SkeletonLine className="w-48 h-3" />
          <SkeletonLine className="w-64 h-6" />
          <SkeletonLine className="w-40 h-3" />
          <div className="space-y-3 mt-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  usePageTitle('Dashboard — eSmart')
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('create')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ type: '', topic: '', keywords: '', tone: '' })
  const [selectedProject, setSelectedProject] = useState(null)

  if (loading) return <DashboardSkeleton />
  if (!user) return <Navigate to="/signin" />

  const resetFlow = () => {
    setStep(1)
    setFormData({ type: '', topic: '', keywords: '', tone: '' })
  }

  const renderContent = () => {
    if (activeTab === 'projects') {
      if (selectedProject) {
        const project = mockProjects.find((p) => p.id === selectedProject)
        return <ProjectDetail project={project} onBack={() => setSelectedProject(null)} />
      }

      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">My Projects</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Your recently generated content.</p>
          <div className="space-y-3">
            {mockProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all text-left"
              >
                <div>
                  <h3 className="font-semibold dark:text-white">{project.title}</h3>
                  <p className="text-sm text-gray-400">{project.type} · {project.date}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  project.status === 'Completed' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  project.status === 'In Progress' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {project.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      )
    }

    if (activeTab === 'settings') {
      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Settings</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Manage your account preferences.</p>
          <div className="max-w-md space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
              <input type="text" defaultValue={user.displayName || ''} className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" defaultValue={user.email || ''} disabled className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400" />
            </div>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all font-medium">
              Save Changes
            </button>
          </div>
        </div>
      )
    }

    if (step === 3) {
      return <ContentResult formData={formData} onReset={resetFlow} />
    }

    return (
      <ContentForm
        step={step}
        formData={formData}
        setFormData={setFormData}
        onNext={() => setStep(step + 1)}
        onBack={() => setStep(step - 1)}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-screen animate-page-in">
      <DashboardNav />
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab)
            setSelectedProject(null)
            if (tab === 'create') resetFlow()
          }}
        />
        <main className="flex-1 p-10 bg-gray-50 dark:bg-gray-900 overflow-auto">
          <div className="max-w-3xl">
            <p className="text-sm text-gray-400 mb-6">
              Welcome back, <span className="font-medium text-gray-600 dark:text-gray-300">{user.displayName}</span>
            </p>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
