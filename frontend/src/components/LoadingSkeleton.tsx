interface LoadingSkeletonProps {
  count?: number
  height?: string
  className?: string
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 1,
  height = 'h-12',
  className = '',
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`animate-pulse bg-slate-200 rounded-lg mb-3 ${height} ${className}`}
      />
    ))}
  </>
)

export const CardLoadingSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-elegant p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-slate-200 rounded-lg" />
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  </div>
)

export const TableLoadingSkeleton: React.FC<{ rows?: number }> = ({
  rows = 5,
}) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse" />
    ))}
  </div>
)
