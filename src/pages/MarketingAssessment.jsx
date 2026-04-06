import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  if (score >= 13) return { level: 'Advanced', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-700', message: 'Your digital marketing is strong! You\'re leveraging multiple channels effectively.', recommendations: ['Focus on advanced analytics and attribution modeling', 'Explore AI-powered content personalization', 'Consider marketing automation to scale further', 'Test emerging platforms and formats (short-form video, podcasts)'] }
  if (score >= 7) return { level: 'Growing', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-700', message: 'You\'ve got a solid foundation but there\'s room to grow. Focus on consistency and strategy.', recommendations: ['Create a content calendar and stick to a posting schedule', 'Invest in SEO to boost organic traffic', 'Set up email marketing automation', 'Start tracking KPIs and ROI for each channel'] }
  return { level: 'Beginner', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-700', message: 'You\'re just getting started — and that\'s okay! There\'s huge potential to grow your digital presence.', recommendations: ['Build or improve your business website first', 'Choose 1-2 social media platforms and start posting regularly', 'Set up Google Analytics to start tracking visitors', 'Consider working with a digital marketing agency to jumpstart growth'] }
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

  const restart = () => { setCurrentQuestion(0); setAnswers([]); setFinished(false) }

  return (
    <div className="animate-page-in">
      <section className="py-32 px-6 bg-gradient-to-br from-purple-900 to-pink-800 text-white text-center">
        <h1 className="text-5xl font-bold mb-6">Marketing Assessment</h1>
        <p className="text-xl text-purple-100">How strong is your digital marketing? Find out in 2 minutes.</p>
      </section>

      <section className="py-20 px-6 max-w-2xl mx-auto">
        {!finished ? (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm text-gray-400">Question {currentQuestion + 1} of {questions.length}</span>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div key={i} className={`h-2 w-8 rounded-full transition-all ${i < currentQuestion ? 'bg-blue-500' : i === currentQuestion ? 'bg-blue-300' : 'bg-gray-200 dark:bg-gray-700'}`} />
                ))}
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-8 dark:text-white">{questions[currentQuestion].question}</h2>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, i) => (
                <button key={i} onClick={() => handleAnswer(option.score)} className="w-full text-left p-5 border-2 border-gray-100 dark:border-gray-700 rounded-2xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-medium dark:text-gray-200">
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <div className={`inline-block px-6 py-2 rounded-full text-sm font-bold ${result.color} ${result.bg} ${result.border} border mb-6`}>{result.level}</div>
            <h2 className="text-4xl font-bold mb-2 dark:text-white">{totalScore} / {maxScore}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{result.message}</p>
            <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 mb-8">
              <h3 className="font-bold text-lg mb-4 dark:text-white">Our Recommendations:</h3>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3"><span className="text-blue-500 font-bold">→</span><span className="text-gray-600 dark:text-gray-300">{rec}</span></li>
                ))}
              </ul>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={restart} className="px-6 py-3 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium dark:text-white">Retake Assessment</button>
              <Link to="/contact" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">Get Expert Help</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
