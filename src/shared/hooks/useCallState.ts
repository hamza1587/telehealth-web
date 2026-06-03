import { useState, useCallback, useEffect, useRef } from 'react'
import { ConnectionState } from 'livekit-client'
import type { LocalParticipant, RemoteParticipant } from 'livekit-client'
import { webrtcService } from '@shared/services/webrtc'
import { sendChatMessage, getChatHistory } from '@shared/api/chatApi'

export type CallPhase = 'waiting' | 'connecting' | 'inCall' | 'disconnected' | 'error' | 'postCall'

export interface CallChatMessage {
  id: string
  sender: string
  content: string
  timestamp: Date
  isOwn: boolean
}

interface UseCallStateOptions {
  token: string
  serverUrl: string
  sessionId: string
  userId: string
  userName: string
  initialRecordingConsent?: boolean
}

const MAX_RETRY_ATTEMPTS = 3
const AUTO_DISCONNECT_MS = 30 * 60 * 1000

export function useCallState({
  token,
  serverUrl,
  sessionId,
  userId,
  userName,
  initialRecordingConsent = false,
}: UseCallStateOptions) {
  const [callPhase, setCallPhase] = useState<CallPhase>('waiting')
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null)
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([])
  const [, setTrackVersion] = useState(0)

  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const [chatMessages, setChatMessages] = useState<CallChatMessage[]>([])
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const [showConsentModal, setShowConsentModal] = useState(false)
  const [hasRecordingConsent, setHasRecordingConsent] = useState(initialRecordingConsent)
  const [isReconnecting, setIsReconnecting] = useState(false)

  const autoDisconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Timers ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (callPhase !== 'inCall') return
    const interval = setInterval(() => setCallDuration(d => d + 1), 1000)
    return () => clearInterval(interval)
  }, [callPhase])

  useEffect(() => {
    if (!isRecording) return
    const interval = setInterval(() => setRecordingDuration(d => d + 1), 1000)
    return () => clearInterval(interval)
  }, [isRecording])

  // ── Actions ───────────────────────────────────────────────────────────────

  const endCall = useCallback(async () => {
    if (autoDisconnectTimer.current) clearTimeout(autoDisconnectTimer.current)
    try {
      await webrtcService.disconnect()
    } catch {
      // best-effort
    }
    setCallPhase('postCall')
  }, [])

  useEffect(() => {
    if (callPhase !== 'inCall') return
    autoDisconnectTimer.current = setTimeout(endCall, AUTO_DISCONNECT_MS)
    return () => {
      if (autoDisconnectTimer.current) clearTimeout(autoDisconnectTimer.current)
    }
  }, [callPhase, endCall])

  const joinCall = useCallback(async () => {
    setCallPhase('connecting')
    setError(null)

    try {
      const room = await webrtcService.connect(token, serverUrl)
      setLocalParticipant(room.localParticipant)

      webrtcService.onParticipantConnected(p => setRemoteParticipants(prev => [...prev, p]))
      webrtcService.onParticipantDisconnected(p =>
        setRemoteParticipants(prev => prev.filter(r => r.identity !== p.identity))
      )
      webrtcService.onConnectionStateChanged(state => {
        if (state === ConnectionState.Disconnected) setCallPhase('disconnected')
      })
      webrtcService.onTrackSubscribed(() => setTrackVersion(v => v + 1))
      webrtcService.onTrackUnsubscribed(() => setTrackVersion(v => v + 1))
      webrtcService.onReconnecting(() => setIsReconnecting(true))
      webrtcService.onReconnected(() => setIsReconnecting(false))

      setCallPhase('inCall')
      setRetryCount(0)

      try {
        const history = await getChatHistory(sessionId)
        setChatMessages(
          history.map(msg => ({
            id: msg.id,
            sender: msg.senderName,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            isOwn: msg.senderId === userId,
          }))
        )
      } catch {
        // non-fatal: chat history unavailable
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to connect: ${msg}`)
      setCallPhase('error')
    }
  }, [token, serverUrl, sessionId, userId])

  const retry = useCallback(async () => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setError(`Failed after ${MAX_RETRY_ATTEMPTS} attempts. Please check your connection.`)
      return
    }
    setRetryCount(c => c + 1)
    await webrtcService.disconnect()
    await joinCall()
  }, [retryCount, joinCall])

  const toggleMic = useCallback(async () => {
    try {
      await webrtcService.toggleMicrophone()
      setIsMuted(m => !m)
    } catch {
      setError('Could not toggle microphone. Please check permissions.')
    }
  }, [])

  const toggleCamera = useCallback(async () => {
    try {
      await webrtcService.toggleCamera()
      setIsCameraOff(c => !c)
    } catch {
      setError('Could not toggle camera. Please check permissions.')
    }
  }, [])

  const toggleScreenShare = useCallback(async () => {
    try {
      await webrtcService.toggleScreenShare()
      setIsScreenSharing(s => !s)
    } catch {
      setError('Could not share screen. Please try again.')
    }
  }, [])

  const toggleRecording = useCallback(() => {
    if (!hasRecordingConsent) {
      setShowConsentModal(true)
      return
    }
    setIsRecording(r => {
      if (r) return false
      setRecordingDuration(0)
      return true
    })
  }, [hasRecordingConsent])

  const confirmConsent = useCallback(() => {
    setHasRecordingConsent(true)
    setShowConsentModal(false)
    setRecordingDuration(0)
    setIsRecording(true)
  }, [])

  const cancelConsent = useCallback(() => setShowConsentModal(false), [])

  const sendMessage = useCallback(
    async (content: string) => {
      const msg: CallChatMessage = {
        id: Date.now().toString(),
        sender: userName,
        content,
        timestamp: new Date(),
        isOwn: true,
      }
      setChatMessages(prev => [...prev, msg])
      try {
        await sendChatMessage({ callId: sessionId, content })
      } catch {
        // non-fatal: message already shown optimistically
      }
    },
    [userName, sessionId]
  )

  const dismissError = useCallback(() => setError(null), [])

  return {
    // State
    callPhase,
    localParticipant,
    remoteParticipants,
    isMuted,
    isCameraOff,
    isScreenSharing,
    isRecording,
    recordingDuration,
    chatMessages,
    callDuration,
    error,
    retryCount,
    maxRetryAttempts: MAX_RETRY_ATTEMPTS,
    showConsentModal,
    hasRecordingConsent,

    isReconnecting,

    // Actions
    joinCall,
    endCall,
    retry,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    toggleRecording,
    confirmConsent,
    cancelConsent,
    sendMessage,
    dismissError,
    setCallPhase,
  }
}
