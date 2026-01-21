import { useEffect, useState } from 'react'
import { PageContainer, PageHeader, Grid } from '@/components/Layout'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Modal } from '@/components/Modal'
import { CardLoadingSkeleton } from '@/components/LoadingSkeleton'
import { useAppStore } from '@/stores/appStore'
import { apiClient } from '@/lib/api'
import { formatDate, truncate } from '@/utils/formatting'
import { Link } from 'react-router-dom'

export const Jobs: React.FC = () => {
  const { jobs, setJobs, removeJob, error, setError } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

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

    try {
      await apiClient.deleteJob(id)
      removeJob(id)
    } catch (err) {
      setError(`Failed to delete job: ${err}`)
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
        subtitle="Manage your job postings"
        action={
          <Link to="/jobs/create">
            <Button>+ New Job</Button>
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
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-slate-500 text-lg mb-4">
              No job listings yet. Create one to get started.
            </p>
            <Link to="/jobs/create">
              <Button>Create First Job</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Grid cols={2}>
          {jobs.map((job) => (
            <Card key={job.id} hover>
              <CardHeader
                title={job.title}
                action={
                  <Badge variant="primary">
                    {job.createdAt ? 'Active' : 'Draft'}
                  </Badge>
                }
              />

              <CardBody className="space-y-3">
                <p className="text-sm text-slate-600">
                  {truncate(job.description, 100)}
                </p>

                {job.requirements && (
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-1">
                      Skills Required
                    </p>
                    <p className="text-xs text-slate-600">
                      {truncate(job.requirements, 80)}
                    </p>
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-4">
                  Posted: {formatDate(job.createdAt)}
                </p>
              </CardBody>

              <CardFooter align="between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(job)}
                >
                  View Details
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(job.id)}
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
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {selectedJob.description}
              </p>
            </div>

            {selectedJob.requirements && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Requirements
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {selectedJob.requirements}
                </p>
              </div>
            )}

            <div className="text-xs text-slate-500">
              Created: {formatDate(selectedJob.createdAt)}
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}
