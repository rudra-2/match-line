import React from 'react'

// Card Loading Skeleton
export const CardLoadingSkeleton: React.FC<{ className?: string }> = ({
    className = '',
}) => {
    return (
        <div
            className={`
        skeuo-raised overflow-hidden
        ${className}
      `}
        >
            {/* Header Skeleton */}
            <div className="px-6 py-4 border-b border-[var(--border-light)] bg-[var(--color-surface-raised)]">
                <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                        <div className="h-5 w-3/4 bg-[var(--color-surface-sunken)] rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-[var(--color-surface-sunken)] rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-16 bg-[var(--color-surface-sunken)] rounded-full animate-pulse" />
                </div>
            </div>

            {/* Body Skeleton */}
            <div className="px-6 py-5 space-y-4">
                <div className="h-4 w-full bg-[var(--color-surface-sunken)] rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-[var(--color-surface-sunken)] rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-[var(--color-surface-sunken)] rounded animate-pulse" />
            </div>

            {/* Footer Skeleton */}
            <div className="px-6 py-4 border-t border-[var(--border-light)] bg-[var(--color-surface-raised)] flex justify-end gap-3">
                <div className="h-9 w-24 bg-[var(--color-surface-sunken)] rounded-lg animate-pulse" />
                <div className="h-9 w-20 bg-[var(--color-surface-sunken)] rounded-lg animate-pulse" />
            </div>
        </div>
    )
}

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
    return (
        <div className="skeuo-raised px-6 py-5">
            <div className="flex items-start justify-between">
                <div className="space-y-3">
                    <div className="h-3 w-20 bg-[var(--color-surface-sunken)] rounded animate-pulse" />
                    <div className="h-10 w-16 bg-[var(--color-surface-sunken)] rounded animate-pulse" />
                    <div className="h-3 w-24 bg-[var(--color-surface-sunken)] rounded animate-pulse" />
                </div>
                <div className="w-14 h-14 bg-[var(--color-surface-sunken)] rounded-xl animate-pulse" />
            </div>
        </div>
    )
}

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 4 }) => {
    return (
        <tr className="border-b border-[var(--border-light)]">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <div
                        className="h-4 bg-[var(--color-surface-sunken)] rounded animate-pulse"
                        style={{ width: `${60 + Math.random() * 30}%` }}
                    />
                </td>
            ))}
        </tr>
    )
}

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-[var(--border-light)]">
            <div className="w-10 h-10 bg-[var(--color-surface-sunken)] rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-[var(--color-surface-sunken)] rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-[var(--color-surface-sunken)] rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-[var(--color-surface-sunken)] rounded-full animate-pulse" />
        </div>
    )
}

// Text Skeleton with multiple lines
interface TextSkeletonProps {
    lines?: number
    className?: string
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({
    lines = 3,
    className = '',
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-[var(--color-surface-sunken)] rounded animate-pulse"
                    style={{
                        width: i === lines - 1 ? `${50 + Math.random() * 30}%` : '100%',
                    }}
                />
            ))}
        </div>
    )
}

// Avatar Skeleton
export const AvatarSkeleton: React.FC<{
    size?: 'sm' | 'md' | 'lg'
}> = ({ size = 'md' }) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
    }

    return (
        <div
            className={`${sizes[size]} bg-[var(--color-surface-sunken)] rounded-full animate-pulse`}
        />
    )
}

// Button Skeleton
export const ButtonSkeleton: React.FC<{
    size?: 'sm' | 'md' | 'lg'
    width?: string
}> = ({ size = 'md', width = 'w-24' }) => {
    const heights = {
        sm: 'h-8',
        md: 'h-10',
        lg: 'h-12',
    }

    return (
        <div
            className={`${heights[size]} ${width} bg-[var(--color-surface-sunken)] rounded-lg animate-pulse`}
        />
    )
}

// Spinner for loading states
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    }

    return (
        <svg
            className={`animate-spin ${sizes[size]} text-[var(--color-accent-primary)] ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    )
}

// Full page loading state
export const PageLoader: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)]">
            <div className="text-center">
                <Spinner size="lg" className="mx-auto mb-4" />
                <p className="text-[var(--color-ink-muted)]">Loading...</p>
            </div>
        </div>
    )
}
