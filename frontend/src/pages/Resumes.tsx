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

export const Resumes: React.FC = () => {
  const { resumes, setResumes, removeResume, error, setError } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [selectedResume, setSelectedResume] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

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

    try {
      await apiClient.deleteResume(id)
      removeResume(id)
    } catch (err) {
      setError(`Failed to delete resume: ${err}`)
    }
  }

  const handleViewDetails = (resume: any) => {
    setSelectedResume(resume)
    setShowModal(true)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Resumes"
        subtitle="Manage your resume collection"
        action={
          <Link to="/resumes/upload">
            <Button>+ Upload Resume</Button>
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
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-slate-500 text-lg mb-4">
              No resumes uploaded yet. Start by uploading one.
            </p>
            <Link to="/resumes/upload">
              <Button>Upload First Resume</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Grid cols={2}>
          {resumes.map((resume) => (
            <Card key={resume.id} hover>
              <CardHeader
                title={resume.fileName}
                action={
                  <Badge variant="primary">Ready</Badge>
                }
              />

              <CardBody className="space-y-3">
                <p className="text-sm text-slate-600">
                  {truncate(resume.rawText, 100)}
                </p>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>ID: {resume.id.slice(0, 12)}...</p>
                  <p>Uploaded: {formatDate(resume.uploadedAt)}</p>
                </div>
              </CardBody>

              <CardFooter align="between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(resume)}
                >
                  View Full
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(resume.id)}
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
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Content</h4>
              <div className="bg-slate-50 rounded p-4 max-h-64 overflow-y-auto">
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {selectedResume.rawText}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p>Uploaded: {formatDate(selectedResume.uploadedAt)}</p>
              <p>Updated: {formatDate(selectedResume.updatedAt)}</p>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}
