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
  DocumentIcon,
  ClockIcon,
  UploadIcon,
  ChartIcon,
  BriefcaseIcon,
  ClipboardIcon,
  AwardIcon,
} from '@/components'

// Utilities
import { useAppStore } from '@/stores'
import { apiClient } from '@/lib'
import { formatDate, truncate } from '@/utils'

interface JobScoreHistoryItem {
  id: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  experienceGap: string
  summary: string
  scoredAt: string
  job: {
    id: string
    title: string
    description: string
    requirements: string
    createdAt: string
  }
}

export const Resumes: React.FC = () => {
  const { resumes, setResumes, removeResume, setError } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [selectedResume, setSelectedResume] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Score history state
  const [showScoresModal, setShowScoresModal] = useState(false)
  const [scoreHistoryResume, setScoreHistoryResume] = useState<any>(null)
  const [scoreHistory, setScoreHistory] = useState<JobScoreHistoryItem[]>([])
  const [loadingScores, setLoadingScores] = useState(false)
  
  // Job detail state
  const [showJobModal, setShowJobModal] = useState(false)
  const [selectedJobDetail, setSelectedJobDetail] = useState<any>(null)
  const [loadingJob, setLoadingJob] = useState(false)

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await apiClient.getAllResumes()
        setResumes(response.data)
      } catch (err) {
        setError(`Failed to fetch resumes: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    fetchResumes()
  }, [setResumes, setError])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    setDeleting(id)
    try {
      await apiClient.deleteResume(id)
      removeResume(id)
    } catch (err) {
      setError(`Failed to delete resume: ${err}`)
    } finally {
      setDeleting(null)
    }
  }

  const handleViewDetails = (resume: any) => {
    setSelectedResume(resume)
    setShowModal(true)
  }

  const handleViewScores = async (resume: any) => {
    setScoreHistoryResume(resume)
    setShowScoresModal(true)
    setLoadingScores(true)
    
    try {
      const response = await apiClient.getResumeScoreHistory(resume.id)
      setScoreHistory(response.data)
    } catch (err) {
      setError(`Failed to fetch score history: ${err}`)
    } finally {
      setLoadingScores(false)
    }
  }

  const handleViewJob = async (jobId: string) => {
    setShowJobModal(true)
    setLoadingJob(true)
    
    try {
      const response = await apiClient.getJob(jobId)
      setSelectedJobDetail(response.data)
    } catch (err) {
      setError(`Failed to fetch job: ${err}`)
    } finally {
      setLoadingJob(false)
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
        title="Resume Library"
        subtitle="Manage your candidate resume collection"
        action={
          <Link to="/resumes/upload">
            <Button
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Upload Resume
            </Button>
          </Link>
        }
      />

      {/* Resumes Grid */}
      {loading ? (
        <Grid cols={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <CardLoadingSkeleton key={i} />
          ))}
        </Grid>
      ) : resumes.length === 0 ? (
        <Card className="animate-fade-in">
          <CardBody className="py-12">
            <EmptyState
              icon={<DocumentIcon className="w-8 h-8 animate-icon-bob" />}
              title="No resumes uploaded yet"
              description="Start building your candidate database by uploading your first resume."
              action={
                <Link to="/resumes/upload">
                  <Button size="lg">Upload First Resume</Button>
                </Link>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <Grid cols={2}>
          {resumes.map((resume, index) => (
            <Card
              key={resume.id}
              hover
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` } as any}
            >
              <CardHeader
                title={resume.fileName}
                icon={<DocumentIcon className="w-5 h-5 icon-hover-scale" />}
                action={<Badge variant="success">Ready</Badge>}
              />

              <CardBody className="space-y-4">
                <div className="skeuo-sunken p-4 rounded-lg">
                  <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed line-clamp-3">
                    {truncate(resume.rawText, 150)}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-[var(--color-ink-muted)]">
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4" />
                    <span>{formatDate(resume.uploadedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    <span>{resume.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </CardBody>

              <CardFooter align="between">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(resume)}
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
                    onClick={() => handleViewScores(resume)}
                    leftIcon={<ChartIcon className="w-4 h-4" />}
                  >
                    Matches
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(resume.id)}
                  isLoading={deleting === resume.id}
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
      {selectedResume && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedResume.fileName}
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DocumentIcon className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h4 className="font-semibold text-[var(--color-ink-primary)]">Resume Content</h4>
              </div>
              <div className="skeuo-sunken skeuo-notebook p-4 max-h-80 overflow-y-auto">
                <p className="text-sm text-[var(--color-ink-secondary)] whitespace-pre-wrap leading-7">
                  {selectedResume.rawText}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="skeuo-sunken p-4 rounded-lg">
                <div className="flex items-center gap-2 text-[var(--color-ink-muted)] mb-1">
                  <UploadIcon className="w-4 h-4" />
                  <span>Uploaded</span>
                </div>
                <p className="font-medium text-[var(--color-ink-primary)]">
                  {formatDate(selectedResume.uploadedAt)}
                </p>
              </div>
              <div className="skeuo-sunken p-4 rounded-lg">
                <div className="flex items-center gap-2 text-[var(--color-ink-muted)] mb-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>Last Updated</span>
                </div>
                <p className="font-medium text-[var(--color-ink-primary)]">
                  {formatDate(selectedResume.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Job Matches Modal */}
      {scoreHistoryResume && (
        <Modal
          isOpen={showScoresModal}
          onClose={() => setShowScoresModal(false)}
          title={`Best Matches: ${scoreHistoryResume.fileName}`}
          size="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
              <ChartIcon className="w-4 h-4" />
              <span>Jobs ranked by match score (highest first)</span>
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
                <BriefcaseIcon className="w-12 h-12 mx-auto text-[var(--color-ink-muted)] mb-3" />
                <p className="text-[var(--color-ink-secondary)] font-medium">No matches yet</p>
                <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                  Score this resume against jobs to see matches here
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
                          <button
                            onClick={() => handleViewJob(item.job.id)}
                            className="font-semibold text-[var(--color-accent-primary)] hover:underline truncate text-left cursor-pointer"
                          >
                            {item.job.title}
                          </button>
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

      {/* Job Detail Modal */}
      <Modal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        title={selectedJobDetail?.title || 'Job Details'}
        size="lg"
      >
        {loadingJob ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : selectedJobDetail ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
              <ClockIcon className="w-4 h-4" />
              <span>Posted: {formatDate(selectedJobDetail.createdAt)}</span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <ClipboardIcon className="w-5 h-5 text-[var(--color-accent-primary)]" />
                <h4 className="font-semibold text-[var(--color-ink-primary)]">Job Description</h4>
              </div>
              <div className="skeuo-sunken p-4 rounded-lg">
                <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed whitespace-pre-wrap">
                  {selectedJobDetail.description}
                </p>
              </div>
            </div>

            {selectedJobDetail.requirements && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AwardIcon className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  <h4 className="font-semibold text-[var(--color-ink-primary)]">Requirements</h4>
                </div>
                <div className="skeuo-sunken p-4 rounded-lg">
                  <p className="text-sm text-[var(--color-ink-secondary)] leading-relaxed whitespace-pre-wrap">
                    {selectedJobDetail.requirements}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowJobModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  )
}
