import { useState, useEffect } from 'react'
import { useAuth } from '../stores/auth'
import { Navigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import DashboardNav from '../components/dashboard/DashboardNav'
import ContentForm from '../components/dashboard/ContentForm'
import ContentResult from '../components/dashboard/ContentResult'
import ProjectDetail from '../components/dashboard/ProjectDetail'
import { SkeletonCard, SkeletonLine } from '../components/Skeleton'
import { useToast } from '../stores/toast'
import usePageTitle from '../hooks/usePageTitle'
import useContentStream from '../hooks/useContentStream'
import api from '../config/api'

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
          <div className="space-y-3 mt-8"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        </div>
      </main>
    </div>
  )
}

const stepLabels = ['Content Type', 'Details', 'Editor', 'Preview']

function StepBar({ currentStep }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {stepLabels.map((label, i) => {
        const stepNum = i + 1
        const isActive = stepNum === currentStep
        const isDone = stepNum < currentStep
        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && (
              <div className={`w-8 h-px transition-colors ${isDone ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' :
                isDone ? 'bg-blue-500 text-white' :
                'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                {isDone ? '✓' : stepNum}
              </div>
              <span className={`text-xs font-medium hidden sm:inline transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' :
                isDone ? 'text-gray-600 dark:text-gray-300' :
                'text-gray-400'
              }`}>{label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500 rounded-full opacity-[0.06] dark:opacity-[0.08] blur-[80px]" style={{ animation: 'blob-float 20s ease-in-out infinite' }} />
      <div className="absolute top-1/2 -left-20 w-64 h-64 bg-indigo-500 rounded-full opacity-[0.05] dark:opacity-[0.07] blur-[80px]" style={{ animation: 'blob-float 25s ease-in-out infinite reverse' }} />
      <div className="absolute -bottom-10 right-1/3 w-72 h-72 bg-purple-500 rounded-full opacity-[0.04] dark:opacity-[0.06] blur-[80px]" style={{ animation: 'blob-float 22s ease-in-out infinite 5s' }} />
    </div>
  )
}

const statusMap = { completed: 'Completed', in_progress: 'In Progress', draft: 'Draft' }
const typeIconPaths = {
  blog: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  email: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  social: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
  landing: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25',
}
const typeColors = {
  blog: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  email: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  social: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  landing: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
}

export default function Dashboard() {
  usePageTitle('Dashboard — eSmart')
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('create')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ type: '', topic: '', keywords: '', tone: '' })
  const [selectedProject, setSelectedProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [generatedResult, setGeneratedResult] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const { streamedContent, streaming, streamDone, contentId, startStream, cancelStream, resetStream } = useContentStream()

  const fetchProjects = async (silent = false) => {
    setProjectsLoading(true)
    try {
      const res = await api.get('/projects')
      setProjects(res.data)
    } catch {
      if (!silent) showToast('Failed to load projects', 'error')
    } finally {
      setProjectsLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchProjects(true)
  }, [user])

  if (loading) return <DashboardSkeleton />
  if (!user) return <Navigate to="/signin" />

  const resetFlow = () => {
    setStep(1)
    setFormData({ type: '', topic: '', keywords: '', tone: '' })
    setGeneratedResult(null)
    setEditedContent('')
    cancelStream()
    resetStream()
  }

  const handleGenerate = async () => {
    setGenerating(true)
    resetStream()
    try {
      const projectRes = await api.post('/projects', {
        title: formData.topic,
        type: formData.type,
      })

      setStep(3)

      const result = await startStream({
        projectId: projectRes.data.id,
        topic: formData.topic,
        keywords: formData.keywords,
        tone: formData.tone || 'Professional',
        contentType: formData.type,
      })

      setGeneratedResult({
        id: result.id,
        projectId: projectRes.data.id,
        topic: formData.topic,
        keywords: formData.keywords,
        tone: formData.tone || 'Professional',
        contentType: formData.type,
        generatedContent: result.content,
      })
      setEditedContent(result.content)
      fetchProjects()
    } catch {
      showToast('Content generation failed. Please try again.', 'error')
      if (!generatedResult) setStep(2)
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteProject = async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`)
      showToast('Project deleted')
      setDeleteConfirm(null)
      fetchProjects()
    } catch {
      showToast('Failed to delete project', 'error')
    }
  }

  const renderContent = () => {
    if (activeTab === 'projects') {
      if (selectedProject) {
        return <ProjectDetail projectId={selectedProject} onBack={() => setSelectedProject(null)} />
      }

      if (projectsLoading) {
        return (
          <div className="space-y-3 animate-fade-in">
            <SkeletonLine className="w-48 h-6" />
            <SkeletonLine className="w-64 h-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          </div>
        )
      }

      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">My Projects</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Your recently generated content.</p>
          {projects.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No projects yet. Create your first one!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="relative group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                  onClick={() => setSelectedProject(project.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${typeColors[project.type] || 'text-gray-500 bg-gray-50 dark:bg-gray-800'} flex items-center justify-center`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={typeIconPaths[project.type] || 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'} /></svg>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      project.status === 'completed' ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      project.status === 'in_progress' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {statusMap[project.status] || project.status}
                    </span>
                  </div>
                  <h3 className="font-semibold dark:text-white mb-1 line-clamp-2">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
                    <p className="text-xs text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {project.contentCount || 0} piece{project.contentCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(project.id) }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete project"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Delete confirmation */}
          {deleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-2 dark:text-white">Delete Project?</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This will permanently delete the project and all its content. This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:text-white">
                    Cancel
                  </button>
                  <button onClick={() => handleDeleteProject(deleteConfirm)} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 active:scale-95 transition-all">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
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

    // Create flow — steps 1-4
    return (
      <div className="animate-fade-in">
        <StepBar currentStep={step} />

        {/* Step 3: Editor (shows streaming content live) */}
        {step === 3 ? (
          <div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">
              {streaming ? 'Generating Content...' : 'Edit Your Content'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {streaming
                ? 'AI is writing your content in real-time. Watch it appear below.'
                : 'Review and refine the AI-generated content before finalizing.'}
            </p>
            {streaming && (
              <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <svg className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  Streaming tokens... {streamedContent.length} characters received
                </span>
              </div>
            )}
            <textarea
              value={streaming ? streamedContent : editedContent}
              onChange={(e) => { if (!streaming) setEditedContent(e.target.value) }}
              readOnly={streaming}
              rows={18}
              className={`w-full p-5 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white font-mono text-sm leading-relaxed resize-y ${
                streaming
                  ? 'border-blue-300 dark:border-blue-700 animate-pulse'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  cancelStream()
                  setEditedContent(generatedResult?.generatedContent || '')
                  setStep(2)
                }}
                disabled={streaming}
                className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium dark:text-white disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={streaming}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save & Preview
              </button>
            </div>
          </div>
        ) : step === 4 && generatedResult ? (
          /* Step 4: Preview */
          <ContentResult
            result={{ ...generatedResult, generatedContent: editedContent }}
            formData={formData}
            onReset={resetFlow}
            onBackToEditor={() => setStep(3)}
          />
        ) : (
          /* Steps 1 & 2 */
          <ContentForm
            step={step}
            formData={formData}
            setFormData={setFormData}
            onNext={() => setStep(step + 1)}
            onBack={() => setStep(step - 1)}
            onGenerate={handleGenerate}
            generating={generating}
          />
        )}
      </div>
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
            if (tab === 'projects') fetchProjects()
          }}
        />
        <main className="relative flex-1 p-10 bg-gray-50 dark:bg-gray-900 overflow-auto">
          <BackgroundBlobs />
          <div className="relative max-w-3xl">
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
