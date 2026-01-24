import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer, PageHeader } from '@/components/Layout'
import { Card, CardBody, CardFooter } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input, TextArea } from '@/components/Input'
import { Alert } from '@/components/Alert'
import { useAppStore } from '@/stores/appStore'
import { apiClient } from '@/lib/api'

export const CreateJob: React.FC = () => {
  const navigate = useNavigate()
  const { addJob, setError, error, clearError } = useAppStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
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

    if (!formData.title || !formData.description) {
      setError('Please fill in title and description')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.createJob({
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements || undefined,
      })

      addJob(response.data)
      setSuccess(true)
      setFormData({ title: '', description: '', requirements: '' })

      setTimeout(() => {
        navigate('/jobs')
      }, 1500)
    } catch (err) {
      setError(`Failed to create job: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="Create Job Listing"
        subtitle="Post a new position to match against candidates"
      />

      <Card className="animate-fade-in">
        <form onSubmit={handleSubmit}>
          <CardBody className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center gap-4 pb-6 border-b border-[var(--border-light)]">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-sunken)] flex items-center justify-center text-3xl">
                💼
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-ink-primary)] skeuo-embossed">
                  New Job Posting
                </h3>
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Define role requirements for AI-powered candidate matching
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
                message="Job created successfully. Redirecting to listings..."
              />
            )}

            <Input
              label="Job Title"
              name="title"
              placeholder="e.g., Senior Backend Engineer"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              helperText="Use a clear, descriptive title that candidates will recognize"
            />

            <TextArea
              label="Job Description"
              name="description"
              placeholder="Describe the role, responsibilities, and what makes this opportunity great...

Example:
We're looking for an experienced backend engineer to join our growing team. You'll work on:

• Building scalable microservices architecture
• Designing and implementing REST APIs
• Collaborating with cross-functional teams
• Mentoring junior developers

The ideal candidate has experience with distributed systems and a passion for clean code."
              value={formData.description}
              onChange={handleChange}
              rows={10}
              disabled={loading}
              notebook
            />

            <TextArea
              label="Required Skills & Qualifications"
              name="requirements"
              placeholder="List the must-have and nice-to-have qualifications...

Example:
Required:
• 5+ years of Node.js/TypeScript experience
• Strong PostgreSQL and database design skills
• Experience with Docker and containerization
• Excellent problem-solving abilities

Nice to have:
• Kubernetes experience
• AWS/GCP cloud experience
• Open source contributions"
              value={formData.requirements}
              onChange={handleChange}
              rows={8}
              disabled={loading}
              helperText="Optional: Specify skills, experience level, and certifications for better matching"
            />

            {/* Tips Section */}
            <div className="skeuo-sunken p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-info-light)] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[var(--color-info)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[var(--color-ink-primary)] text-sm mb-1">Matching Tip</p>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                    The AI analyzes both description and requirements to find the best candidates. Be specific about technical skills and years of experience needed for more accurate matches.
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
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Create Job
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageContainer>
  )
}
