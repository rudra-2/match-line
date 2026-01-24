import React from 'react'

interface AlertProps {
    variant?: 'success' | 'warning' | 'error' | 'info'
    title?: string
    message: string
    onClose?: () => void
    className?: string
}

export const Alert: React.FC<AlertProps> = ({
    variant = 'info',
    title,
    message,
    onClose,
    className = '',
}) => {
    const variants = {
        success: {
            bg: 'bg-[var(--color-success-light)]',
            border: 'border-[var(--color-success)]',
            text: 'text-[var(--color-success)]',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        warning: {
            bg: 'bg-[var(--color-warning-light)]',
            border: 'border-[var(--color-warning)]',
            text: 'text-[var(--color-warning)]',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        error: {
            bg: 'bg-[var(--color-error-light)]',
            border: 'border-[var(--color-error)]',
            text: 'text-[var(--color-error)]',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        info: {
            bg: 'bg-[var(--color-info-light)]',
            border: 'border-[var(--color-info)]',
            text: 'text-[var(--color-info)]',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    }

    const config = variants[variant]

    return (
        <div
            className={`
        ${config.bg} ${config.border} border
        rounded-lg p-4
        flex items-start gap-4
        animate-fade-in
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 2px var(--shadow-color)
        ${className}
      `}
            role="alert"
        >
            <div className={`flex-shrink-0 ${config.text}`}>{config.icon}</div>
            <div className="flex-1 min-w-0">
                {title && (
                    <h4 className={`font-semibold ${config.text} mb-1`}>{title}</h4>
                )}
                <p className={`text-sm ${config.text} opacity-90`}>{message}</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className={`flex-shrink-0 ${config.text} hover:opacity-70 transition-opacity`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    )
}

// Toast notification - floating alert
interface ToastProps extends AlertProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export const Toast: React.FC<ToastProps> = ({
    position = 'top-right',
    ...props
}) => {
    const positions = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
    }

    return (
        <div className={`fixed ${positions[position]} z-50 max-w-sm w-full`}>
            <Alert {...props} className="shadow-xl" />
        </div>
    )
}

// Empty State
interface EmptyStateProps {
    icon?: React.ReactNode
    title: string
    description: string
    action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => {
    return (
        <div className="text-center py-12 animate-fade-in">
            {icon && (
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--color-surface-sunken)] flex items-center justify-center text-[var(--color-accent-primary)] border border-[var(--border-light)]">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-semibold text-[var(--color-ink-primary)] mb-2 skeuo-embossed">
                {title}
            </h3>
            <p className="text-[var(--color-ink-secondary)] max-w-sm mx-auto mb-6">
                {description}
            </p>
            {action}
        </div>
    )
}
