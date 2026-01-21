interface MatchScoreDisplayProps {
  score: number
  skills: { matched: string[]; missing: string[] }
  gap: string
}

export const MatchScoreDisplay: React.FC<MatchScoreDisplayProps> = ({
  score,
  skills,
  gap,
}) => {
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-700'
    if (s >= 60) return 'text-blue-700'
    if (s >= 40) return 'text-yellow-700'
    return 'text-red-700'
  }

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'bg-green-50'
    if (s >= 60) return 'bg-blue-50'
    if (s >= 40) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  return (
    <div className={`${getScoreBg(score)} rounded-lg p-6 border border-slate-200`}>
      <div className="flex items-center gap-8">
        {/* Score Circle */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: 'currentColor',
              borderRightColor: 'currentColor',
              transform: `rotate(${(score / 100) * 360}deg)`,
            }}
          />
          <div className={`text-center ${getScoreColor(score)}`}>
            <div className="text-3xl font-bold">{score}</div>
            <div className="text-xs">Match</div>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          {/* Matched Skills */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Matched Skills ({skills.matched.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.matched.length > 0 ? (
                skills.matched.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full"
                  >
                    ✓ {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">None</span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Missing Skills ({skills.missing.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.missing.length > 0 ? (
                skills.missing.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block px-2.5 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full"
                  >
                    ✕ {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">None</span>
              )}
            </div>
          </div>

          {/* Experience Gap */}
          <div>
            <p className="text-sm font-medium text-slate-700">
              Experience Gap:{' '}
              <span className={gap === 'None' ? 'text-green-600' : 'text-yellow-600'}>
                {gap}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
