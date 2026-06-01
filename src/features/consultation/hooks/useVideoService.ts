import { useState, useCallback } from 'react'

interface VideoRoom {
  id: string
  roomName: string
  maxParticipants: number
  countryCode: string
  status: 'created' | 'active' | 'ended'
  twilioRoomSid: string | null
  isRecording: boolean
  hasScreenSharing: boolean
  createdAt: string
}

interface RecordingSession {
  id: string
  roomId: string
  status: 'pending' | 'recording' | 'completed' | 'failed'
  consentObtained: boolean
  twilioRecordingSid: string | null
  recordingUrl: string | null
  durationSeconds: number
  createdAt: string
}

const VIDEO_API_BASE = 'http://localhost:5000/api' // Update with actual Video Service URL

export const useVideoService = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createRoom = useCallback(async (roomName: string, maxParticipants: number, countryCode: string = 'US') => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${VIDEO_API_BASE}/videoroom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, maxParticipants, countryCode }),
      })
      if (!response.ok) throw new Error('Failed to create room')
      return await response.json() as VideoRoom
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getRoom = useCallback(async (roomId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${VIDEO_API_BASE}/videoroom/${roomId}`)
      if (!response.ok) throw new Error('Failed to get room')
      return await response.json() as VideoRoom
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get room')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAllRooms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${VIDEO_API_BASE}/videoroom`)
      if (!response.ok) throw new Error('Failed to get rooms')
      return await response.json() as VideoRoom[]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get rooms')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const activateRoom = useCallback(async (roomId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${VIDEO_API_BASE}/videoroom/${roomId}/activate`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to activate room')
      return await response.json() as VideoRoom
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate room')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const endRoom = useCallback(async (roomId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${VIDEO_API_BASE}/videoroom/${roomId}/end`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to end room')
      return await response.json() as VideoRoom
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end room')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const enableRecording = useCallback(async (roomId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${VIDEO_API_BASE}/videoroom/${roomId}/recording/enable`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to enable recording')
      return await response.json() as VideoRoom
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable recording')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const disableRecording = useCallback(async (roomId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${VIDEO_API_BASE}/videoroom/${roomId}/recording/disable`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to disable recording')
      return await response.json() as VideoRoom
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable recording')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const generateToken = useCallback(async (roomId: string, participantIdentity: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${VIDEO_API_BASE}/videoroom/${roomId}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIdentity }),
      })
      if (!response.ok) throw new Error('Failed to generate token')
      const data = await response.json()
      return data.token as string
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const startRecording = useCallback(async (roomId: string, requiresConsent: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${VIDEO_API_BASE}/recording/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, requiresConsent }),
      })
      if (!response.ok) throw new Error('Failed to start recording')
      return await response.json() as RecordingSession
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const stopRecording = useCallback(async (recordingId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${VIDEO_API_BASE}/recording/${recordingId}/stop`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to stop recording')
      return await response.json() as RecordingSession
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const grantConsent = useCallback(async (recordingId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${VIDEO_API_BASE}/recording/${recordingId}/consent`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to grant consent')
      return await response.json() as RecordingSession
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant consent')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createRoom,
    getRoom,
    getAllRooms,
    activateRoom,
    endRoom,
    enableRecording,
    disableRecording,
    generateToken,
    startRecording,
    stopRecording,
    grantConsent,
  }
}
