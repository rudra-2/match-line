import React from 'react'

interface BadgeProps {
    children: React.ReactNode
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'info'
    size?: 'sm' | 'md' | 'lg'
    icon?: React.ReactNode
    className?: string
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    className = '',
}) => {
    const variants = {
        primary: `
      bg-[var(--color-accent-primary)]
      text-white
      border-[var(--color-accent-primary-dark)]
    `,
        success: `
      bg-[var(--color-success-light)]
      text-[var(--color-success)]
      border-[var(--color-success)]
    `,
        warning: `
      bg-[var(--color-warning-light)]
      text-[var(--color-warning)]
      border-[var(--color-warning)]
    `,
        error: `
      bg-[var(--color-error-light)]
      text-[var(--color-error)]
      border-[var(--color-error)]
    `,
        neutral: `
      bg-[var(--color-surface-sunken)]
      text-[var(--color-ink-secondary)]
      border-[var(--border-medium)]
    `,
        info: `
      bg-[var(--color-info-light)]
      text-[var(--color-info)]
      border-[var(--color-info)]
    `,
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
    }

    return (
        <span
            className={`
        skeuo-badge
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
        >
            {icon && <span className="mr-1.5">{icon}</span>}
            {children}
        </span>
    )
}

// Score Badge - specifically for match scores
interface ScoreBadgeProps {
    score: number
    size?: 'sm' | 'md' | 'lg'
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'md' }) => {
    const getVariant = (s: number): BadgeProps['variant'] => {
        if (s >= 80) return 'success'
        if (s >= 60) return 'info'
        if (s >= 40) return 'warning'
        return 'error'
    }

    return (
        <Badge variant={getVariant(score)} size={size}>
            {score}%
        </Badge>
    )
}

// Status Badge with pulse animation for active states
interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'pending' | 'completed'
    showPulse?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    showPulse = false,
}) => {
    const config = {
        active: { variant: 'success' as const, label: 'Active' },
        inactive: { variant: 'neutral' as const, label: 'Inactive' },
        pending: { variant: 'warning' as const, label: 'Pending' },
        completed: { variant: 'info' as const, label: 'Completed' },
    }

    const { variant, label } = config[status]

    return (
        <Badge
            variant={variant}
            icon={
                showPulse && status === 'active' ? (
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                    </span>
                ) : undefined
            }
        >
            {label}
        </Badge>
    )
}

// Skill Badge - for displaying skills
interface SkillBadgeProps {
    skill: string
    matched?: boolean
    onRemove?: () => void
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
    skill,
    matched,
    onRemove,
}) => {
    return (
        <span
            className={`
        inline-flex items-center gap-1.5 px-3 py-1
        text-xs font-medium rounded-full
        transition-all duration-150
        ${matched === true
                    ? 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success)]'
                    : matched === false
                        ? 'bg-[var(--color-error-light)] text-[var(--color-error)] border border-[var(--color-error)]'
                        : 'bg-[var(--color-surface-sunken)] text-[var(--color-ink-secondary)] border border-[var(--border-medium)]'
                }
        skeuo-badge
      `}
        >
            {matched === true && <span>✓</span>}
            {matched === false && <span>✕</span>}
            {skill}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-1 hover:text-[var(--color-error)] transition-colors"
                >
                    ×
                </button>
            )}
        </span>
    )
}
