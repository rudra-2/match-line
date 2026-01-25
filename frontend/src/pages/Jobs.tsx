import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// Components
import {
  PageContainer,
  PageHeader,
  Grid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Modal,
  Button,
  Badge,
  CardLoadingSkeleton,
  EmptyState,
  BriefcaseIcon,
  ClockIcon,
  AwardIcon,
  ClipboardIcon,
  ChartIcon,
} from '@/components'

// Utilities
import { useAppStore } from '@/stores'
import { apiClient } from '@/lib'
import { formatDate, truncate } from '@/utils'

interface ScoreHistoryItem {
  id: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  experienceGap: string
  summary: string
  scoredAt: string
  resume: {
    id: string
    fileName: string
    processedText: string
    createdAt: string
  }
}

export const Jobs: React.FC = () => {
  const { jobs, setJobs, removeJob, setError } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Score history state
  const [showScoresModal, setShowScoresModal] = useState(false)
  const [scoreHistoryJob, setScoreHistoryJob] = useState<any>(null)
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryItem[]>([])
  const [loadingScores, setLoadingScores] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await apiClient.getAllJobs()
        setJobs(response.data)
      } catch (err) {
        setError(`Failed to fetch jobs: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [setJobs, setError])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    setDeleting(id)
    try {
      await apiClient.deleteJob(id)
      removeJob(id)
    } catch (err) {
      setError(`Failed to delete job: ${err}`)
    } finally {
      setDeleting(null)
    }
  }

  const handleViewDetails = (job: any) => {
    setSelectedJob(job)
    setShowModal(true)
  }

  const handleViewScores = async (job: any) => {
    setScoreHistoryJob(job)
    setShowScoresModal(true)
    setLoadingScores(true)
    
    try {
      const response = await apiClient.getJobScoreHistory(job.id)
      setScoreHistory(response.data)
    } catch (err) {
      setError(`Failed to fetch score history: ${err}`)
    } finally {
      setLoadingScores(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    if (score >= 40) return 'bg-orange-100'
    return 'bg-red-100'
  }

  return (
    <PageContainer>
      <PageHeader
        title="Job Listings"
        subtitle="Manage your open positions and requirements"
        action={
          <Link to="/jobs/create">
            <Button
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Create Job
            </Button>
          </Link>
        }
      />

      {/* Jobs Grid */}
      {loading ? (
        <Grid cols={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <CardLoadingSkeleton key={i} />
          ))}
        </Grid>
      ) : jobs.length === 0 ? (
        <Card className="animate-fade-in">
          <CardBody className="py-12">
            <EmptyState
              icon={<BriefcaseIcon className="w-8 h-8 animate-icon-bob" />}
              title="No job listings yet"
              description="Create your first job posting to start matching candidates."
              action={
                <Link to="/jobs/create">
                  <Button size="lg">Create First Job</Button>
                </Link>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <Grid cols={2}>
          {jobs.map((job, index) => (
            <Card
              key={job.id}
              hover
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` } as any}
            >
              <CardHeader
                title={job.title}
                icon={<BriefcaseIcon className="w-5 h-5 icon-hover-scale" />}
                action={
                  <Badge variant="info" icon={
                    <span className="relative flex h-2 w-2 mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                    </span>
                  }>
                    Active
                  </Badge>
                }
              />

              <CardBody className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed">
                    {truncate(job.description, 120)}
                  </p>
                </div>

                {job.requirements && (
                  <div className="skeuo-sunken p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-2">
                      <AwardIcon className="w-3.5 h-3.5" />
                      <span>Required Skills</span>
                    </div>
                    <p className="text-sm text-[var(--color-ink-secondary)]">
                      {truncate(job.requirements, 80)}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-[var(--color-ink-muted)]">
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4" />
                    <span>Posted: {formatDate(job.createdAt)}</span>
                  </div>
                </div>
              </CardBody>

              <CardFooter align="between">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(job)}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  >
                    Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleViewScores(job)}
                    leftIcon={<ChartIcon className="w-4 h-4" />}
                  >
                    Scores
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(job.id)}
                  isLoading={deleting === job.id}
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
          ))}
        </Grid>
      )}

      {/* Details Modal */}
      {selectedJob && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedJob.title}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ClipboardIcon className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h4 className="font-semibold text-[var(--color-ink-primary)]">Job Description</h4>
              </div>
              <div className="skeuo-sunken p-4 rounded-lg">
                <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed whitespace-pre-wrap">
                  {selectedJob.description}
                </p>
              </div>
            </div>

            {selectedJob.requirements && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AwardIcon className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  <h4 className="font-semibold text-[var(--color-ink-primary)]">Requirements</h4>
                </div>
                <div className="skeuo-sunken p-4 rounded-lg">
                  <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed whitespace-pre-wrap">
                    {selectedJob.requirements}
                  </p>
                </div>
              </div>
            )}

            <div className="skeuo-sunken p-4 rounded-lg text-sm text-[var(--color-ink-muted)]">
              <div className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                <span>Posted on {formatDate(selectedJob.createdAt)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Score History Modal */}
      {scoreHistoryJob && (
        <Modal
          isOpen={showScoresModal}
          onClose={() => setShowScoresModal(false)}
          title={`Score History: ${scoreHistoryJob.title}`}
          size="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
              <ChartIcon className="w-4 h-4" />
              <span>Resumes ranked by match score (highest first)</span>
            </div>

            {loadingScores ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeuo-sunken p-4 rounded-lg animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : scoreHistory.length === 0 ? (
              <div className="skeuo-sunken p-8 rounded-lg text-center">
                <ChartIcon className="w-12 h-12 mx-auto text-[var(--color-ink-muted)] mb-3" />
                <p className="text-[var(--color-ink-secondary)] font-medium">No scores yet</p>
                <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                  Score resumes against this job to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {scoreHistory.map((item, index) => (
                  <div
                    key={item.id}
                    className="skeuo-sunken p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-[var(--color-ink-muted)]">
                            #{index + 1}
                          </span>
                          <h4 className="font-semibold text-[var(--color-ink-primary)] truncate">
                            {item.resume.fileName}
                          </h4>
                        </div>
                        
                        <p className="text-sm text-[var(--color-ink-secondary)] mb-3 line-clamp-2">
                          {item.summary}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.matchedSkills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="success" size="sm">
                              {skill}
                            </Badge>
                          ))}
                          {item.matchedSkills.length > 4 && (
                            <Badge variant="neutral" size="sm">
                              +{item.matchedSkills.length - 4} more
                            </Badge>
                          )}
                        </div>

                        {item.missingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 text-xs">
                            <span className="text-[var(--color-ink-muted)]">Missing:</span>
                            {item.missingSkills.slice(0, 3).map((skill) => (
                              <span key={skill} className="text-red-500">{skill}</span>
                            ))}
                            {item.missingSkills.length > 3 && (
                              <span className="text-[var(--color-ink-muted)]">
                                +{item.missingSkills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(item.matchScore)}`}>
                          {item.matchScore}%
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full mt-1 ${getScoreBg(item.matchScore)} ${getScoreColor(item.matchScore)}`}>
                          {item.experienceGap} gap
                        </div>
                        <div className="text-xs text-[var(--color-ink-muted)] mt-2">
                          {formatDate(item.scoredAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}
