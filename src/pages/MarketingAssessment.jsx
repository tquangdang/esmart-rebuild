import { useState } from 'react'
import { Link } from 'react-router-dom'
import FadeIn from '../components/FadeIn'
import usePageTitle from '../hooks/usePageTitle'

const questions = [
  { question: 'Does your business have a professional website?', options: [{ text: 'Yes, fully optimized and mobile-friendly', score: 3 }, { text: 'Yes, but it needs improvement', score: 1 }, { text: 'No website yet', score: 0 }] },
  { question: 'How active are you on social media?', options: [{ text: 'Very active — we post consistently and engage with followers', score: 3 }, { text: 'Somewhat active — we post occasionally', score: 1 }, { text: 'Not active at all', score: 0 }] },
  { question: 'Do you use email marketing?', options: [{ text: 'Yes, we send regular newsletters and campaigns', score: 3 }, { text: 'Occasionally, but not consistently', score: 1 }, { text: 'Not yet', score: 0 }] },
  { question: 'Have you invested in SEO?', options: [{ text: 'Yes, we have an active SEO strategy', score: 3 }, { text: 'A little — we\'ve done some basic optimization', score: 1 }, { text: 'No, we haven\'t started with SEO', score: 0 }] },
  { question: 'Do you track your marketing analytics?', options: [{ text: 'Yes, we regularly review data and adjust strategy', score: 3 }, { text: 'Sometimes, but not systematically', score: 1 }, { text: 'No, we don\'t track analytics', score: 0 }] },
  { question: 'Do you use paid advertising (Google Ads, social ads)?', options: [{ text: 'Yes, with optimized campaigns and budgets', score: 3 }, { text: 'We\'ve tried it but don\'t do it regularly', score: 1 }, { text: 'No paid advertising', score: 0 }] },
]

function getResult(score) {
  if (score >= 13) return { level: 'Advanced', color: 'text-emerald-600 dark:text-emerald-400', ringColor: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-700', message: 'Your digital marketing is strong! You\'re leveraging multiple channels effectively.', recommendations: ['Focus on advanced analytics and attribution modeling', 'Explore AI-powered content personalization', 'Consider marketing automation to scale further', 'Test emerging platforms and formats (short-form video, podcasts)'] }
  if (score >= 7) return { level: 'Growing', color: 'text-amber-600 dark:text-amber-400', ringColor: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-700', message: 'You\'ve got a solid foundation but there\'s room to grow. Focus on consistency and strategy.', recommendations: ['Create a content calendar and stick to a posting schedule', 'Invest in SEO to boost organic traffic', 'Set up email marketing automation', 'Start tracking KPIs and ROI for each channel'] }
  return { level: 'Beginner', color: 'text-red-600 dark:text-red-400', ringColor: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-700', message: 'You\'re just getting started — and that\'s okay! There\'s huge potential to grow your digital presence.', recommendations: ['Build or improve your business website first', 'Choose 1-2 social media platforms and start posting regularly', 'Set up Google Analytics to start tracking visitors', 'Consider working with a digital marketing agency to jumpstart growth'] }
}

function ScoreRing({ score, maxScore, color }) {
  const pct = score / maxScore
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold dark:text-white">{score}</span>
        <span className="text-xs text-gray-400">/ {maxScore}</span>
      </div>
    </div>
  )
}

export default function MarketingAssessment() {
  usePageTitle('Marketing Assessment — eSmart')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [finished, setFinished] = useState(false)

  const handleAnswer = (score) => {
    const newAnswers = [...answers, score]
    setAnswers(newAnswers)
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1)
    else setFinished(true)
  }

  const totalScore = answers.reduce((sum, s) => sum + s, 0)
  const maxScore = questions.length * 3
  const result = getResult(totalScore)
  const progress = ((currentQuestion + (finished ? 1 : 0)) / questions.length) * 100

  const restart = () => { setCurrentQuestion(0); setAnswers([]); setFinished(false) }

  return (
    <div className="animate-page-in">
      {/* Hero */}
      <section className="hero-pattern hero-glow py-36 px-6 bg-gradient-to-br from-purple-950 via-purple-900 to-pink-900 text-white text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8 text-sm text-purple-200">
            Free Assessment
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">Marketing Assessment</h1>
          <p className="text-xl text-purple-200/80 max-w-2xl mx-auto">How strong is your digital marketing? Find out in 2 minutes.</p>
        </FadeIn>
      </section>

      <section className="py-24 px-6 max-w-2xl mx-auto">
        {!finished ? (
          <FadeIn>
            <div>
              {/* Progress bar */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Question {currentQuestion + 1} of {questions.length}</span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-8 dark:text-white">{questions[currentQuestion].question}</h2>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(option.score)}
                    className="w-full text-left p-5 border border-gray-100 dark:border-gray-700/50 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all font-medium dark:text-gray-200 group flex items-center gap-4 bg-white dark:bg-gray-800/50"
                  >
                    <span className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600 group-hover:border-blue-500 dark:group-hover:border-blue-400 flex items-center justify-center shrink-0 transition-colors">
                      <span className="w-3 h-3 rounded-full bg-transparent group-hover:bg-blue-500 transition-colors" />
                    </span>
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>
        ) : (
          <FadeIn>
            <div className="text-center">
              <div className="mb-6">
                <ScoreRing score={totalScore} maxScore={maxScore} color={result.ringColor} />
              </div>

              <div className={`inline-block px-5 py-1.5 rounded-full text-sm font-bold ${result.color} ${result.bg} ${result.border} border mb-4`}>{result.level}</div>
              <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto">{result.message}</p>

              <div className="text-left bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 mb-10 border border-gray-100 dark:border-gray-700/50">
                <h3 className="font-bold text-lg mb-5 dark:text-white">Our Recommendations</h3>
                <ul className="space-y-4">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">{i + 1}</span>
                      <span className="text-gray-600 dark:text-gray-300 leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={restart} className="px-6 py-3 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium dark:text-white active:scale-95">
                  Retake Assessment
                </button>
                <Link to="/contact" className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 transition-all font-medium active:scale-95">
                  Get Expert Help
                </Link>
              </div>
            </div>
          </FadeIn>
        )}
      </section>
    </div>
  )
}
