import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    hover?: boolean
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
}) => {
    return (
        <div
            className={`
        skeuo-raised paper-texture overflow-hidden
        transition-all duration-200
        ${hover ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    )
}

interface CardHeaderProps {
    title: string
    subtitle?: string
    action?: React.ReactNode
    icon?: React.ReactNode
    className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    subtitle,
    action,
    icon,
    className = '',
}) => {
    return (
        <div
            className={`
        px-6 py-4 border-b border-[var(--border-light)]
        bg-[var(--color-surface-raised)]
        flex items-center justify-between
        ${className}
      `}
        >
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-sunken)] flex items-center justify-center text-[var(--color-accent-primary)]">
                        {icon}
                    </div>
                )}
                <div>
                    <h3 className="font-semibold text-[var(--color-ink-primary)] skeuo-embossed">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    )
}

interface CardBodyProps {
    children: React.ReactNode
    className?: string
}

export const CardBody: React.FC<CardBodyProps> = ({
    children,
    className = '',
}) => {
    return <div className={`px-6 py-5 ${className}`}>{children}</div>
}

interface CardFooterProps {
    children: React.ReactNode
    align?: 'left' | 'right' | 'between' | 'center'
    className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({
    children,
    align = 'right',
    className = '',
}) => {
    const alignClass = {
        left: 'justify-start',
        right: 'justify-end',
        between: 'justify-between',
        center: 'justify-center',
    }

    return (
        <div
            className={`
        px-6 py-4 border-t border-[var(--border-light)]
        bg-[var(--color-surface-raised)]
        flex items-center gap-3
        ${alignClass[align]}
        ${className}
      `}
        >
            {children}
        </div>
    )
}

// Stats Card - for dashboard numbers
interface StatsCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon?: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendValue,
}) => {
    const trendColors = {
        up: 'text-[var(--color-success)]',
        down: 'text-[var(--color-error)]',
        neutral: 'text-[var(--color-ink-muted)]',
    }

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    }

    return (
        <Card className="animate-fade-in">
            <CardBody>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-[var(--color-ink-muted)] uppercase tracking-wide">
                            {title}
                        </p>
                        <p className="mt-2 text-4xl font-bold text-[var(--color-ink-primary)] skeuo-embossed">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="mt-1 text-sm text-[var(--color-ink-secondary)]">
                                {subtitle}
                            </p>
                        )}
                        {trend && trendValue && (
                            <p className={`mt-2 text-sm font-medium ${trendColors[trend]}`}>
                                {trendIcons[trend]} {trendValue}
                            </p>
                        )}
                    </div>
                    {icon && (
                        <div className="w-14 h-14 rounded-xl bg-[var(--color-surface-sunken)] flex items-center justify-center text-2xl text-[var(--color-accent-primary)]">
                            {icon}
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    )
}
