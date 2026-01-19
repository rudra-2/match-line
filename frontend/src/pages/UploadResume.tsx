import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer, PageHeader } from '@/components/Layout'
import { Card, CardBody, CardFooter } from '@/components/Card'
import { Button } from '@/components/Button'
import { Input, TextArea } from '@/components/Input'
import { Alert } from '@/components/Alert'
import { useAppStore } from '@/stores/appStore'
import { apiClient } from '@/lib/api'

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
    <PageContainer className="max-w-2xl">
      <PageHeader
        title="Upload Resume"
        subtitle="Add a new resume to your collection"
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
                message="Resume uploaded successfully. Redirecting..."
              />
            )}

            <Input
              label="File Name"
              name="fileName"
              placeholder="e.g., john_doe_resume.txt"
              value={formData.fileName}
              onChange={handleChange}
              disabled={loading}
            />

            <TextArea
              label="Resume Content"
              name="rawText"
              placeholder="Paste or enter the resume text here..."
              value={formData.rawText}
              onChange={handleChange}
              rows={12}
              disabled={loading}
              helperText="Include all relevant experience, skills, and education"
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
              Upload Resume
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageContainer>
  )
}
