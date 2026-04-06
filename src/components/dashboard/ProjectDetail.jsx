const projectContents = {
  1: [
    { id: 'c1', type: 'Blog', topic: 'AI in Marketing Q1 Trends', status: 'Published', date: 'Mar 12, 2026' },
    { id: 'c2', type: 'Blog', topic: 'Content Strategy for Small Business', status: 'Published', date: 'Mar 14, 2026' },
    { id: 'c3', type: 'Blog', topic: 'SEO Best Practices 2026', status: 'Draft', date: 'Mar 16, 2026' },
  ],
  2: [
    { id: 'c4', type: 'Email', topic: 'Product Launch Announcement', status: 'Draft', date: 'Mar 15, 2026' },
    { id: 'c5', type: 'Email', topic: 'Follow-up Sequence', status: 'Draft', date: 'Mar 17, 2026' },
  ],
  3: [
    { id: 'c6', type: 'Social Media', topic: 'Spring Sale Announcement', status: 'Published', date: 'Mar 20, 2026' },
    { id: 'c7', type: 'Social Media', topic: 'Behind the Scenes Post', status: 'In Progress', date: 'Mar 22, 2026' },
    { id: 'c8', type: 'Social Media', topic: 'Customer Spotlight', status: 'Draft', date: 'Mar 24, 2026' },
  ],
}

const statusColors = {
  Published: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  'In Progress': 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  Draft: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
}

export default function ProjectDetail({ project, onBack }) {
  const contents = projectContents[project.id] || []

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium mb-6 transition active:scale-95 inline-flex items-center gap-1">
        &larr; Back to Projects
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">{project.title}</h2>
            <p className="text-gray-400 text-sm mt-1">{project.type} · Created {project.date}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[project.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
            {project.status}
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Content Pieces ({contents.length})</h3>
      <div className="space-y-3">
        {contents.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-sm transition-all">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{item.type === 'Blog' ? '📝' : item.type === 'Email' ? '✉️' : '📱'}</span>
              <div>
                <p className="font-medium dark:text-white">{item.topic}</p>
                <p className="text-xs text-gray-400">{item.type} · {item.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusColors[item.status] || ''}`}>{item.status}</span>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium transition active:scale-95">View</button>
            </div>
          </div>
        ))}
      </div>

      {contents.length === 0 && <p className="text-gray-400 text-center py-8">No content pieces yet.</p>}
    </div>
  )
}
