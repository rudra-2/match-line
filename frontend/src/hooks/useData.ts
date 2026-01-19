import { useEffect } from 'react'
import { useAppStore } from '@/stores/appStore'
import { apiClient } from '@/lib/api'

export const useResumes = () => {
  const { resumes, loading, setResumes, setLoading, setError } = useAppStore()

  const fetchResumes = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getAllResumes()
      setResumes(response.data)
    } catch (error) {
      setError(`Failed to fetch resumes: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  return { resumes, loading, refetch: fetchResumes }
}

export const useJobs = () => {
  const { jobs, loading, setJobs, setLoading, setError } = useAppStore()

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getAllJobs()
      setJobs(response.data)
    } catch (error) {
      setError(`Failed to fetch jobs: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  return { jobs, loading, refetch: fetchJobs }
}

export const useMatches = () => {
  const { matches, loading, setMatches, setLoading, setError } = useAppStore()

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getAllMatches()
      setMatches(response.data)
    } catch (error) {
      setError(`Failed to fetch matches: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  return { matches, loading, refetch: fetchMatches }
}
