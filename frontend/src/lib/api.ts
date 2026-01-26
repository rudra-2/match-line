/// <reference types="vite/client" />
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Request interceptor
api.interceptors.request.use((config) => {
  console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✓ ${response.status} from ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`✗ API Error: ${error.message}`)
    return Promise.reject(error)
  }
)

export const apiClient = {
  // Health
  checkHealth: () => api.get('/health'),

  // Resumes
  uploadResume: (data: {
    fileName: string
    rawText: string
    processedText: string
  }) => api.post('/resumes/upload', data),
  getAllResumes: () => api.get('/resumes'),
  getResume: (id: string) => api.get(`/resumes/${id}`),
  deleteResume: (id: string) => api.delete(`/resumes/${id}`),

  // Jobs
  createJob: (data: {
    title: string
    description: string
    requirements?: string
  }) => api.post('/jobs/create', data),
  getAllJobs: () => api.get('/jobs'),
  getJob: (id: string) => api.get(`/jobs/${id}`),
  deleteJob: (id: string) => api.delete(`/jobs/${id}`),

  // Matches
  scoreMatch: (data: { resumeId: string; jobId: string }, force: boolean = false) =>
    api.post(`/match/score${force ? '?force=true' : ''}`, data),
  batchScore: (data: { resumeIds: string[]; jobIds: string[] }) =>
    api.post('/match/batch-score', data),
  getAllMatches: (resumeId?: string, jobId?: string) =>
    api.get('/match', { params: { resumeId, jobId } }),
  getJobScoreHistory: (jobId: string) => api.get(`/match/job/${jobId}/scores`),
  getMatch: (id: string) => api.get(`/match/${id}`),
  deleteMatch: (id: string) => api.delete(`/match/${id}`),
}
