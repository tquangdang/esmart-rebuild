const contentTypes = [
  { id: 'blog', label: 'Blog Post', desc: 'Long-form SEO-optimized articles', iconPath: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { id: 'social', label: 'Social Media', desc: 'Engaging posts for any platform', iconPath: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'email', label: 'Email', desc: 'Newsletters and email campaigns', iconPath: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  { id: 'landing', label: 'Landing Page', desc: 'High-converting page copy', iconPath: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
]

const tones = ['Professional', 'Casual', 'Friendly', 'Authoritative', 'Witty', 'Inspirational']

export default function ContentForm({ step, formData, setFormData, onNext, onBack, onGenerate, generating }) {
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
              <div className={`w-12 h-12 rounded-xl ${type.color} flex items-center justify-center`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={type.iconPath} /></svg>
              </div>
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
            disabled={generating}
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
            disabled={generating}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tone</label>
          <select
            value={formData.tone || ''}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 dark:text-white"
            disabled={generating}
          >
            <option value="">Select a tone...</option>
            {tones.map((tone) => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            onClick={onBack}
            disabled={generating}
            className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium dark:text-white disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={onGenerate}
            disabled={!formData.topic?.trim() || !formData.keywords?.trim() || generating}
            title={
              !formData.topic?.trim()
                ? 'Topic is required'
                : !formData.keywords?.trim()
                ? 'Keywords are required'
                : undefined
            }
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Content'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
