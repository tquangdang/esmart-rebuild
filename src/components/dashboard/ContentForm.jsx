const contentTypes = [
  { id: 'blog', label: 'Blog Post', icon: '📝', desc: 'Long-form SEO-optimized articles' },
  { id: 'social', label: 'Social Media', icon: '📱', desc: 'Engaging posts for any platform' },
  { id: 'email', label: 'Email', icon: '✉️', desc: 'Newsletters and email campaigns' },
  { id: 'landing', label: 'Landing Page', icon: '🖥️', desc: 'High-converting page copy' },
]

const tones = ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Witty', 'Inspirational']

export default function ContentForm({ step, formData, setFormData, onNext, onBack }) {
  if (step === 1) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">What do you want to create?</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Select a content type to get started.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => { setFormData({ ...formData, type: type.id }); onNext() }}
              className={`p-6 border-2 rounded-2xl text-left transition-all hover:border-blue-500 hover:shadow-md ${
                formData.type === type.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <span className="text-3xl">{type.icon}</span>
              <h3 className="text-lg font-semibold mt-3 dark:text-white">{type.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{type.desc}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-xl">
      <h2 className="text-2xl font-bold mb-2 dark:text-white">Content Details</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Tell us about the content you want to generate.</p>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
          <input
            type="text"
            value={formData.topic || ''}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="e.g. Benefits of AI in small business marketing"
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords</label>
          <input
            type="text"
            value={formData.keywords || ''}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="e.g. AI marketing, small business, automation"
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tone</label>
          <select
            value={formData.tone || ''}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select a tone...</option>
            {tones.map((tone) => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={onBack} className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium dark:text-white">
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!formData.topic}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Generate Content
          </button>
        </div>
      </div>
    </div>
  )
}
