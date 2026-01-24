import { useEffect, useState } from 'react'
import { PageContainer, PageHeader, Grid } from '@/components/Layout'
import { Card, CardBody, StatsCard } from '@/components/Card'
import { Badge, ScoreBadge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { StatsCardSkeleton, ListItemSkeleton } from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/Alert'
import { useAppStore } from '@/stores/appStore'
import { apiClient } from '@/lib/api'
import { formatDate } from '@/utils/formatting'
import { Link } from 'react-router-dom'
import {
  DocumentIcon,
  BriefcaseIcon,
  ChartIcon,
  StarIcon,
  LightningIcon,
  ServerIcon,
  DatabaseIcon,
  SparklesIcon,
  UploadIcon,
} from '@/components/Icons'

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    resumes: 0,
    jobs: 0,
    matches: 0,
    avgScore: 0,
  })
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { setError } = useAppStore()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [resumesRes, jobsRes, matchesRes] = await Promise.all([
          apiClient.getAllResumes(),
          apiClient.getAllJobs(),
          apiClient.getAllMatches(),
        ])

        const matches = matchesRes.data
        const avgScore =
          matches.length > 0
            ? Math.round(
              matches.reduce((sum: number, m: any) => sum + m.matchScore, 0) / matches.length
            )
            : 0

        setStats({
          resumes: resumesRes.data.length,
          jobs: jobsRes.data.length,
          matches: matches.length,
          avgScore,
        })

        setRecentMatches(matches.slice(0, 5))
      } catch (error) {
        setError(`Failed to load dashboard: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [setError])

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your AI matching overview."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Resumes"
              value={stats.resumes}
              subtitle="Uploaded candidates"
              icon={
                <div className="icon-hover-scale">
                  <DocumentIcon className="w-7 h-7" />
                </div>
              }
            />
            <StatsCard
              title="Job Listings"
              value={stats.jobs}
              subtitle="Active positions"
              icon={
                <div className="animate-icon-wiggle-hover">
                  <BriefcaseIcon className="w-7 h-7" />
                </div>
              }
            />
            <StatsCard
              title="Total Matches"
              value={stats.matches}
              subtitle="AI-scored pairs"
              icon={
                <div className="animate-icon-breathe">
                  <ChartIcon className="w-7 h-7" />
                </div>
              }
            />
            <StatsCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              subtitle="Match quality"
              icon={
                <div className="animate-icon-pulse">
                  <StarIcon className="w-7 h-7" filled />
                </div>
              }
            />
          </>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Matches - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-6 py-4 border-b border-[var(--border-light)] bg-[var(--color-surface-raised)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-sunken)] flex items-center justify-center text-[var(--color-accent-primary)]">
                  <LightningIcon className="w-5 h-5 animate-icon-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-ink-primary)] skeuo-embossed">
                    Recent Matches
                  </h3>
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    Latest AI scoring results
                  </p>
                </div>
              </div>
              <Link to="/matches">
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </Link>
            </div>

            <div className="divide-y divide-[var(--border-light)]">
              {loading ? (
                <>
                  <ListItemSkeleton />
                  <ListItemSkeleton />
                  <ListItemSkeleton />
                </>
              ) : recentMatches.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<ChartIcon className="w-8 h-8" />}
                    title="No matches yet"
                    description="Score a resume against a job to see your first match result here."
                    action={
                      <Link to="/resumes">
                        <Button>Get Started</Button>
                      </Link>
                    }
                  />
                </div>
              ) : (
                recentMatches.map((match: any, index: number) => (
                  <div
                    key={match.id}
                    className={`
                      px-6 py-4 flex items-center justify-between
                      hover:bg-[var(--color-surface-sunken)] transition-colors
                      animate-fade-in
                    `}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-sunken)] flex items-center justify-center text-[var(--color-accent-primary)] icon-hover-scale">
                        <DocumentIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-ink-primary)]">
                          Match #{match.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-[var(--color-ink-muted)]">
                          {formatDate(match.scoredAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <ScoreBadge score={match.matchScore} size="lg" />
                        <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                          {match.experienceGap} gap
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <Card className="animate-fade-in">
            <CardBody>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-success-light)] flex items-center justify-center">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-success)]"></span>
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-ink-primary)]">System Status</p>
                  <p className="text-sm text-[var(--color-success)]">All services online</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
                    <ServerIcon className="w-4 h-4" />
                    <span>Backend API</span>
                  </div>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
                    <SparklesIcon className="w-4 h-4 animate-icon-breathe" />
                    <span>AI Service</span>
                  </div>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
                    <DatabaseIcon className="w-4 h-4" />
                    <span>Database</span>
                  </div>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Scoring Formula */}
          <Card className="animate-fade-in delay-100">
            <CardBody>
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-[var(--color-accent-primary)] animate-icon-spin-slow" />
                <h4 className="font-semibold text-[var(--color-ink-primary)] skeuo-embossed">
                  Scoring Formula
                </h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-ink-secondary)]">Skills Overlap</span>
                  <span className="font-semibold text-[var(--color-accent-primary)]">40%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-ink-secondary)]">Semantic Match</span>
                  <span className="font-semibold text-[var(--color-accent-secondary)]">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-ink-secondary)]">Experience Fit</span>
                  <span className="font-semibold text-[var(--color-accent-tertiary)]">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-ink-secondary)]">Role Keywords</span>
                  <span className="font-semibold text-[var(--color-ink-muted)]">10%</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hover className="animate-fade-in delay-200">
          <CardBody className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-surface-sunken)] flex items-center justify-center text-[var(--color-accent-primary)] icon-container-soft">
              <UploadIcon className="w-8 h-8 animate-icon-float" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-ink-primary)] mb-2 skeuo-embossed">
              Upload Resume
            </h3>
            <p className="text-[var(--color-ink-secondary)] mb-6 max-w-xs mx-auto">
              Add a new candidate resume to your collection for AI-powered matching.
            </p>
            <Link to="/resumes/upload">
              <Button size="lg">Upload Now</Button>
            </Link>
          </CardBody>
        </Card>

        <Card hover className="animate-fade-in delay-300">
          <CardBody className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-surface-sunken)] flex items-center justify-center text-[var(--color-accent-primary)] icon-container-soft">
              <BriefcaseIcon className="w-8 h-8 animate-icon-bob" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-ink-primary)] mb-2 skeuo-embossed">
              Create Job Listing
            </h3>
            <p className="text-[var(--color-ink-secondary)] mb-6 max-w-xs mx-auto">
              Post a new job opportunity to match against your resume database.
            </p>
            <Link to="/jobs/create">
              <Button size="lg">Create Job</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  )
}
