import { useEffect, useState } from 'react'
import { PageContainer, PageHeader, Grid } from '@/components/Layout'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge, ScoreBadge, SkillBadge } from '@/components/Badge'
import { CardLoadingSkeleton } from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/Alert'
import { Modal } from '@/components/Modal'
import { useAppStore } from '@/stores/appStore'
import { apiClient } from '@/lib/api'
import { formatDate, truncate } from '@/utils/formatting'
import { Link } from 'react-router-dom'

export const Matches: React.FC = () => {
  const { matches, setMatches, removeMatch, error, setError } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await apiClient.getAllMatches()
        setMatches(response.data)
      } catch (err) {
        setError(`Failed to fetch matches: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [setMatches, setError])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return

    setDeleting(id)
    try {
      await apiClient.deleteMatch(id)
      removeMatch(id)
    } catch (err) {
      setError(`Failed to delete match: ${err}`)
    } finally {
      setDeleting(null)
    }
  }

  const handleViewDetails = (match: any) => {
    setSelectedMatch(match)
    setShowModal(true)
  }

  const filteredMatches = matches.filter((m) => {
    if (filter === 'high') return m.matchScore >= 80
    if (filter === 'medium') return m.matchScore >= 60 && m.matchScore < 80
    if (filter === 'low') return m.matchScore < 60
    return true
  })

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-[var(--color-success)]' }
    if (score >= 60) return { label: 'Good', color: 'text-[var(--color-info)]' }
    if (score >= 40) return { label: 'Fair', color: 'text-[var(--color-warning)]' }
    return { label: 'Low', color: 'text-[var(--color-error)]' }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Match Results"
        subtitle="AI-powered candidate-job scoring analysis"
        action={
          <Link to="/">
            <Button
              variant="secondary"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              Back to Dashboard
            </Button>
          </Link>
        }
      />

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(['all', 'high', 'medium', 'low'] as const).map((f) => {
          const configs = {
            all: { label: 'All Matches', icon: '📊' },
            high: { label: 'High (80+)', icon: '🌟' },
            medium: { label: 'Medium (60-80)', icon: '👍' },
            low: { label: 'Low (<60)', icon: '⚠️' },
          }
          const config = configs[f]

          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                font-medium text-sm transition-all duration-200
                ${filter === f
                  ? 'skeuo-button-primary text-white'
                  : 'skeuo-button text-[var(--color-ink-primary)]'
                }
              `}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              {f !== 'all' && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20">
                  {matches.filter((m) => {
                    if (f === 'high') return m.matchScore >= 80
                    if (f === 'medium') return m.matchScore >= 60 && m.matchScore < 80
                    return m.matchScore < 60
                  }).length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Matches Grid */}
      {loading ? (
        <Grid cols={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <CardLoadingSkeleton key={i} />
          ))}
        </Grid>
      ) : filteredMatches.length === 0 ? (
        <Card className="animate-fade-in">
          <CardBody className="py-12">
            <EmptyState
              icon="📊"
              title={matches.length === 0 ? 'No matches yet' : 'No matches found'}
              description={
                matches.length === 0
                  ? 'Score a resume against a job to see your first AI-powered match result.'
                  : 'No matches found for the selected filter. Try selecting a different category.'
              }
              action={
                matches.length === 0 ? (
                  <Link to="/">
                    <Button size="lg">Start Matching</Button>
                  </Link>
                ) : (
                  <Button size="lg" onClick={() => setFilter('all')}>
                    View All Matches
                  </Button>
                )
              }
            />
          </CardBody>
        </Card>
      ) : (
        <Grid cols={2} gap="md">
          {filteredMatches.map((match, index) => {
            const scoreLevel = getScoreLevel(match.matchScore)

            return (
              <Card
                key={match.id}
                hover
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` } as any}
              >
                <CardHeader
                  title={`Match #${match.id.slice(0, 8)}`}
                  subtitle={formatDate(match.scoredAt)}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                  action={<ScoreBadge score={match.matchScore} size="lg" />}
                />

                <CardBody className="space-y-4">
                  {/* Score Breakdown */}
                  <div className="skeuo-sunken p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-[var(--color-ink-secondary)]">
                        Match Quality
                      </span>
                      <span className={`text-sm font-bold ${scoreLevel.color}`}>
                        {scoreLevel.label}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--border-light)]">
                      <div
                        className={`h-full transition-all duration-500 ${match.matchScore >= 80
                            ? 'bg-[var(--color-success)]'
                            : match.matchScore >= 60
                              ? 'bg-[var(--color-info)]'
                              : match.matchScore >= 40
                                ? 'bg-[var(--color-warning)]'
                                : 'bg-[var(--color-error)]'
                          }`}
                        style={{ width: `${match.matchScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Experience Gap */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-ink-muted)]">Experience Gap</span>
                    <Badge
                      variant={
                        match.experienceGap === 'None'
                          ? 'success'
                          : match.experienceGap === 'Minor'
                            ? 'info'
                            : match.experienceGap === 'Moderate'
                              ? 'warning'
                              : 'error'
                      }
                    >
                      {match.experienceGap}
                    </Badge>
                  </div>

                  {/* Summary */}
                  <div>
                    <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed">
                      {truncate(match.summary, 100)}
                    </p>
                  </div>

                  {/* Skills Preview */}
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-2">
                      Skills Match
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {match.matchedSkills.slice(0, 3).map((skill: string) => (
                        <SkillBadge key={skill} skill={skill} matched={true} />
                      ))}
                      {match.matchedSkills.length > 3 && (
                        <Badge variant="neutral">
                          +{match.matchedSkills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardBody>

                <CardFooter align="between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(match)}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    }
                  >
                    Full Analysis
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(match.id)}
                    isLoading={deleting === match.id}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    }
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </Grid>
      )}

      {/* Detailed Analysis Modal */}
      {selectedMatch && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Match Analysis #${selectedMatch.id.slice(0, 8)}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Score Overview */}
            <div className="text-center p-6 skeuo-sunken rounded-xl">
              <div className="text-6xl font-bold text-[var(--color-ink-primary)] skeuo-embossed mb-2">
                {selectedMatch.matchScore}%
              </div>
              <p className={`text-lg font-semibold ${getScoreLevel(selectedMatch.matchScore).color}`}>
                {getScoreLevel(selectedMatch.matchScore).label} Match
              </p>
              <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                Scored on {formatDate(selectedMatch.scoredAt)}
              </p>
            </div>

            {/* Summary */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="font-semibold text-[var(--color-ink-primary)]">AI Summary</h4>
              </div>
              <div className="skeuo-sunken p-4 rounded-lg">
                <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed">
                  {selectedMatch.summary}
                </p>
              </div>
            </div>

            {/* Skills Analysis */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-[var(--color-ink-primary)]">
                    Matched Skills ({selectedMatch.matchedSkills.length})
                  </h4>
                </div>
                <div className="skeuo-sunken p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedMatch.matchedSkills.length > 0 ? (
                      selectedMatch.matchedSkills.map((skill: string) => (
                        <SkillBadge key={skill} skill={skill} matched={true} />
                      ))
                    ) : (
                      <p className="text-sm text-[var(--color-ink-muted)]">No matched skills</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-[var(--color-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-[var(--color-ink-primary)]">
                    Missing Skills ({selectedMatch.missingSkills.length})
                  </h4>
                </div>
                <div className="skeuo-sunken p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedMatch.missingSkills.length > 0 ? (
                      selectedMatch.missingSkills.map((skill: string) => (
                        <SkillBadge key={skill} skill={skill} matched={false} />
                      ))
                    ) : (
                      <p className="text-sm text-[var(--color-ink-muted)]">No missing skills</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Gap */}
            <div className="skeuo-sunken p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-[var(--color-ink-primary)]">Experience Gap</span>
              </div>
              <Badge
                variant={
                  selectedMatch.experienceGap === 'None'
                    ? 'success'
                    : selectedMatch.experienceGap === 'Minor'
                      ? 'info'
                      : selectedMatch.experienceGap === 'Moderate'
                        ? 'warning'
                        : 'error'
                }
                size="lg"
              >
                {selectedMatch.experienceGap}
              </Badge>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}
