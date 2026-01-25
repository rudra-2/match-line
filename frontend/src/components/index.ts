/**
 * Components - Main barrel export for all components
 *
 * Usage:
 * import { Button, Card, Alert } from '@/components'
 *
 * Or import from specific categories:
 * import { Button, Input } from '@/components/ui'
 * import { Card, Modal } from '@/components/layout'
 * import { Alert, Spinner } from '@/components/feedback'
 * import { DocumentIcon } from '@/components/Icons'
 * import { MatchScoreDisplay } from '@/components/display'
 */

// UI Components - Atomic elements
export * from './ui'

// Layout Components - Page structure
export * from './Layout'
export * from './Card'
export * from './Modal'
export * from './Navbar'

// Feedback Components - Status and loading
export * from './feedback'

// Icons
export * from './Icons'

// Display Components - Domain-specific displays
export * from './display'
