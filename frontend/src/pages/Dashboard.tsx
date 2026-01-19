import { useEffect, useState } from 'react'
import { PageContainer, PageHeader } from '@/components/Layout'
import { Card, CardBody } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { useAppStore } from '@/stores/appStore'
import { apiClient } from '@/lib/api'
import { formatDate } from '@/utils/formatting'
import { Link } from 'react-router-dom'

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    resumes: 0,
    jobs: 0,
    matches: 0,
    avgScore: 0,
  })
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const { error, setError } = useAppStore()

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [resumesRes, jobsRes, matchesRes] = await Promise.all([
          apiClient.getAllResumes(),
          apiClient.getAllJobs(),
          apiClient.getAllMatches(),
        ])

        const matches = matchesRes.data
        const avgScore =
          matches.length > 0
            ? Math.round(
                matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length
              )
            : 0

        setStats({
          resumes: resumesRes.data.length,
          jobs: jobsRes.data.length,
          matches: matches.length,
          avgScore,
        })

        setRecentMatches(matches.slice(0, 5))
      } catch (error) {
        setError(`Failed to load dashboard: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [setError])

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your matching overview."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8 md:grid-cols-1">
        <Card className="hover:shadow-lg hover:border-slate-300 transition-all">
          <CardBody className="text-center py-6">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {stats.resumes}
            </div>
            <p className="text-slate-600 font-medium">Resumes</p>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg hover:border-slate-300 transition-all">
          <CardBody className="text-center py-6">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {stats.jobs}
            </div>
            <p className="text-slate-600 font-medium">Job Listings</p>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg hover:border-slate-300 transition-all">
          <CardBody className="text-center py-6">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {stats.matches}
            </div>
            <p className="text-slate-600 font-medium">Matches</p>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg hover:border-slate-300 transition-all">
          <CardBody className="text-center py-6">
            <div className="text-4xl font-bold text-primary-600 mb-2">
              {stats.avgScore}%
            </div>
            <p className="text-slate-600 font-medium">Avg Score</p>
          </CardBody>
        </Card>
      </div>

      {/* Recent Matches */}
      <Card className="mb-8">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Matches
          </h3>
          <Link to="/matches">
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="p-6 text-center text-slate-500">Loading...</div>
          ) : recentMatches.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              No matches yet. Start by uploading resumes and creating job listings.
            </div>
          ) : (
            recentMatches.map((match: any) => (
              <div
                key={match.id}
                className="px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      Resume vs Job
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {formatDate(match.scoredAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {match.matchScore}%
                    </div>
                    <Badge variant="success" className="mt-1">
                      {match.experienceGap}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-1">
        <Card>
          <CardBody className="text-center py-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Upload Resume
            </h3>
            <Link to="/resumes">
              <Button className="w-full">Get Started</Button>
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center py-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Create Job
            </h3>
            <Link to="/jobs">
              <Button className="w-full">Get Started</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  )
}
