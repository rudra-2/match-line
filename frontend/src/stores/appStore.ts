import { create } from 'zustand'

interface Resume {
  id: string
  fileName: string
  rawText: string
  processedText?: string
  uploadedAt: Date
  updatedAt: Date
}

interface Job {
  id: string
  title: string
  description: string
  requirements?: string
  createdAt: Date
  updatedAt: Date
}

interface Match {
  id: string
  resumeId: string
  jobId: string
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  experienceGap: string
  summary: string
  scoredAt: Date
}

interface AppStore {
  resumes: Resume[]
  jobs: Job[]
  matches: Match[]
  selectedResume: Resume | null
  selectedJob: Job | null
  loading: boolean
  error: string | null

  // Resume actions
  setResumes: (resumes: Resume[]) => void
  addResume: (resume: Resume) => void
  setSelectedResume: (resume: Resume | null) => void
  removeResume: (id: string) => void

  // Job actions
  setJobs: (jobs: Job[]) => void
  addJob: (job: Job) => void
  setSelectedJob: (job: Job | null) => void
  removeJob: (id: string) => void

  // Match actions
  setMatches: (matches: Match[]) => void
  addMatch: (match: Match) => void
  removeMatch: (id: string) => void

  // UI actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  resumes: [],
  jobs: [],
  matches: [],
  selectedResume: null,
  selectedJob: null,
  loading: false,
  error: null,

  setResumes: (resumes) => set({ resumes }),
  addResume: (resume) =>
    set((state) => ({ resumes: [resume, ...state.resumes] })),
  setSelectedResume: (resume) => set({ selectedResume: resume }),
  removeResume: (id) =>
    set((state) => ({
      resumes: state.resumes.filter((r) => r.id !== id),
    })),

  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  setSelectedJob: (job) => set({ selectedJob: job }),
  removeJob: (id) =>
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== id),
    })),

  setMatches: (matches) => set({ matches }),
  addMatch: (match) =>
    set((state) => ({ matches: [match, ...state.matches] })),
  removeMatch: (id) =>
    set((state) => ({
      matches: state.matches.filter((m) => m.id !== id),
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
