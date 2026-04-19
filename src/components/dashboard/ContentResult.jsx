import { useToast } from '../../stores/toast'
import Markdown from '../Markdown'

export default function ContentResult({ result, formData, onReset, onBackToEditor }) {
  const { showToast } = useToast()
  const content = result.generatedContent || ''
  const title = result.topic || formData.topic

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    showToast('Content copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
    showToast('File downloaded!')
  }

  const s3Url = result.s3Url
  const meta = result.meta

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-3xl font-bold dark:text-white tracking-tight">{title}</h2>
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wider">
            {result.contentType || formData.type}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium">
            {result.tone || formData.tone || 'Professional'}
          </span>
          {result.keywords && (
            <span className="text-gray-400 dark:text-gray-500 text-xs truncate max-w-md">
              · {result.keywords}
            </span>
          )}
        </div>
      </div>

      {meta && (meta.title || meta.description) && (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-900/20 dark:via-gray-800 dark:to-blue-900/20 rounded-2xl p-5 border border-purple-100 dark:border-purple-800/40">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-2">Meta Agent Output</p>
          {meta.title && <p className="text-base font-semibold dark:text-white mb-1.5 leading-snug">{meta.title}</p>}
          {meta.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">{meta.description}</p>}
          {meta.social && (
            <div className="mt-3 pt-3 border-t border-purple-100/60 dark:border-purple-800/30">
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600/80 dark:text-purple-400/80 mb-1">Social copy</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed">"{meta.social}"</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 lg:p-10 border border-gray-100 dark:border-gray-700 shadow-sm">
        <Markdown>{content}</Markdown>
      </div>

      <div className="flex flex-wrap items-center gap-2 sticky bottom-0 -mx-1 px-1 py-3 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl">
        {onBackToEditor && (
          <button onClick={onBackToEditor} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm dark:text-gray-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
            Edit
          </button>
        )}
        <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm dark:text-gray-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
          Copy
        </button>
        <button onClick={handleDownload} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm dark:text-gray-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          Download
        </button>
        {s3Url && (
          <a href={s3Url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 active:scale-95 transition-all font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            S3 Link
          </a>
        )}
        <div className="flex-1" />
        <button onClick={onReset} className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all font-semibold text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.25} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create Another
        </button>
      </div>
    </div>
  )
}
