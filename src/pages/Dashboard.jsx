import { useState, useEffect } from 'react'
import { useAuth } from '../stores/auth'
import { Navigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import DashboardNav from '../components/dashboard/DashboardNav'
import ContentForm from '../components/dashboard/ContentForm'
import ContentEditor from '../components/dashboard/ContentEditor'
import ContentResult from '../components/dashboard/ContentResult'
import ProjectDetail from '../components/dashboard/ProjectDetail'
import PipelineProgress from '../components/dashboard/PipelineProgress'
import Markdown from '../components/Markdown'
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

const statusMap = { finished: 'Finished', in_progress: 'In Progress', draft: 'Draft' }
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
const typeAccents = {
  blog: 'from-blue-500 to-cyan-500',
  email: 'from-purple-500 to-pink-500',
  social: 'from-emerald-500 to-teal-500',
  landing: 'from-orange-500 to-amber-500',
}
const typeLabels = {
  blog: 'Blog',
  email: 'Email',
  social: 'Social',
  landing: 'Landing',
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
  const [projectFilter, setProjectFilter] = useState('all')
  const [projectSearch, setProjectSearch] = useState('')
  const { streamedContent, streaming, streamDone, contentId, agentSteps, startStream, cancelStream, resetStream } = useContentStream()

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
    const topic = formData.topic?.trim()
    const keywords = formData.keywords?.trim()
    const type = formData.type

    const missing = []
    if (!type) missing.push('content type')
    if (!topic) missing.push('topic')
    if (!keywords) missing.push('keywords')

    if (missing.length > 0) {
      showToast(`Please fill in: ${missing.join(', ')}`, 'error')
      return
    }

    setGenerating(true)
    resetStream()

    let createdProjectId = null
    try {
      const projectRes = await api.post('/projects', {
        title: topic,
        type,
      })
      createdProjectId = projectRes.data.id

      setStep(3)

      const jobRes = await api.post('/jobs', {
        projectId: createdProjectId,
        topic,
        keywords,
        tone: formData.tone || 'Professional',
        contentType: type,
      })

      const result = await startStream(null, { jobId: jobRes.data.jobId })

      setGeneratedResult({
        id: result.id,
        projectId: createdProjectId,
        topic,
        keywords,
        tone: formData.tone || 'Professional',
        contentType: type,
        generatedContent: result.content,
        meta: result.meta || null,
        s3Url: result.s3Url || null,
      })
      setEditedContent(result.content)
      fetchProjects()
    } catch (err) {
      console.error('Generation failed:', err)
      const detail = err?.response?.data?.error || err?.message || 'Unknown error'
      showToast(`Content generation failed: ${detail}`, 'error')

      // Rollback: delete the orphan project if it was created before generation failed
      if (createdProjectId) {
        try {
          await api.delete(`/projects/${createdProjectId}`)
        } catch (cleanupErr) {
          console.error('Failed to clean up orphan project:', cleanupErr)
        }
      }

      if (!generatedResult) setStep(2)
    } finally {
      setGenerating(false)
    }
  }

  const toggleProjectStatus = async (e, project) => {
    e.stopPropagation()
    const newStatus = project.status === 'finished' ? 'in_progress' : 'finished'
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p)))
    try {
      await api.patch(`/projects/${project.id}/status`, { status: newStatus })
      showToast(newStatus === 'finished' ? 'Project marked as finished' : 'Project reopened')
    } catch {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: project.status } : p)))
      showToast('Failed to update status', 'error')
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

      const totalCount = projects.length
      const inProgressCount = projects.filter((p) => p.status !== 'finished').length
      const finishedCount = projects.filter((p) => p.status === 'finished').length
      const totalPieces = projects.reduce((sum, p) => sum + (p.contentCount || 0), 0)

      const search = projectSearch.trim().toLowerCase()
      const filteredProjects = projects.filter((p) => {
        if (projectFilter === 'in_progress' && p.status === 'finished') return false
        if (projectFilter === 'finished' && p.status !== 'finished') return false
        if (search && !(p.title || '').toLowerCase().includes(search)) return false
        return true
      })

      const filterTabs = [
        { key: 'all', label: 'All', count: totalCount },
        { key: 'in_progress', label: 'In Progress', count: inProgressCount },
        { key: 'finished', label: 'Finished', count: finishedCount },
      ]

      return (
        <div className="animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight dark:text-white">My Projects</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and revisit everything you've generated.</p>
            </div>
            <button
              onClick={() => { setActiveTab('create'); resetFlow() }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              New Project
            </button>
          </div>

          {/* Stats */}
          {totalCount > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total', value: totalCount, accent: 'from-gray-500/10 to-gray-500/5 text-gray-700 dark:text-gray-200' },
                { label: 'In Progress', value: inProgressCount, accent: 'from-blue-500/10 to-blue-500/5 text-blue-700 dark:text-blue-300' },
                { label: 'Finished', value: finishedCount, accent: 'from-emerald-500/10 to-emerald-500/5 text-emerald-700 dark:text-emerald-300' },
                { label: 'Content Pieces', value: totalPieces, accent: 'from-purple-500/10 to-purple-500/5 text-purple-700 dark:text-purple-300' },
              ].map((stat) => (
                <div key={stat.label} className={`relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-gradient-to-br ${stat.accent} bg-white dark:bg-gray-800/50 p-4`}>
                  <p className="text-[11px] uppercase tracking-wider font-semibold opacity-70">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filter + search */}
          {totalCount > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-1 shadow-sm">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setProjectFilter(tab.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      projectFilter === tab.key
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 text-[10px] tabular-nums ${projectFilter === tab.key ? 'opacity-90' : 'opacity-60'}`}>{tab.count}</span>
                  </button>
                ))}
              </div>
              <div className="relative flex-1 max-w-xs">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                </svg>
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition dark:text-white placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          {/* Empty state */}
          {totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-5">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
              <h3 className="text-lg font-bold dark:text-white mb-1">No projects yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">Kick off your first AI-powered project and it will show up here.</p>
              <button
                onClick={() => { setActiveTab('create'); resetFlow() }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all"
              >
                Create your first project
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 text-sm text-gray-400">
              <p>No projects match your filters.</p>
              <button
                onClick={() => { setProjectFilter('all'); setProjectSearch('') }}
                className="mt-3 text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const isFinished = project.status === 'finished'
                const accent = typeAccents[project.type] || 'from-gray-400 to-gray-500'
                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/5 dark:hover:shadow-black/30 hover:border-gray-200 dark:hover:border-gray-600"
                  >
                    {/* Top accent stripe */}
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent} opacity-80`} />
                    {/* Subtle hover glow */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 pointer-events-none`} />

                    <div className="relative flex items-start justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl ${typeColors[project.type] || 'text-gray-500 bg-gray-50 dark:bg-gray-700'} flex items-center justify-center shrink-0`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={typeIconPaths[project.type] || 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'} /></svg>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          {typeLabels[project.type] || project.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleProjectStatus(e, project)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold pl-2 pr-2.5 py-1 rounded-full ring-1 transition hover:opacity-90 active:scale-95 ${
                            isFinished
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-emerald-200/60 dark:ring-emerald-800/40'
                              : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-blue-200/60 dark:ring-blue-800/40'
                          }`}
                        >
                          {isFinished ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <span className="relative flex w-1.5 h-1.5">
                              <span className="absolute inline-flex w-full h-full rounded-full bg-blue-500 opacity-75 animate-ping" />
                              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-blue-500" />
                            </span>
                          )}
                          {isFinished ? 'Finished' : 'In Progress'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(project.id) }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete project"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <h3 className="relative font-semibold text-base dark:text-white mb-1.5 line-clamp-2 leading-snug">
                      {project.title}
                    </h3>
                    <p className="relative text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                      {project.description || 'No description provided.'}
                    </p>

                    <div className="relative flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/60">
                      <div className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0V11.25A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="tabular-nums">{project.contentCount || 0}</span>
                        <span className="text-gray-400">{project.contentCount === 1 ? 'piece' : 'pieces'}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
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

        {/* Step 3: Editor — streaming view while tokens arrive, then ContentEditor */}
        {step === 3 ? (
          streaming || !streamDone ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">Generating Content</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                    A team of AI agents is collaborating on your content. Watch each step in real time.
                  </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/60 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/60">
                  <svg className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    {streamedContent.length > 0
                      ? `Streaming draft · ${streamedContent.length.toLocaleString()} chars`
                      : 'Pipeline running...'}
                  </span>
                </div>
                <div className="relative min-h-[24rem] max-h-[36rem] overflow-y-auto p-7 border border-blue-200 dark:border-blue-800/60 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                  {streamedContent.length > 0 ? (
                    <>
                      <Markdown>{streamedContent}</Markdown>
                      <span className="inline-block w-2 h-4 align-text-bottom bg-blue-500 animate-pulse ml-0.5" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[20rem] text-center">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-4">
                        <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Researching your topic...</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Draft will appear here as soon as the writer starts.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-6">
                  <PipelineProgress steps={agentSteps} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <ContentEditor
                  content={editedContent}
                  contentId={contentId || generatedResult?.id}
                  onSave={(savedText) => {
                    setEditedContent(savedText)
                    setGeneratedResult((prev) => prev ? { ...prev, generatedContent: savedText } : prev)
                    setStep(4)
                  }}
                  onBack={() => {
                    cancelStream()
                    setStep(2)
                  }}
                />
              </div>
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-6">
                  <PipelineProgress steps={agentSteps} />
                </div>
              </div>
            </div>
          )
        ) : step === 4 && generatedResult ? (
          /* Step 4: Preview */
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <ContentResult
                result={{ ...generatedResult, generatedContent: editedContent }}
                formData={formData}
                onReset={resetFlow}
                onBackToEditor={() => setStep(3)}
              />
            </div>
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-6">
                <PipelineProgress steps={agentSteps} />
              </div>
            </div>
          </div>
        ) : (
          /* Steps 1 & 2 */
          <div className="max-w-3xl">
            <ContentForm
              step={step}
              formData={formData}
              setFormData={setFormData}
              onNext={() => setStep(step + 1)}
              onBack={() => setStep(step - 1)}
              onGenerate={handleGenerate}
              generating={generating}
            />
          </div>
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
        <main className="relative flex-1 p-6 sm:p-8 lg:p-10 bg-gray-50 dark:bg-gray-900 overflow-auto">
          <BackgroundBlobs />
          <div className={`relative mx-auto ${
            activeTab === 'projects' && !selectedProject
              ? 'max-w-7xl'
              : activeTab === 'create' && step >= 3
                ? 'max-w-7xl'
                : 'max-w-4xl'
          }`}>
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
