import { useParams, Link } from 'react-router-dom'
import { posts } from '../data/posts'
import FadeIn from '../components/FadeIn'
import usePageTitle from '../hooks/usePageTitle'

function renderMarkdown(text) {
  return text.split('\n\n').map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null
    if (trimmed.startsWith('## '))
      return <h2 key={i} className="text-2xl font-bold mt-8 mb-3 dark:text-white">{trimmed.slice(3)}</h2>
    if (trimmed.startsWith('**') && trimmed.endsWith('**'))
      return <p key={i} className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-1">{trimmed.slice(2, -2)}</p>
    const parts = trimmed.split(/\*\*(.*?)\*\*/)
    const rendered = parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)
    if (trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter((l) => l.startsWith('- '))
      return <ul key={i} className="list-disc list-inside space-y-1 my-3 text-gray-600 dark:text-gray-400">{items.map((item, j) => <li key={j}>{item.slice(2)}</li>)}</ul>
    }
    return <p key={i} className="my-3 leading-relaxed text-gray-600 dark:text-gray-300">{rendered}</p>
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

  return (
    <div className="animate-page-in">
      <section className="py-28 px-6 bg-gradient-to-br from-emerald-900 to-teal-800 text-white text-center">
        <FadeIn>
          <span className="text-sm font-semibold uppercase tracking-wide text-emerald-200">{post.category}</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-6 max-w-3xl mx-auto">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 text-emerald-200 text-sm">
            <span>{post.author}</span><span>·</span><span>{post.date}</span>
          </div>
        </FadeIn>
      </section>

      <article className="py-16 px-6 max-w-3xl mx-auto">
        <FadeIn>
          <div className="prose-lg">{renderMarkdown(post.body)}</div>
        </FadeIn>
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <Link to="/blog" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium transition active:scale-95">&larr; Back to Blog</Link>
          <div className="text-sm text-gray-400">Written by <span className="font-medium text-gray-600 dark:text-gray-300">{post.author}</span></div>
        </div>
      </article>
    </div>
  )
}
