import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FadeIn from '../components/FadeIn'
import { posts } from '../data/posts'
import usePageTitle from '../hooks/usePageTitle'

export default function Blog() {
  usePageTitle('Blog — eSmart')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = useMemo(
    () => ['All', ...new Set(posts.map((p) => p.category))],
    []
  )

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === activeCategory)

  return (
    <div className="animate-page-in">
      <section className="py-32 px-6 bg-gradient-to-br from-emerald-900 to-teal-800 text-white text-center">
        <FadeIn>
          <h1 className="text-5xl font-bold mb-6">Blog</h1>
          <p className="text-xl text-emerald-100">Insights on AI, marketing, and growing your business.</p>
        </FadeIn>
      </section>

      <section className="py-20 px-6 max-w-6xl mx-auto">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                activeCategory === cat
                  ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((post, i) => (
            <FadeIn key={post.id} delay={i * 100}>
              <Link to={`/blog/${post.id}`} className="group block h-full">
                <article className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800 h-full flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                    <span className="text-5xl opacity-30 group-hover:scale-110 transition-transform duration-300">📝</span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{post.category}</span>
                    <h3 className="text-xl font-bold mt-2 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-white">{post.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm flex-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 dark:border-gray-700">
                      <span className="text-xs text-gray-400">{post.date}</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                        Read More &rarr;
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">No posts in this category yet.</p>
        )}
      </section>
    </div>
  )
}
