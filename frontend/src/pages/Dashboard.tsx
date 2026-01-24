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

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    resumes: 0,
    jobs: 0,
    matches: 0,
    avgScore: 0,
  })
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [recentResumes, setRecentResumes] = useState<any[]>([])
  const [recentJobs, setRecentJobs] = useState<any[]>([])
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
        setRecentResumes(resumesRes.data.slice(0, 3))
        setRecentJobs(jobsRes.data.slice(0, 3))
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
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <StatsCard
              title="Job Listings"
              value={stats.jobs}
              subtitle="Active positions"
              icon={
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatsCard
              title="Total Matches"
              value={stats.matches}
              subtitle="AI-scored pairs"
              icon={
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <StatsCard
              title="Average Score"
              value={`${stats.avgScore}%`}
              subtitle="Match quality"
              icon={
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
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
                    icon="📊"
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
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-sunken)] flex items-center justify-center text-xl">
                        📄
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-ink-muted)]">Backend API</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-ink-muted)]">AI Service</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-ink-muted)]">Database</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Scoring Formula */}
          <Card className="animate-fade-in delay-100">
            <CardBody>
              <h4 className="font-semibold text-[var(--color-ink-primary)] mb-4 skeuo-embossed">
                Scoring Formula
              </h4>
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-surface-sunken)] flex items-center justify-center text-3xl">
              📄
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-surface-sunken)] flex items-center justify-center text-3xl">
              💼
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
