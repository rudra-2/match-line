import React from 'react'

interface PageContainerProps {
    children: React.ReactNode
    className?: string
}

export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    className = '',
}) => {
    return (
        <div className={`container-app page-container ${className}`}>
            {children}
        </div>
    )
}

interface PageHeaderProps {
    title: string
    subtitle?: string
    action?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    action,
}) => {
    return (
        <div className="flex items-start justify-between mb-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-[var(--color-ink-primary)] skeuo-embossed tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-2 text-[var(--color-ink-secondary)] text-lg">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    )
}

interface GridProps {
    children: React.ReactNode
    cols?: 1 | 2 | 3 | 4
    gap?: 'sm' | 'md' | 'lg'
    className?: string
}

export const Grid: React.FC<GridProps> = ({
    children,
    cols = 2,
    gap = 'md',
    className = '',
}) => {
    const colsClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }

    const gapClass = {
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
    }

    return (
        <div className={`grid ${colsClass[cols]} ${gapClass[gap]} ${className}`}>
            {children}
        </div>
    )
}

interface SidebarProps {
    children: React.ReactNode
    className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ children, className = '' }) => {
    return (
        <aside
            className={`w-64 min-h-screen skeuo-raised border-r border-[var(--border-light)] p-4 ${className}`}
            style={{ borderRadius: 0, borderLeft: 'none', borderTop: 'none', borderBottom: 'none' }}
        >
            {children}
        </aside>
    )
}

interface MainContentProps {
    children: React.ReactNode
    className?: string
}

export const MainContent: React.FC<MainContentProps> = ({
    children,
    className = '',
}) => {
    return (
        <main className={`flex-1 overflow-auto ${className}`}>
            {children}
        </main>
    )
}

interface AppLayoutProps {
    children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-[var(--color-paper)]">
            {children}
        </div>
    )
}
