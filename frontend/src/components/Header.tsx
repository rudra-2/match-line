import { Link } from 'react-router-dom'

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ML</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Match-Line</h1>
              <p className="text-xs text-slate-500">Resume Matching AI</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/resumes"
              className="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors"
            >
              Resumes
            </Link>
            <Link
              to="/jobs"
              className="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors"
            >
              Jobs
            </Link>
            <Link
              to="/matches"
              className="text-sm font-medium text-slate-700 hover:text-primary-600 transition-colors"
            >
              Matches
            </Link>
          </nav>

          {/* Health Status */}
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-slate-600">Online</span>
          </div>
        </div>
      </div>
    </header>
  )
}
