import { useState, useEffect } from 'react'
import api from '../../config/api'
import { useToast } from '../../stores/toast'
import Markdown from '../Markdown'

const statusColors = {
  finished: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  completed: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  published: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  in_progress: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  draft: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  generated: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
}

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

function ContentView({ item, onBack, onUpdated, onDeleted }) {
  const { showToast } = useToast()
  const [mode, setMode] = useState('view')
  const [text, setText] = useState(item.generatedContent || '')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    showToast('Copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(item.topic || 'content').toLowerCase().replace(/\s+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/content/${item.id}`, { generatedContent: text })
      showToast('Saved!')
      onUpdated({ ...item, generatedContent: text })
      setMode('view')
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/content/${item.id}`)
      showToast('Content deleted')
      onDeleted(item.id)
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium mb-6 transition active:scale-95 inline-flex items-center gap-1"
      >
        &larr; Back to Project
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">{item.topic}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {item.contentType}
            {item.tone ? ` · ${item.tone}` : ''}
            {item.keywords ? ` · ${item.keywords}` : ''}
          </p>
        </div>
        <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl shrink-0">
          <button
            onClick={() => setMode('view')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              mode === 'view'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            View
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              mode === 'edit'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Edit
          </button>
        </div>
      </div>

      {mode === 'view' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm min-h-[400px]">
          {text ? <Markdown>{text}</Markdown> : <p className="text-gray-400">No content.</p>}
        </div>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={20}
          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      )}

      <div className="flex flex-wrap gap-3 mt-6">
        <button
          onClick={handleCopy}
          className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm dark:text-gray-300"
        >
          Copy
        </button>
        <button
          onClick={handleDownload}
          className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm dark:text-gray-300"
        >
          Download
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="px-5 py-2 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all font-medium text-sm"
        >
          Delete
        </button>
        <div className="flex-1" />
        {mode === 'edit' && (
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all font-medium text-sm disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2 dark:text-white">Delete Content?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              This will permanently delete this piece of content. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProjectDetail({ projectId, onBack }) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedContentId, setSelectedContentId] = useState(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`)
        setProject(res.data)
      } catch {
        setProject(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [projectId])

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="animate-fade-in">
        <button onClick={onBack} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium mb-6 transition active:scale-95">
          &larr; Back to Projects
        </button>
        <p className="text-gray-400 text-center py-12">Project not found.</p>
      </div>
    )
  }

  const contents = project.Contents || []
  const selectedContent = contents.find((c) => c.id === selectedContentId)

  if (selectedContent) {
    return (
      <ContentView
        item={selectedContent}
        onBack={() => setSelectedContentId(null)}
        onUpdated={(updated) => {
          setProject((prev) => ({
            ...prev,
            Contents: (prev.Contents || []).map((c) => (c.id === updated.id ? updated : c)),
          }))
        }}
        onDeleted={(deletedId) => {
          setProject((prev) => ({
            ...prev,
            Contents: (prev.Contents || []).filter((c) => c.id !== deletedId),
          }))
          setSelectedContentId(null)
        }}
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium mb-6 transition active:scale-95 inline-flex items-center gap-1">
        &larr; Back to Projects
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">{project.title}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {project.type} · Created {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            {project.description && <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{project.description}</p>}
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[project.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
            {project.status}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Content Pieces ({contents.length})</h3>
      <div className="space-y-3">
        {contents.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedContentId(item.id)}
            className="w-full text-left flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-800 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${typeColors[item.contentType] || 'text-gray-500 bg-gray-50 dark:bg-gray-800'} flex items-center justify-center shrink-0`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={typeIconPaths[item.contentType] || typeIconPaths.blog} /></svg>
              </div>
              <div>
                <p className="font-medium dark:text-white">{item.topic}</p>
                <p className="text-xs text-gray-400">
                  {item.contentType} · {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {item.tone && (
                <span className="text-xs text-gray-400 hidden sm:inline">{item.tone}</span>
              )}
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusColors[item.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                {item.status || 'generated'}
              </span>
              <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {contents.length === 0 && <p className="text-gray-400 text-center py-8">No content pieces yet.</p>}
    </div>
  )
}
