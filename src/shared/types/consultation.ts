export type ConsultationStatus = 
  | 'waiting_room'
  | 'connecting'
  | 'in_progress'
  | 'paused'
  | 'ended'
  | 'failed'

export type ConsultationType = 'video' | 'audio'

export type ConsultationSession = {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  sessionToken: string
  status: ConsultationStatus
  type: ConsultationType
  startTime: string | null
  endTime: string | null
  billableSeconds: number
  pricePerSecond: number
  currency: string
  recordingEnabled: boolean
  recordingConsent: boolean
  connectionEvents: Array<{
    timestamp: string
    event: string
    details?: string
  }>
}

export type SessionTokenResponse = {
  sessionId: string
  token: string
  roomUrl: string
  expiresAt: string
}

export type ConsultationControls = {
  muteAudio: () => void
  unmuteAudio: () => void
  muteVideo: () => void
  unmuteVideo: () => void
  toggleScreenShare: () => void
  endSession: () => void
}