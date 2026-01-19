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
    <PageContainer className="max-w-2xl">
      <PageHeader
        title="Create Job Listing"
        subtitle="Post a new job opportunity"
      />

      <Card>
        <form onSubmit={handleSubmit}>
          <CardBody className="space-y-6">
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
                message="Job created successfully. Redirecting..."
              />
            )}

            <Input
              label="Job Title"
              name="title"
              placeholder="e.g., Senior Backend Engineer"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />

            <TextArea
              label="Job Description"
              name="description"
              placeholder="Describe the role, responsibilities, and expectations..."
              value={formData.description}
              onChange={handleChange}
              rows={8}
              disabled={loading}
            />

            <TextArea
              label="Required Skills & Experience"
              name="requirements"
              placeholder="List the required qualifications and skills..."
              value={formData.requirements}
              onChange={handleChange}
              rows={6}
              disabled={loading}
              helperText="Optional: Include skills, experience level, and certifications"
            />
          </CardBody>

          <CardFooter align="right">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
            >
              Create Job
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageContainer>
  )
}
