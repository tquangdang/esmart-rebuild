import { useToast } from '../../stores/toast'

const mockResults = {
  blog: {
    title: 'The Future of AI in Digital Marketing',
    seoScore: 87,
    content: `Artificial intelligence is revolutionizing how businesses approach digital marketing. From automated content creation to predictive analytics, AI tools are enabling companies of all sizes to compete more effectively in the digital landscape.

## Key Benefits of AI Marketing

**1. Personalized Customer Experiences**
AI analyzes user behavior patterns to deliver tailored content and product recommendations, increasing engagement and conversion rates by up to 40%.

**2. Data-Driven Decision Making**
Machine learning algorithms process vast amounts of marketing data to identify trends and optimize campaigns in real-time, eliminating guesswork.

**3. Scalable Content Production**
AI-powered writing assistants can generate SEO-optimized blog posts, social media content, and email campaigns at scale while maintaining brand voice consistency.

## Getting Started
The key to successful AI adoption is starting small — pick one area of your marketing workflow and test an AI solution before scaling across your entire strategy.`,
  },
  social: {
    title: 'Engaging Social Post',
    seoScore: 72,
    content: `🚀 Ready to 10x your marketing results?\n\nAI isn't just for big corporations anymore. Small businesses are using AI-powered tools to:\n\n✅ Create scroll-stopping content in minutes\n✅ Analyze what your audience actually wants\n✅ Automate repetitive marketing tasks\n✅ Personalize customer experiences at scale\n\nThe future of marketing is here — and it's more accessible than you think.\n\n💡 What's one marketing task you wish AI could handle for you? Drop it in the comments!\n\n#AIMarketing #DigitalStrategy #SmallBusiness #MarketingTips`,
  },
  email: {
    title: 'Newsletter: AI Marketing Insights',
    seoScore: 91,
    content: `Subject: 3 AI Marketing Strategies You Can Implement Today\n\nHi [First Name],\n\nThe marketing landscape is evolving faster than ever, and businesses that leverage AI are seeing remarkable results.\n\nHere are 3 strategies you can start using right now:\n\n**Strategy 1: Smart Content Repurposing**\nTurn one blog post into 10 social media posts, 3 email snippets, and a video script using AI writing tools.\n\n**Strategy 2: Predictive Audience Targeting**\nUse AI analytics to identify your most profitable customer segments and tailor your messaging accordingly.\n\n**Strategy 3: Automated A/B Testing**\nLet AI continuously test and optimize your ad copy, email subject lines, and landing page elements.\n\nReady to get started? Reply to this email and we'll set up a free strategy session.\n\nBest,\nThe eSmart Team`,
  },
  landing: {
    title: 'AI-Powered Marketing Platform',
    seoScore: 84,
    content: `# Transform Your Marketing with AI\n\n## Stop Guessing. Start Growing.\n\nJoin 10,000+ businesses using eSmart to create high-converting content in minutes, not hours.\n\n### What You Get:\n- **AI Content Generator** — Blog posts, social media, emails, and more\n- **SEO Optimizer** — Real-time keyword suggestions and readability scoring\n- **Analytics Dashboard** — Track performance across all channels\n- **Brand Voice AI** — Content that sounds like you, every time\n\n### Trusted by Industry Leaders\n"eSmart cut our content production time by 80% while doubling our organic traffic." — Sarah J., CEO\n\n### Pricing\n**Starter** — $29/mo — 50 AI generations, basic analytics\n**Pro** — $79/mo — Unlimited generations, full analytics suite\n**Enterprise** — Custom — Dedicated support, API access\n\n[Get Started Free →]`,
  },
}

function SeoScore({ score }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-[68px] h-[68px]">
        <svg width="68" height="68" className="-rotate-90">
          <circle cx="34" cy="34" r={radius} fill="none" stroke="currentColor" strokeWidth="5" className="text-gray-200 dark:text-gray-700" />
          <circle cx="34" cy="34" r={radius} fill="none" stroke={color} strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold dark:text-white">{score}</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">SEO Score</p>
        <p className="text-xs text-gray-400">{score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}</p>
      </div>
    </div>
  )
}

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

export default function ContentResult({ formData, onReset }) {
  const result = mockResults[formData.type] || mockResults.blog
  const { showToast } = useToast()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.content)
    showToast('Content copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([result.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.title.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast('File downloaded!')
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">{result.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Topic: {formData.topic} · Tone: {formData.tone || 'Professional'}
          </p>
        </div>
        <SeoScore score={result.seoScore} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-gray-700 leading-relaxed border border-gray-100 dark:border-gray-700 shadow-sm">
        {renderFormatted(result.content)}
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <button onClick={handleCopy} className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm dark:text-gray-300">
          📋 Copy
        </button>
        <button onClick={handleDownload} className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm dark:text-gray-300">
          📥 Download
        </button>
        <button className="px-5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all font-medium text-sm dark:text-gray-300">
          ✏️ Edit
        </button>
        <div className="flex-1" />
        <button onClick={onReset} className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all font-medium text-sm">
          + Create Another
        </button>
      </div>
    </div>
  )
}
