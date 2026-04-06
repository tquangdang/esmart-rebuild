import { Link } from 'react-router-dom'

const tabs = [
  { id: 'projects', label: 'My Projects', icon: '📁' },
  { id: 'create', label: 'Create New', icon: '✨' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6 flex flex-col shrink-0">
      <Link to="/" className="text-xl font-bold text-white mb-8 hover:text-blue-300 transition">
        eSmart
      </Link>

      <div className="flex flex-col gap-2 flex-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[0.97] ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      <Link
        to="/"
        className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition text-sm mt-auto"
      >
        <span>&larr;</span>
        <span>Back to Site</span>
      </Link>
    </aside>
  )
}
