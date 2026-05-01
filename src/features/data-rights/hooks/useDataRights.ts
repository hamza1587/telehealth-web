import { useState, useEffect } from 'react'
import { apiBaseUrl } from '@shared/config/patient.ts'
import type { DataRightRequest, DataRightForm } from '@shared/types/dataRights.ts'

export function useDataRights(userId: string | null) {
  const [requests, setRequests] = useState<DataRightRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch data right requests
  useEffect(() => {
    if (!userId) return

    const fetchRequests = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiBaseUrl}/gdpr/my-data-summary`)
        if (!response.ok) {
          throw new Error('Failed to fetch data rights requests')
        }
        const data = await response.json()
        setRequests(data.requests || [])
      } catch (err) {
        console.error('[API Error] Failed to fetch data rights requests:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          endpoint: `/platform/users/${userId}/data-rights`
        })
        setError(err instanceof Error ? err.message : 'Failed to load requests')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [userId])

  // Submit data right request
  const submitRequest = async (form: DataRightForm) => {
    if (!userId) return null

    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/gdpr/export-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...form,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit request')
      }

      const data = await response.json()
      setRequests(prev => [data.request, ...prev])
      return data.request
    } catch (err) {
      console.error('[API Error] Failed to submit data rights request:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: '/platform/data-rights'
      })
      setError(err instanceof Error ? err.message : 'Failed to submit request')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  // Download data export
  const downloadData = async () => {
    if (!userId) return null

    try {
      const response = await fetch(`${apiBaseUrl}/gdpr/export-request`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate data export')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-health-data.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('[API Error] Failed to download data export:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/users/${userId}/data-export`
      })
      setError(err instanceof Error ? err.message : 'Failed to download data')
    }
  }

  return {
    requests,
    loading,
    error,
    submitting,
    submitRequest,
    downloadData,
  }
}