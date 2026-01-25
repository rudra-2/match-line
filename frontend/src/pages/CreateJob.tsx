import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// Components
import {
  PageContainer,
  PageHeader,
  Card,
  CardBody,
  CardFooter,
  Button,
  Input,
  TextArea,
  Alert,
  BriefcaseIcon,
  BrainIcon,
  PlusIcon,
  DocumentIcon,
  EditIcon,
  UploadIcon,
} from '@/components'

// Utilities
import { useAppStore } from '@/stores'
import { apiClient } from '@/lib'

type InputMode = 'text' | 'file'

export const CreateJob: React.FC = () => {
  const navigate = useNavigate()
  const { addJob, setError, error, clearError } = useAppStore()
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/x-tex',
      'application/x-latex',
    ]
    const validExtensions = ['.pdf', '.docx', '.txt', '.tex']
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      setError('Invalid file type. Please upload PDF, DOCX, TXT, or LaTeX files.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.')
      return
    }

    clearError()
    setSelectedFile(file)
    // Pre-fill title from filename
    if (!formData.title) {
      setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (inputMode === 'file') {
      if (!selectedFile) {
        setError('Please select a file to upload')
        return
      }
      if (!formData.title) {
        setError('Please enter a job title')
        return
      }
    } else {
      if (!formData.title || !formData.description) {
        setError('Please fill in title and description')
        return
      }
    }

    setLoading(true)
    try {
      let response
      if (inputMode === 'file' && selectedFile) {
        response = await apiClient.uploadJobFile(selectedFile, formData.title)
      } else {
        response = await apiClient.createJob({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements || undefined,
        })
      }

      addJob(response.data)
      setSuccess(true)
      setFormData({ title: '', description: '', requirements: '' })
      setSelectedFile(null)

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
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-sunken)] flex items-center justify-center text-[var(--color-accent-primary)]">
                <BriefcaseIcon className="w-8 h-8 animate-icon-bob" />
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

            {/* Input Mode Toggle */}
            <div className="flex gap-2 p-1 bg-[var(--color-surface-sunken)] rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${inputMode === 'text'
                    ? 'bg-[var(--color-surface)] text-[var(--color-ink-primary)] shadow-sm'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink-primary)]'
                  }
                `}
              >
                <EditIcon className="w-4 h-4" />
                Enter Text
              </button>
              <button
                type="button"
                onClick={() => setInputMode('file')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${inputMode === 'file'
                    ? 'bg-[var(--color-surface)] text-[var(--color-ink-primary)] shadow-sm'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink-primary)]'
                  }
                `}
              >
                <UploadIcon className="w-4 h-4" />
                Upload File
              </button>
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

            {/* Job Title - Always shown */}
            <Input
              label="Job Title"
              name="title"
              placeholder="e.g., Senior Backend Engineer"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              leftIcon={<BriefcaseIcon className="w-5 h-5" />}
              helperText="Use a clear, descriptive title that candidates will recognize"
            />

            {/* File Upload Mode */}
            {inputMode === 'file' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-[var(--color-ink-primary)]">
                  Upload Job Description File
                </label>
                <div
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                    ${dragActive
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5'
                      : selectedFile
                        ? 'border-[var(--color-success)] bg-[var(--color-success)]/5'
                        : 'border-[var(--border-medium)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-sunken)]'
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.tex"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center">
                        <DocumentIcon className="w-8 h-8 text-[var(--color-success)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-ink-primary)]">{selectedFile.name}</p>
                        <p className="text-sm text-[var(--color-ink-muted)]">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFile(null)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-[var(--color-surface-sunken)] flex items-center justify-center">
                        <DocumentIcon className="w-8 h-8 text-[var(--color-ink-muted)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-ink-primary)]">
                          Drop file here or click to browse
                        </p>
                        <p className="text-sm text-[var(--color-ink-muted)]">
                          PDF, DOCX, TXT, or LaTeX • Max 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text Input Mode */}
            {inputMode === 'text' && (
              <>
                <TextArea
                  label="Job Description"
                  name="description"
                  placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={10}
                  disabled={loading}
                  notebook
                />

                <TextArea
                  label="Required Skills & Qualifications"
                  name="requirements"
                  placeholder="List the must-have and nice-to-have qualifications..."
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={8}
                  disabled={loading}
                  helperText="Optional: Specify skills, experience level, and certifications for better matching"
                />
              </>
            )}

            {/* Tips Section */}
            <div className="skeuo-sunken p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-info-light)] flex items-center justify-center flex-shrink-0">
                  <BrainIcon className="w-4 h-4 text-[var(--color-info)] animate-icon-pulse" />
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
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Create Job
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageContainer>
  )
}
