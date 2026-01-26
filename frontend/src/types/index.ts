/**
 * Shared Type Definitions
 * Common interfaces and types used across the application
 */

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// Resume Types
export interface Resume {
  id: string
  name: string
  email: string
  phone?: string
  content: string
  skills: string[]
  experience: string[]
  education: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateResumeInput {
  name: string
  email: string
  phone?: string
  content: string
}

// Job Types
export interface Job {
  id: string
  title: string
  company: string
  description: string
  requirements: string[]
  skills: string[]
  experienceLevel: string
  location?: string
  salary?: string
  status: 'active' | 'inactive' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface CreateJobInput {
  title: string
  company: string
  description: string
  requirements?: string[]
  skills?: string[]
  experienceLevel?: string
  location?: string
  salary?: string
}

// Match Types
export interface Match {
  id: string
  resumeId: string
  jobId: string
  resume?: Resume
  job?: Job
  matchScore: number
  skillsMatched: string[]
  skillsGap: string[]
  experienceGap: string
  summary: string
  createdAt: string
}

export interface ScoreRequest {
  resumeId: string
  jobId: string
}

export interface MatchResult {
  match_score: number
  skills_matched: string[]
  skills_gap: string[]
  experience_gap: string
  summary: string
}

// Component Common Props
export interface BaseProps {
  className?: string
  children?: React.ReactNode
}

// Status Types
export type Status = 'active' | 'inactive' | 'pending' | 'completed'
export type AlertVariant = 'success' | 'warning' | 'error' | 'info'
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type Size = 'sm' | 'md' | 'lg'
