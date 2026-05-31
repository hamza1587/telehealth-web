import { useState, useCallback } from 'react'
import { apiClient } from '@shared/api/Client.ts'
import type { GDPRRequestForm } from '@shared/types/index.ts'
import type { DataRightRequest } from '@shared/types/dataRights.ts'

export function useGDPRRequests() {
  const [requests, setRequests] = useState<DataRightRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/platform/gdpr/requests')
      setRequests(res.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GDPR requests')
    } finally {
      setLoading(false)
    }
  }, [])

  const submitRequest = useCallback(async (form: GDPRRequestForm) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.post('/platform/gdpr/requests/submit', form)
      setRequests(prev => [res.request, ...prev])
      return { success: true, request: res.request }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit GDPR request')
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [])

  const exportData = useCallback(async () => {
    try {
      const res = await apiClient.get('/platform/gdpr/export')
      return res
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
      return null
    }
  }, [])

  const deleteAccount = useCallback(async (_reason: string) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.delete('/platform/auth/delete-account')
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    requests,
    loading,
    error,
    fetchRequests,
    submitRequest,
    exportData,
    deleteAccount,
  }
}