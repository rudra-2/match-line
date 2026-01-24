import { useEffect, useState } from 'react'
import { PageContainer, PageHeader, Grid } from '@/components/Layout'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { CardLoadingSkeleton } from '@/components/LoadingSkeleton'
import { EmptyState } from '@/components/Alert'
import { useAppStore } from '@/stores/appStore'
import { apiClient } from '@/lib/api'
import { formatDate, truncate } from '@/utils/formatting'
import { Link } from 'react-router-dom'

export const Jobs: React.FC = () => {
  const { jobs, setJobs, removeJob, error, setError } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

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
              icon="💼"
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
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
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
                    <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-2">
                      Required Skills
                    </p>
                    <p className="text-sm text-[var(--color-ink-secondary)]">
                      {truncate(job.requirements, 80)}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-[var(--color-ink-muted)]">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Posted: {formatDate(job.createdAt)}</span>
                  </div>
                </div>
              </CardBody>

              <CardFooter align="between">
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
                  View Details
                </Button>
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
                <svg className="w-5 h-5 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
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
                  <svg className="w-5 h-5 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Posted on {formatDate(selectedJob.createdAt)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}
