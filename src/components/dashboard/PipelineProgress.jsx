import { useState } from 'react'

const STEP_META = [
  { key: 'research', label: 'Research Agent', short: 'Research', sub: 'Gemini analyzes the topic and builds a brief' },
  { key: 'writer', label: 'Writer Agent', short: 'Writer', sub: 'DeepSeek drafts the full content' },
  { key: 'seo', label: 'SEO Agent', short: 'SEO', sub: 'Local analyzer scores the draft' },
  { key: 'editor', label: 'Editor Agent', short: 'Editor', sub: 'Claude polishes based on SEO findings' },
  { key: 'meta', label: 'Meta Agent', short: 'Meta', sub: 'DeepSeek generates title, description and social copy' },
]

function StatusBadge({ status }) {
  const map = {
    pending: { color: 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500', label: 'Waiting' },
    running: { color: 'text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300', label: 'Running' },
    done: { color: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300', label: 'Done' },
    skipped: { color: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400', label: 'Skipped' },
    cache: { color: 'text-purple-700 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300', label: 'Cached' },
    error: { color: 'text-red-700 bg-red-100 dark:bg-red-900/40 dark:text-red-300', label: 'Error' },
  }
  const m = map[status] || map.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${m.color}`}>
      {status === 'running' && (
        <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {m.label}
    </span>
  )
}

function StepIcon({ status }) {
  const base = 'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0'
  if (status === 'done') {
    return (
      <div className={`${base} bg-emerald-500 text-white shadow-md shadow-emerald-500/30`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    )
  }
  if (status === 'cache') {
    return (
      <div className={`${base} bg-purple-500 text-white shadow-md shadow-purple-500/30`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    )
  }
  if (status === 'skipped') {
    return (
      <div className={`${base} bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400`}>—</div>
    )
  }
  if (status === 'error') {
    return (
      <div className={`${base} bg-red-500 text-white`}>!</div>
    )
  }
  if (status === 'running') {
    return (
      <div className={`${base} bg-blue-600 text-white shadow-md shadow-blue-500/30`}>
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }
  return <div className={`${base} bg-gray-200 dark:bg-gray-700 text-gray-400`}>·</div>
}

function StepDetail({ step, state }) {
  if (!state) return null
  if (step === 'research' && state.data) {
    const d = state.data
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
        {d.angle && <p><span className="font-semibold text-gray-600 dark:text-gray-300">Angle:</span> {d.angle}</p>}
        {Array.isArray(d.trendingKeywords) && d.trendingKeywords.length > 0 && (
          <p><span className="font-semibold text-gray-600 dark:text-gray-300">Trending:</span> {d.trendingKeywords.slice(0, 6).join(', ')}</p>
        )}
      </div>
    )
  }
  if (step === 'seo' && state.data) {
    const d = state.data
    const score = d.score ?? 0
    const color = score >= 85 ? 'text-emerald-600 dark:text-emerald-400' : score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
    return (
      <div className="text-xs mt-1 space-y-1">
        <p className={`font-bold ${color}`}>Score: {score}/100 · {d.wordCount || 0} words · {d.headingCount || 0} headings</p>
        {Array.isArray(d.issues) && d.issues.length > 0 && (
          <ul className="text-gray-500 dark:text-gray-400 space-y-0.5 pl-3 list-disc">
            {d.issues.slice(0, 3).map((iss, i) => (
              <li key={i}>{iss.suggestion}</li>
            ))}
          </ul>
        )}
      </div>
    )
  }
  if (step === 'meta' && state.data) {
    const d = state.data
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
        {d.title && <p><span className="font-semibold text-gray-600 dark:text-gray-300">Title:</span> {d.title}</p>}
        {d.description && <p className="line-clamp-2"><span className="font-semibold text-gray-600 dark:text-gray-300">Meta:</span> {d.description}</p>}
      </div>
    )
  }
  if (state.message) {
    return <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{state.message}</p>
  }
  return null
}

export default function PipelineProgress({ steps }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">Agent Pipeline</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Five specialized agents collaborating in real time</p>
        </div>
      </div>
      <ol className="space-y-3">
        {STEP_META.map(({ key, label, sub }, idx) => {
          const state = steps[key] || { status: 'pending' }
          const isLast = idx === STEP_META.length - 1
          return (
            <li key={key} className="relative flex gap-3">
              {!isLast && (
                <div className="absolute left-[13px] top-7 bottom-[-12px] w-px bg-gray-200 dark:bg-gray-700" />
              )}
              <StepIcon status={state.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
                  <StatusBadge status={state.status} />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</p>
                <StepDetail step={key} state={state} />
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// PipelineSummary is a compact, collapsible recap shown above the editor and
// preview after generation completes. Click anywhere on the header to expand
// into the full PipelineProgress view.
export function PipelineSummary({ steps }) {
  const [open, setOpen] = useState(false)

  const counts = STEP_META.reduce(
    (acc, { key }) => {
      const s = steps[key]?.status || 'pending'
      if (s === 'done') acc.done++
      else if (s === 'cache') acc.cache++
      else if (s === 'skipped') acc.skipped++
      else if (s === 'error') acc.error++
      return acc
    },
    { done: 0, cache: 0, skipped: 0, error: 0 },
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
          <div className="min-w-0 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">Agent Pipeline</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {counts.done} done
              {counts.cache > 0 && ` · ${counts.cache} cached`}
              {counts.skipped > 0 && ` · ${counts.skipped} skipped`}
              {counts.error > 0 && ` · ${counts.error} error${counts.error > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            {STEP_META.map(({ key, short }) => {
              const status = steps[key]?.status || 'pending'
              const dotColor =
                status === 'done' ? 'bg-emerald-500' :
                status === 'cache' ? 'bg-purple-500' :
                status === 'running' ? 'bg-blue-500 animate-pulse' :
                status === 'skipped' ? 'bg-gray-300 dark:bg-gray-600' :
                status === 'error' ? 'bg-red-500' :
                'bg-gray-200 dark:bg-gray-700'
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400"
                  title={`${short}: ${status}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  {short}
                </span>
              )
            })}
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700/60 px-5 py-4">
          <ol className="space-y-3">
            {STEP_META.map(({ key, label, sub }, idx) => {
              const state = steps[key] || { status: 'pending' }
              const isLast = idx === STEP_META.length - 1
              return (
                <li key={key} className="relative flex gap-3">
                  {!isLast && (
                    <div className="absolute left-[13px] top-7 bottom-[-12px] w-px bg-gray-200 dark:bg-gray-700" />
                  )}
                  <StepIcon status={state.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
                      <StatusBadge status={state.status} />
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</p>
                    <StepDetail step={key} state={state} />
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}
