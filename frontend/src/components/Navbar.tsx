import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface NavItemProps {
    to: string
    icon: React.ReactNode
    label: string
    badge?: number
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badge }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `
        flex items-center gap-3 px-4 py-3 rounded-lg
        transition-all duration-200
        font-medium text-sm
        ${isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-accent-primary)] shadow-sm border border-[var(--border-light)]'
                    : 'text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink-primary)]'
                }
      `}
        >
            <span className="w-5 h-5">{icon}</span>
            <span className="flex-1">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 bg-[var(--color-accent-primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </NavLink>
    )
}

export const Navbar: React.FC = () => {
    const location = useLocation()

    const navItems = [
        {
            to: '/',
            label: 'Dashboard',
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            to: '/resumes',
            label: 'Resumes',
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            to: '/jobs',
            label: 'Jobs',
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            to: '/matches',
            label: 'Matches',
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
    ]

    return (
        <nav className="w-64 min-h-screen bg-[var(--color-paper-dark)] border-r border-[var(--border-light)] flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-[var(--border-light)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)] flex items-center justify-center shadow-md">
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-[var(--color-ink-primary)] skeuo-embossed tracking-tight">
                            Match-Line
                        </h1>
                        <p className="text-xs text-[var(--color-ink-muted)]">
                            AI Resume Matching
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4 space-y-1">
                <p className="px-4 py-2 text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">
                    Navigation
                </p>
                {navItems.map((item) => (
                    <NavItem key={item.to} {...item} />
                ))}
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-[var(--border-light)]">
                <p className="px-4 py-2 text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">
                    Quick Actions
                </p>
                <div className="space-y-1">
                    <NavLink
                        to="/resumes/upload"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink-primary)] transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Upload Resume</span>
                    </NavLink>
                    <NavLink
                        to="/jobs/create"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-ink-secondary)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink-primary)] transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Create Job</span>
                    </NavLink>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border-light)]">
                <div className="skeuo-sunken p-4 rounded-lg">
                    <p className="text-xs font-medium text-[var(--color-ink-secondary)] mb-1">
                        AI Powered by
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-ink-primary)]">
                        LLM + Embeddings
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[var(--color-success)] rounded-full animate-pulse" />
                        <span className="text-xs text-[var(--color-success)]">System Online</span>
                    </div>
                </div>
            </div>
        </nav>
    )
}
