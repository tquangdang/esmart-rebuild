import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import FadeIn from '../components/FadeIn'
import { posts } from '../data/posts'
import usePageTitle from '../hooks/usePageTitle'
import { IconRobot, IconChart, IconSearch, IconGlobe, IconCode, IconLightBulb } from '../components/Icons'

const categoryConfig = {
  'AI & Marketing': { gradient: 'from-blue-500/20 to-indigo-500/20 dark:from-blue-500/10 dark:to-indigo-500/10', icon: IconRobot, iconColor: 'text-blue-500' },
  'SEO': { gradient: 'from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10', icon: IconSearch, iconColor: 'text-purple-500' },
  'Email Marketing': { gradient: 'from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10', icon: IconChart, iconColor: 'text-emerald-500' },
  'Social Media': { gradient: 'from-orange-500/20 to-amber-500/20 dark:from-orange-500/10 dark:to-amber-500/10', icon: IconCode, iconColor: 'text-orange-500' },
  'AI & Branding': { gradient: 'from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/10 dark:to-blue-500/10', icon: IconLightBulb, iconColor: 'text-cyan-500' },
  'Analytics': { gradient: 'from-rose-500/20 to-pink-500/20 dark:from-rose-500/10 dark:to-pink-500/10', icon: IconGlobe, iconColor: 'text-rose-500' },
}

const defaultConfig = { gradient: 'from-gray-500/20 to-slate-500/20 dark:from-gray-500/10 dark:to-slate-500/10', icon: IconGlobe, iconColor: 'text-gray-500' }

function getCategoryConfig(cat) {
  return categoryConfig[cat] || defaultConfig
}

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

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div className="animate-page-in">
      {/* Hero */}
      <section className="hero-pattern hero-glow py-36 px-6 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8 text-sm text-emerald-200">
            Insights & Updates
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">Blog</h1>
          <p className="text-xl text-emerald-200/80 max-w-2xl mx-auto">Insights on AI, marketing, and growing your business.</p>
        </FadeIn>
      </section>

      <section className="py-24 px-6 max-w-6xl mx-auto">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-14 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured post */}
        {featured && (
          <FadeIn>
            <Link to={`/blog/${featured.id}`} className="group block mb-12">
              <article className="grid grid-cols-1 md:grid-cols-2 gap-8 border border-gray-100 dark:border-gray-700/50 rounded-2xl overflow-hidden bg-white dark:bg-gray-800/50 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className={`h-64 md:h-auto bg-gradient-to-br ${getCategoryConfig(featured.category).gradient} flex items-center justify-center`}>
                  {(() => { const Icon = getCategoryConfig(featured.category).icon; return <Icon className={`w-20 h-20 ${getCategoryConfig(featured.category).iconColor} opacity-40 group-hover:scale-110 transition-transform duration-300`} /> })()}
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">{featured.category}</span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-white">{featured.title}</h2>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{featured.excerpt}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{featured.date}</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read More
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          </FadeIn>
        )}

        {/* Post grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((post, i) => {
            const config = getCategoryConfig(post.category)
            const Icon = config.icon
            return (
              <FadeIn key={post.id} delay={i * 100}>
                <Link to={`/blog/${post.id}`} className="group block h-full">
                  <article className="border border-gray-100 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800/50 h-full flex flex-col">
                    <div className={`h-44 bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                      <Icon className={`w-12 h-12 ${config.iconColor} opacity-30 group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{post.category}</span>
                      <h3 className="text-lg font-bold mt-2 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors dark:text-white leading-snug">{post.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm flex-1 leading-relaxed">{post.excerpt}</p>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                        <span className="text-xs text-gray-400">{post.date}</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Read
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </FadeIn>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">No posts in this category yet.</p>
        )}
      </section>
    </div>
  )
}
