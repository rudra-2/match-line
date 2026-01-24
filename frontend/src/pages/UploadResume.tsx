import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer, PageHeader } from '@/components/Layout'
import { Card, CardBody, CardFooter } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input, TextArea } from '@/components/Input'
import { Alert } from '@/components/Alert'
import { useAppStore } from '@/stores/appStore'
import { apiClient } from '@/lib/api'
import { DocumentIcon, BrainIcon, UploadIcon } from '@/components/Icons'

export const UploadResume: React.FC = () => {
  const navigate = useNavigate()
  const { addResume, setError, error, clearError } = useAppStore()
  const [formData, setFormData] = useState({
    fileName: '',
    rawText: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!formData.fileName || !formData.rawText) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.uploadResume({
        fileName: formData.fileName,
        rawText: formData.rawText,
        processedText: formData.rawText,
      })

      addResume(response.data)
      setSuccess(true)
      setFormData({ fileName: '', rawText: '' })

      setTimeout(() => {
        navigate('/resumes')
      }, 1500)
    } catch (err) {
      setError(`Failed to upload resume: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="Upload Resume"
        subtitle="Add a new candidate resume to your collection"
      />

      <Card className="animate-fade-in">
        <form onSubmit={handleSubmit}>
          <CardBody className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center gap-4 pb-6 border-b border-[var(--border-light)]">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-sunken)] flex items-center justify-center text-[var(--color-accent-primary)]">
                <DocumentIcon className="w-8 h-8 animate-icon-bob" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-ink-primary)] skeuo-embossed">
                  New Resume Entry
                </h3>
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Paste the resume text for AI-powered analysis
                </p>
              </div>
            </div>

            {error && (
              <Alert
                variant="error"
                message={error}
                onClose={clearError}
              />
            )}

            {success && (
              <Alert
                variant="success"
                title="Success!"
                message="Resume uploaded successfully. Redirecting to library..."
              />
            )}

            <Input
              label="Resume Title"
              name="fileName"
              placeholder="e.g., John_Doe_Senior_Developer.txt"
              value={formData.fileName}
              onChange={handleChange}
              disabled={loading}
              leftIcon={<DocumentIcon className="w-5 h-5" />}
              helperText="Give this resume a descriptive name for easy identification"
            />

            <TextArea
              label="Resume Content"
              name="rawText"
              placeholder="Paste the complete resume text here...

Example:
John Doe
Senior Software Developer

Experience:
- 5+ years in Node.js and TypeScript
- Built distributed systems at scale
- Led team of 5 engineers

Skills:
JavaScript, Python, AWS, Docker, PostgreSQL..."
              value={formData.rawText}
              onChange={handleChange}
              rows={14}
              disabled={loading}
              notebook
              helperText="Include all relevant experience, skills, education, and certifications"
            />

            {/* Tips Section */}
            <div className="skeuo-sunken p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-info-light)] flex items-center justify-center flex-shrink-0">
                  <BrainIcon className="w-4 h-4 text-[var(--color-info)] animate-icon-pulse" />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-ink-primary)] text-sm mb-1">Pro Tip</p>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                    For best AI matching results, include detailed skill descriptions, years of experience for each technology, and specific project accomplishments.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>

          <CardFooter align="right">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              leftIcon={<UploadIcon className="w-4 h-4" />}
            >
              Upload Resume
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageContainer>
  )
}
