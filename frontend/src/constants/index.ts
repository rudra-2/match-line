/**
 * Application Constants
 * Centralized configuration values and constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const

// Score Thresholds
export const SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  FAIR: 40,
  POOR: 0,
} as const

// Score Colors
export const SCORE_COLORS = {
  excellent: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  good: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  fair: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  poor: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
} as const

// Navigation Items
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'home' },
  { path: '/resumes', label: 'Resumes', icon: 'document' },
  { path: '/jobs', label: 'Jobs', icon: 'briefcase' },
  { path: '/matches', label: 'Matches', icon: 'chart' },
] as const

// Quick Actions
export const QUICK_ACTIONS = [
  { path: '/resumes/upload', label: 'Upload Resume', icon: 'plus' },
  { path: '/jobs/create', label: 'Create Job', icon: 'plus' },
] as const

// Status Configurations
export const STATUS_CONFIG = {
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'neutral', label: 'Inactive' },
  pending: { variant: 'warning', label: 'Pending' },
  completed: { variant: 'info', label: 'Completed' },
} as const

// Animation Durations (ms)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  VERY_SLOW: 500,
} as const

// Breakpoints (px)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'match-line-theme',
  USER_PREFERENCES: 'match-line-preferences',
  RECENT_SEARCHES: 'match-line-searches',
} as const

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const
