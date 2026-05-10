import { useState, useCallback } from 'react'
import { apiClient } from '@shared/api/Client.ts'
import type { ResearchStudy, ResearchEnrollmentForm } from '@shared/types/index.ts'

export function useResearchStudies() {
  const [studies, setStudies] = useState<ResearchStudy[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudies = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/platform/research/studies')
      setStudies(res.studies || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch research studies')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMyStudies = useCallback(async () => {
    try {
      const res = await apiClient.get('/platform/research/my-studies')
      return res.studies || []
    } catch {
      return []
    }
  }, [])

  const enrollInStudy = useCallback(async (studyId: string, form: ResearchEnrollmentForm) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.post(`/platform/research/studies/${studyId}/enroll`, form)
      setStudies(prev =>
        prev.map(s => s.id === studyId ? { ...s, isEnrolled: true } : s)
      )
      return { success: true, enrollment: res.enrollment }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll in study')
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [])

  const withdrawFromStudy = useCallback(async (studyId: string) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.post(`/platform/research/studies/${studyId}/withdraw`, {})
      setStudies(prev =>
        prev.map(s => s.id === studyId ? { ...s, isEnrolled: false } : s)
      )
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw from study')
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    studies,
    loading,
    error,
    fetchStudies,
    fetchMyStudies,
    enrollInStudy,
    withdrawFromStudy,
  }
}