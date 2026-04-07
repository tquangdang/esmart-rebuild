import { useToast } from '../../stores/toast'

function renderFormatted(text) {
  return text.split('\n\n').map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mt-6 mb-3 dark:text-white">{trimmed.slice(2)}</h1>
    if (trimmed.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-5 mb-2 dark:text-white">{trimmed.slice(3)}</h2>
    if (trimmed.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 dark:text-white">{trimmed.slice(4)}</h3>
    if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter((l) => l.startsWith('- '))
      return (
        <ul key={i} className="space-y-1.5 my-3">
          {items.map((item, j) => {
            const parts = item.slice(2).split(/\*\*(.*?)\*\*/)
            return (
              <li key={j} className="flex gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="dark:text-gray-300">{parts.map((p, k) => k % 2 === 1 ? <strong key={k} className="dark:text-white">{p}</strong> : p)}</span>
              </li>
            )
          })}
        </ul>
      )
    }
    const parts = trimmed.split(/\*\*(.*?)\*\*/)
    const rendered = parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="dark:text-white">{p}</strong> : p)
    return <p key={i} className="my-2 leading-relaxed dark:text-gray-300">{rendered}</p>
  })
}

export default function ContentResult({ result, formData, onReset, onBackToEditor }) {
  const { showToast } = useToast()
  const content = result.generatedContent || ''
  const title = result.topic || formData.topic

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    showToast('Content copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast('File downloaded!')
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Type: {result.contentType || formData.type} · Tone: {result.tone || formData.tone || 'Professional'}
          {result.keywords && ` · Keywords: ${result.keywords}`}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-gray-700 leading-relaxed border border-gray-100 dark:border-gray-700 shadow-sm">
        {renderFormatted(content)}
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        {onBackToEditor && (
          <button onClick={onBackToEditor} className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm dark:text-gray-300">
            <svg className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
            Edit
          </button>
        )}
        <button onClick={handleCopy} className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm dark:text-gray-300">
          <svg className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
          Copy
        </button>
        <button onClick={handleDownload} className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm dark:text-gray-300">
          <svg className="w-4 h-4 inline-block mr-1.5 -mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          Download
        </button>
        <div className="flex-1" />
        <button onClick={onReset} className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all font-medium text-sm">
          + Create Another
        </button>
      </div>
    </div>
  )
}
