import { useState } from 'react'
import api from '../../config/api'
import { useToast } from '../../stores/toast'
import Markdown from '../Markdown'

export default function ContentEditor({ content, contentId, onSave, onBack }) {
  const [text, setText] = useState(content)
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState('preview')
  const { showToast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put(`/content/${contentId}`, { generatedContent: text })
      showToast('Content saved!')
      onSave(text)
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold dark:text-white tracking-tight">Edit Content</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Review the rendered preview, switch to Edit to tweak markdown directly.
          </p>
        </div>
        <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl shrink-0">
          <button
            onClick={() => setMode('preview')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              mode === 'preview'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            Preview
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

      {mode === 'edit' ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={22}
          className="w-full p-5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 dark:text-white font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 resize-y shadow-sm"
        />
      ) : (
        <div className="min-h-[32rem] p-8 lg:p-10 border border-gray-100 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
          <Markdown>{text}</Markdown>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
        <span className="text-xs text-gray-400 tabular-nums">
          {text.length.toLocaleString()} characters · {text.split(/\s+/).filter(Boolean).length.toLocaleString()} words
        </span>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition font-medium text-sm dark:text-white"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                Save &amp; Preview
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.25} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
