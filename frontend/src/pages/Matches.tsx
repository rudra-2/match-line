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
import {
  ChartIcon,
  DocumentIcon,
  ClipboardIcon,
  CheckIcon,
  StarIcon,
  ClockIcon,
  TrendingUpIcon,
} from '@/components/Icons'

export const Matches: React.FC = () => {
  const { matches, setMatches, removeMatch, setError } = useAppStore()
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

  const filterConfigs = [
    { key: 'all', label: 'All Matches', icon: <ChartIcon className="w-4 h-4" /> },
    { key: 'high', label: 'High (80+)', icon: <StarIcon className="w-4 h-4" filled /> },
    { key: 'medium', label: 'Medium (60-80)', icon: <TrendingUpIcon className="w-4 h-4" /> },
    { key: 'low', label: 'Low (<60)', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
  ]

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
        {filterConfigs.map((config) => (
          <button
            key={config.key}
            onClick={() => setFilter(config.key as typeof filter)}
            className={`
              inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
              font-medium text-sm transition-all duration-200
              ${filter === config.key
                ? 'skeuo-button-primary text-white'
                : 'skeuo-button text-[var(--color-ink-primary)]'
              }
            `}
          >
            <span className="icon-hover-scale">{config.icon}</span>
            <span>{config.label}</span>
            {config.key !== 'all' && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/20">
                {matches.filter((m) => {
                  if (config.key === 'high') return m.matchScore >= 80
                  if (config.key === 'medium') return m.matchScore >= 60 && m.matchScore < 80
                  return m.matchScore < 60
                }).length}
              </span>
            )}
          </button>
        ))}
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
              icon={<ChartIcon className="w-8 h-8 animate-icon-bob" />}
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
                  icon={<ChartIcon className="w-5 h-5 icon-hover-scale" />}
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
                    <div className="h-2.5 bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--border-light)]">
                      <div
                        className={`h-full transition-all duration-700 ease-out ${match.matchScore >= 80
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
                    <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                      <ClockIcon className="w-4 h-4" />
                      <span>Experience Gap</span>
                    </div>
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
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-2">
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>Skills Match</span>
                    </div>
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
                    leftIcon={<ClipboardIcon className="w-4 h-4" />}
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
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--color-surface)] flex items-center justify-center border border-[var(--border-light)]">
                <StarIcon className="w-10 h-10 text-[var(--color-accent-primary)] animate-icon-breathe" filled />
              </div>
              <div className="text-5xl font-bold text-[var(--color-ink-primary)] skeuo-embossed mb-2">
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
                <DocumentIcon className="w-5 h-5 text-[var(--color-accent-primary)]" />
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
                  <CheckIcon className="w-5 h-5 text-[var(--color-success)]" />
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
                <ClockIcon className="w-5 h-5 text-[var(--color-accent-primary)]" />
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
