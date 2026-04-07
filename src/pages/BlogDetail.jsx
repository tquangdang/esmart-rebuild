import { useParams, Link } from 'react-router-dom'
import { posts } from '../data/posts'
import FadeIn from '../components/FadeIn'
import usePageTitle from '../hooks/usePageTitle'

function estimateReadingTime(text) {
  const words = text.split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

function renderMarkdown(text) {
  return text.split('\n\n').map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null

    if (trimmed.startsWith('### '))
      return <h3 key={i} className="text-xl font-bold mt-8 mb-3 dark:text-white">{trimmed.slice(4)}</h3>
    if (trimmed.startsWith('## '))
      return <h2 key={i} className="text-2xl font-bold mt-10 mb-3 dark:text-white">{trimmed.slice(3)}</h2>
    if (trimmed.startsWith('> '))
      return <blockquote key={i} className="border-l-3 border-blue-500 pl-4 my-6 italic text-gray-500 dark:text-gray-400">{trimmed.slice(2)}</blockquote>
    if (trimmed.startsWith('**') && trimmed.endsWith('**'))
      return <p key={i} className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-1">{trimmed.slice(2, -2)}</p>

    if (trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter((l) => l.startsWith('- '))
      return (
        <ul key={i} className="space-y-2 my-4">
          {items.map((item, j) => (
            <li key={j} className="flex gap-3 text-gray-600 dark:text-gray-400">
              <span className="text-blue-500 mt-1 shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </span>
              {item.slice(2)}
            </li>
          ))}
        </ul>
      )
    }

    const parts = trimmed.split(/\*\*(.*?)\*\*/)
    const rendered = parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-gray-900 dark:text-gray-100">{part}</strong> : part)

    const codeRendered = rendered.map((part, j) => {
      if (typeof part !== 'string') return part
      const codeParts = part.split(/`(.*?)`/)
      return codeParts.map((cp, k) => k % 2 === 1 ? <code key={`${j}-${k}`} className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm">{cp}</code> : cp)
    })

    return <p key={i} className="my-4 leading-relaxed text-gray-600 dark:text-gray-300">{codeRendered}</p>
  })
}

export default function BlogDetail() {
  const { id } = useParams()
  const post = posts.find((p) => p.id === Number(id))

  usePageTitle(post ? `${post.title} — eSmart` : 'Post Not Found — eSmart')

  if (!post) {
    return (
      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 animate-page-in">
        <h1 className="text-4xl font-bold mb-4 dark:text-white">Post Not Found</h1>
        <Link to="/blog" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium">&larr; Back to Blog</Link>
      </section>
    )
  }

  const readingTime = estimateReadingTime(post.body)

  return (
    <div className="animate-page-in">
      {/* Hero */}
      <section className="hero-pattern py-32 px-6 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white text-center">
        <FadeIn>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-400/10 px-3 py-1 rounded-full mb-4">{post.category}</span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-6 max-w-3xl mx-auto leading-tight tracking-tight">{post.title}</h1>
          <div className="flex items-center justify-center gap-3 text-emerald-200/70 text-sm">
            <span>{post.author}</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400/50" />
            <span>{post.date}</span>
            <span className="w-1 h-1 rounded-full bg-emerald-400/50" />
            <span>{readingTime} min read</span>
          </div>
        </FadeIn>
      </section>

      {/* Article */}
      <article className="py-16 px-6 max-w-3xl mx-auto">
        <FadeIn>
          <div className="prose-custom">{renderMarkdown(post.body)}</div>
        </FadeIn>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 my-12">
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          </div>
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        {/* Author card */}
        <FadeIn>
          <div className="flex items-center gap-5 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {post.author[0]}
            </div>
            <div>
              <p className="font-bold dark:text-white">{post.author}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Content Writer at eSmart</p>
            </div>
          </div>
        </FadeIn>

        <div className="mt-8 flex items-center justify-between">
          <Link to="/blog" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium transition active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            Back to Blog
          </Link>
        </div>
      </article>
    </div>
  )
}
