import { API_CONFIG } from '@shared/config/api'

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'completed' | 'failed'

export interface RecordingSession {
  id: string
  callId: string
  status: RecordingStatus
  startedAt: string
  endedAt?: string
  durationSeconds?: number
  downloadUrl?: string
  consentObtained: boolean
}

export interface StartRecordingResponse {
  recordingId: string
  status: RecordingStatus
  startedAt: string
}

async function videoFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const authTokens = localStorage.getItem('authTokens')
  const accessToken = authTokens
    ? (JSON.parse(authTokens) as { accessToken?: string }).accessToken
    : null

  const res = await fetch(`${API_CONFIG.videoServiceUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' })) as { error?: string }
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export async function startRecording(callId: string): Promise<StartRecordingResponse> {
  return videoFetch<StartRecordingResponse>(`/api/recording/calls/${callId}/start`, {
    method: 'POST',
  })
}

export async function stopRecording(callId: string, recordingId: string): Promise<RecordingSession> {
  return videoFetch<RecordingSession>(`/api/recording/calls/${callId}/recordings/${recordingId}/stop`, {
    method: 'POST',
  })
}

export async function getRecordingStatus(callId: string, recordingId: string): Promise<RecordingSession> {
  return videoFetch<RecordingSession>(`/api/recording/calls/${callId}/recordings/${recordingId}`)
}
