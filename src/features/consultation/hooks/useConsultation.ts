import { useState, useEffect, useCallback } from 'react'
import { apiBaseUrl } from '@shared/config/patient.ts'
import type { ConsultationSession, SessionTokenResponse } from '@shared/types/consultation.ts'

export function useConsultation(appointmentId: string | null) {
  const [session, setSession] = useState<ConsultationSession | null>(null)
  const [sessionToken, setSessionToken] = useState<SessionTokenResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [billableSeconds, setBillableSeconds] = useState(0)

  // Fetch session details
  useEffect(() => {
    if (!appointmentId) return

    const fetchSession = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiBaseUrl}/consultations/${appointmentId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch session')
        }
        const data = await response.json()
        setSession(data.session)
      } catch (err) {
        console.error('[API Error] Failed to fetch consultation session:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          endpoint: `/platform/appointments/${appointmentId}/session`
        })
        setError(err instanceof Error ? err.message : 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [appointmentId])

  // Get session token for joining
  const getSessionToken = useCallback(async () => {
    if (!appointmentId) return null

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/consultations/${appointmentId}/join`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to join session')
      }

      const data = await response.json()
      setSessionToken(data)
      return data
    } catch (err) {
      console.error('[API Error] Failed to join consultation:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/appointments/${appointmentId}/join`
      })
      setError(err instanceof Error ? err.message : 'Failed to join session')
      return null
    } finally {
      setLoading(false)
    }
  }, [appointmentId])

  // Start billing timer
  useEffect(() => {
    if (!session || session.status !== 'in_progress') return

    const interval = setInterval(() => {
      setBillableSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [session])

  // End session
  const endSession = useCallback(async () => {
    if (!session) return

    try {
      const response = await fetch(`${apiBaseUrl}/consultations/${session.id}/end`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to end session')
      }

      const data = await response.json()
      setSession(data.session)
    } catch (err) {
      console.error('[API Error] Failed to end consultation:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/sessions/${session.id}/end`
      })
      setError(err instanceof Error ? err.message : 'Failed to end session')
    }
  }, [session])

  return {
    session,
    sessionToken,
    loading,
    error,
    billableSeconds,
    getSessionToken,
    endSession,
  }
}