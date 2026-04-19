import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const components = {
  h1: (props) => <h1 className="text-3xl font-bold mt-6 mb-4 dark:text-white" {...props} />,
  h2: (props) => <h2 className="text-2xl font-bold mt-6 mb-3 dark:text-white" {...props} />,
  h3: (props) => <h3 className="text-xl font-semibold mt-5 mb-2 dark:text-white" {...props} />,
  h4: (props) => <h4 className="text-lg font-semibold mt-4 mb-2 dark:text-white" {...props} />,
  p: (props) => <p className="my-3 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />,
  strong: (props) => <strong className="font-semibold text-gray-900 dark:text-white" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  a: (props) => (
    <a
      className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  ul: (props) => <ul className="list-disc pl-6 my-3 space-y-1.5 text-gray-700 dark:text-gray-300" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 my-3 space-y-1.5 text-gray-700 dark:text-gray-300" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-blue-500/60 pl-4 my-4 italic text-gray-600 dark:text-gray-400"
      {...props}
    />
  ),
  hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
  code: ({ className, children, ...props }) => {
    const isBlock = typeof className === 'string' && className.startsWith('language-')
    return isBlock ? (
      <code className={`${className} font-mono`} {...props}>
        {children}
      </code>
    ) : (
      <code
        className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 text-pink-600 dark:text-pink-400 text-[0.9em] font-mono"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: (props) => (
    <pre
      className="my-4 p-4 rounded-xl bg-gray-900 dark:bg-black text-gray-100 overflow-x-auto text-sm leading-relaxed"
      {...props}
    />
  ),
  table: (props) => (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left font-semibold bg-gray-50 dark:bg-gray-800 dark:text-white"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 dark:text-gray-300" {...props} />
  ),
}

// Some LLMs wrap the entire document in ```markdown ... ``` despite being
// told not to. If we render that as-is, react-markdown treats the whole
// thing as a single code block. Strip the wrapping fences defensively so
// downstream views never have to worry about it.
function stripWrappingFences(input) {
  if (typeof input !== 'string') return input || ''
  const trimmed = input.trim()
  if (!trimmed.startsWith('```')) return input
  const newlineIdx = trimmed.indexOf('\n')
  if (newlineIdx === -1) return input
  let body = trimmed.slice(newlineIdx + 1)
  const closing = body.lastIndexOf('```')
  if (closing !== -1) {
    body = body.slice(0, closing)
  }
  return body.trimEnd()
}

export default function Markdown({ children, className = '' }) {
  const safe = stripWrappingFences(children)
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {safe}
      </ReactMarkdown>
    </div>
  )
}
