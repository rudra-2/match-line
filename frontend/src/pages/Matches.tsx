import { useEffect, useState } from 'react'
import { PageContainer, PageHeader, Grid } from '@/components/Layout'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { CardLoadingSkeleton } from '@/components/LoadingSkeleton'
import { useAppStore } from '@/stores/appStore'
import { apiClient } from '@/lib/api'
import { formatDate, truncate } from '@/utils/formatting'
import { Link } from 'react-router-dom'

export const Matches: React.FC = () => {
  const { matches, setMatches, removeMatch, error, setError } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await apiClient.getAllMatches()
        setMatches(response.data)
      } catch (err) {
        setError(`Failed to fetch matches: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [setMatches, setError])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return

    try {
      await apiClient.deleteMatch(id)
      removeMatch(id)
    } catch (err) {
      setError(`Failed to delete match: ${err}`)
    }
  }

  const filteredMatches = matches.filter((m) => {
    if (filter === 'high') return m.matchScore >= 80
    if (filter === 'medium') return m.matchScore >= 60 && m.matchScore < 80
    if (filter === 'low') return m.matchScore < 60
    return true
  })

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'primary'
    if (score >= 40) return 'warning'
    return 'error'
  }

  return (
    <PageContainer>
      <PageHeader
        title="Match Results"
        subtitle="View all scoring results between resumes and jobs"
        action={
          <Link to="/">
            <Button>← Back</Button>
          </Link>
        }
      />

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {(['all', 'high', 'medium', 'low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            {f === 'all'
              ? 'All'
              : f === 'high'
                ? 'High (80+)'
                : f === 'medium'
                  ? 'Medium (60-80)'
                  : 'Low (<60)'}
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      {loading ? (
        <Grid cols={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <CardLoadingSkeleton key={i} />
          ))}
        </Grid>
      ) : filteredMatches.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-slate-500 text-lg">
              {matches.length === 0
                ? 'No matches yet. Score a resume against a job to get started.'
                : 'No matches found for the selected filter.'}
            </p>
            <Link to="/">
              <Button className="mt-4">Start Matching</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Grid cols={2} gap="md">
          {filteredMatches.map((match) => (
            <Card key={match.id} hover>
              <CardHeader
                title={`Match ${match.id.slice(0, 8)}`}
                action={
                  <Badge variant={getScoreBadgeVariant(match.matchScore)}>
                    {match.matchScore}%
                  </Badge>
                }
              />

              <CardBody className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Experience Gap
                  </p>
                  <p className="text-slate-600">{match.experienceGap}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Summary
                  </p>
                  <p className="text-sm text-slate-600">
                    {truncate(match.summary, 80)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Matched Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {match.matchedSkills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="success">
                        {skill}
                      </Badge>
                    ))}
                    {match.matchedSkills.length > 3 && (
                      <Badge variant="neutral">
                        +{match.matchedSkills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  {formatDate(match.scoredAt)}
                </p>
              </CardBody>

              <CardFooter align="right">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(match.id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </Grid>
      )}
    </PageContainer>
  )
}
