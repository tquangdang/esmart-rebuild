export function SkeletonLine({ className = '' }) {
  return <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
}

export function SkeletonCircle({ size = 'w-10 h-10' }) {
  return <div className={`${size} rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse`} />
}

export function SkeletonCard() {
  return (
    <div className="p-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl animate-pulse">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  )
}

export default function Skeleton({ lines = 3, circle = false, card = false }) {
  if (circle) return <SkeletonCircle />
  if (card) return <SkeletonCard />

  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} className={i === lines - 1 ? 'w-2/3' : ''} />
      ))}
    </div>
  )
}
