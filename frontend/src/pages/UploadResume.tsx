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
  DocumentIcon,
  BrainIcon,
  UploadIcon,
} from '@/components'

// Utilities
import { useAppStore } from '@/stores'
import { apiClient } from '@/lib'

type UploadMode = 'file' | 'text'

export const UploadResume: React.FC = () => {
  const navigate = useNavigate()
  const { addResume, setError, error, clearError } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadMode, setUploadMode] = useState<UploadMode>('file')
  const [formData, setFormData] = useState({
    fileName: '',
    rawText: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const allowedExtensions = ['pdf', 'docx', 'txt', 'tex']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateFile = (file: File): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !allowedExtensions.includes(ext)) {
      setError(`Invalid file type. Allowed: ${allowedExtensions.join(', ').toUpperCase()}`)
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB')
      return false
    }
    return true
  }

  const handleFileSelect = (file: File) => {
    clearError()
    if (validateFile(file)) {
      setSelectedFile(file)
    }
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (uploadMode === 'file') {
      if (!selectedFile) {
        setError('Please select a file to upload')
        return
      }

      setLoading(true)
      try {
        const response = await apiClient.uploadResumeFile(selectedFile)
        addResume(response.data)
        setSuccess(true)
        setSelectedFile(null)

        setTimeout(() => {
          navigate('/resumes')
        }, 1500)
      } catch (err: any) {
        setError(err.response?.data?.message || `Failed to upload file: ${err.message}`)
      } finally {
        setLoading(false)
      }
    } else {
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
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return '📄'
      case 'docx':
        return '📝'
      case 'tex':
        return '📐'
      default:
        return '📃'
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
                  Upload a file or paste text for AI-powered analysis
                </p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-[var(--color-surface-sunken)] rounded-lg">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  uploadMode === 'file'
                    ? 'bg-white shadow text-[var(--color-ink-primary)]'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink-primary)]'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <UploadIcon className="w-4 h-4" />
                  Upload File
                </span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('text')}
                className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  uploadMode === 'text'
                    ? 'bg-white shadow text-[var(--color-ink-primary)]'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink-primary)]'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <DocumentIcon className="w-4 h-4" />
                  Paste Text
                </span>
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
                message="Resume uploaded and text extracted successfully. Redirecting..."
              />
            )}

            {/* File Upload Mode */}
            {uploadMode === 'file' && (
              <>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                    transition-all duration-200
                    ${dragActive
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5'
                      : 'border-[var(--border-medium)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-sunken)]'
                    }
                    ${selectedFile ? 'bg-[var(--color-success-light)] border-[var(--color-success)]' : ''}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.tex"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="text-4xl">{getFileIcon(selectedFile.name)}</div>
                      <div>
                        <p className="font-semibold text-[var(--color-ink-primary)]">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-[var(--color-ink-muted)]">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFile(null)
                        }}
                        className="text-sm text-[var(--color-error)] hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-surface-sunken)] flex items-center justify-center">
                        <UploadIcon className="w-8 h-8 text-[var(--color-ink-muted)]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--color-ink-primary)]">
                          Drop your resume here or click to browse
                        </p>
                        <p className="text-sm text-[var(--color-ink-muted)] mt-1">
                          Supports PDF, DOCX, TXT, LaTeX (.tex)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* File Upload Info */}
                <div className="skeuo-sunken p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-info-light)] flex items-center justify-center flex-shrink-0">
                      <BrainIcon className="w-4 h-4 text-[var(--color-info)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-ink-primary)] text-sm mb-1">
                        Smart Text Extraction
                      </p>
                      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                        We extract all text including phone numbers, emails, LinkedIn/GitHub links, 
                        and hidden hyperlinks. Only the extracted text is stored - the original file 
                        is never saved.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Text Input Mode */}
            {uploadMode === 'text' && (
              <>
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
Phone: +1 (555) 123-4567
Email: john.doe@email.com
LinkedIn: linkedin.com/in/johndoe

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
                        For best AI matching results, include detailed skill descriptions, years of 
                        experience for each technology, and specific project accomplishments.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
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
              {uploadMode === 'file' ? 'Upload & Extract' : 'Upload Resume'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </PageContainer>
  )
}
