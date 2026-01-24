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

export const Resumes: React.FC = () => {
  const { resumes, setResumes, removeResume, error, setError } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [selectedResume, setSelectedResume] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

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
              icon="📄"
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
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
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
                  View Full
                </Button>
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
                <svg className="w-5 h-5 text-[var(--color-accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
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
                <p className="text-[var(--color-ink-muted)] mb-1">Uploaded</p>
                <p className="font-medium text-[var(--color-ink-primary)]">
                  {formatDate(selectedResume.uploadedAt)}
                </p>
              </div>
              <div className="skeuo-sunken p-4 rounded-lg">
                <p className="text-[var(--color-ink-muted)] mb-1">Last Updated</p>
                <p className="font-medium text-[var(--color-ink-primary)]">
                  {formatDate(selectedResume.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}
