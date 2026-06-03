import { useState, useCallback } from 'react'
import { startRecording, stopRecording } from '@shared/services/recording'

export type RecordingPhase = 'idle' | 'consent-pending' | 'recording' | 'stopping' | 'done' | 'error'

export interface UseRecordingConsentResult {
  phase: RecordingPhase
  recordingId: string | null
  duration: number
  error: string | null
  isRecording: boolean
  showConsentModal: boolean
  requestRecording: () => void
  confirmConsent: (callId: string) => Promise<void>
  cancelConsent: () => void
  stopRecording: (callId: string) => Promise<void>
  dismissError: () => void
}

export function useRecordingConsent(initialConsent = false): UseRecordingConsentResult {
  const [phase, setPhase] = useState<RecordingPhase>('idle')
  const [consentGranted, setConsentGranted] = useState(initialConsent)
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [_durationInterval, setDurationInterval] = useState<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    setDuration(0)
    const id = setInterval(() => setDuration(d => d + 1), 1000)
    setDurationInterval(id)
    return id
  }, [])

  const stopTimer = useCallback(() => {
    setDurationInterval(prev => {
      if (prev !== null) clearInterval(prev)
      return null
    })
  }, [])

  const requestRecording = useCallback(() => {
    if (consentGranted) {
      // Consent already on file — caller must invoke confirmConsent(callId)
      setPhase('consent-pending')
    } else {
      setPhase('consent-pending')
    }
  }, [consentGranted])

  const confirmConsent = useCallback(async (callId: string) => {
    setConsentGranted(true)
    setError(null)
    try {
      const res = await startRecording(callId)
      setRecordingId(res.recordingId)
      setPhase('recording')
      startTimer()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start recording'
      setError(msg)
      setPhase('error')
    }
  }, [startTimer])

  const cancelConsent = useCallback(() => {
    setPhase('idle')
  }, [])

  const stop = useCallback(async (callId: string) => {
    if (!recordingId) return
    setPhase('stopping')
    stopTimer()
    try {
      await stopRecording(callId, recordingId)
      setPhase('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to stop recording'
      setError(msg)
      setPhase('error')
    }
  }, [recordingId, stopTimer])

  const dismissError = useCallback(() => {
    setError(null)
    setPhase('idle')
  }, [])

  return {
    phase,
    recordingId,
    duration,
    error,
    isRecording: phase === 'recording',
    showConsentModal: phase === 'consent-pending',
    requestRecording,
    confirmConsent,
    cancelConsent,
    stopRecording: stop,
    dismissError,
  }
}
