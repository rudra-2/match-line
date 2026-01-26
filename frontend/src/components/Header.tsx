import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib'

export const Header: React.FC = () => {
  const location = useLocation()
  const [isOnline, setIsOnline] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiClient.checkHealth()
        setIsOnline(true)
      } catch {
        setIsOnline(false)
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/resumes', label: 'Resumes' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/matches', label: 'Matches' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="glass-strong sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl overflow-hidden relative">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 
                             transition-transform duration-300 group-hover:scale-110"
                />
                <div className="relative flex items-center justify-center h-full">
                  <span className="text-white font-bold text-lg">ML</span>
                </div>
              </div>
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 
                           blur-lg opacity-50 group-hover:opacity-75 transition-opacity -z-10"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                Match-Line
              </h1>
              <p className="text-xs text-white/50">AI Resume Matching</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link rounded-lg ${isActive(link.to) ? 'active bg-white/5' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side - Status & Mobile menu */}
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass-subtle">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-xs font-medium text-white/70">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg glass-subtle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.to)
                      ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {/* Mobile Status */}
              <div className="flex items-center gap-2 px-4 py-3 mt-2 border-t border-white/10">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-xs font-medium text-white/70">
                  {isOnline ? 'System Online' : 'System Offline'}
                </span>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
