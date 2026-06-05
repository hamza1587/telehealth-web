import React, { useState, useEffect, useCallback, useRef } from 'react'
import { WaitingRoom } from './WaitingRoom'
import { VideoGrid } from './VideoGrid'
import { CallControls } from './CallControls'
import { ChatPanel } from './ChatPanel'
import { ParticipantList } from './ParticipantList'
import { RecordingIndicator } from './RecordingIndicator'
import { PostCallSummary } from './PostCallSummary'
import { ConsentModal } from './ConsentModal'
import { webrtcService } from '@shared/services/webrtc'
import { sendChatMessage, getChatHistory } from '@shared/api/chatApi'
import { ConnectionState } from 'livekit-client'
import type { LocalParticipant, RemoteParticipant } from 'livekit-client'

interface ChatMessage {
  id: string
  sender: string
  content: string
  timestamp: Date
  isOwn: boolean
}

interface VideoConsultationRoomProps {
  sessionId: string
  token: string
  serverUrl: string
  isDoctor?: boolean
  userId: string
  userName: string
  recordingConsent?: boolean
  onCallEnd?: () => void
}

type CallState = 'waiting' | 'connecting' | 'inCall' | 'disconnected' | 'error' | 'postCall'

const MAX_RETRY_ATTEMPTS = 3
const AUTO_DISCONNECT_MS = 30 * 60 * 1000

function detectBrowser(): string | null {
  const ua = navigator.userAgent
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'chrome'
  if (ua.includes('Firefox')) return 'firefox'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari'
  if (ua.includes('Edg')) return 'edge'
  return null
}

function isBrowserSupported(): boolean {
  const browser = detectBrowser()
  return browser !== null && typeof RTCPeerConnection !== 'undefined'
}

export const VideoConsultationRoom: React.FC<VideoConsultationRoomProps> = ({
  sessionId,
  token,
  serverUrl,
  isDoctor = false,
  userId,
  userName,
  recordingConsent = false,
  onCallEnd,
}) => {
  const [callState, setCallState] = useState<CallState>('waiting')
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null)
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([])
  const [, setTrackVersion] = useState(0)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [unsupportedBrowser, setUnsupportedBrowser] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [hasRecordingConsent, setHasRecordingConsent] = useState(recordingConsent)
  const autoDisconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isBrowserSupported()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnsupportedBrowser(true)
    }
  }, [])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (callState === 'inCall') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [callState])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // handleEndCall must be declared before the auto-disconnect useEffect that references it
  const handleEndCall = useCallback(async () => {
    try {
      if (autoDisconnectTimer.current) {
        clearTimeout(autoDisconnectTimer.current)
      }
      await webrtcService.disconnect()
      setCallState('postCall')
    } catch (err) {
      console.error('Error ending call:', err)
    }
  }, [])

  useEffect(() => {
    if (callState === 'inCall') {
      autoDisconnectTimer.current = setTimeout(() => {
        handleEndCall()
      }, AUTO_DISCONNECT_MS)
    }
    return () => {
      if (autoDisconnectTimer.current) {
        clearTimeout(autoDisconnectTimer.current)
      }
    }
  }, [callState, handleEndCall])

  const handleJoinCall = useCallback(async () => {
    try {
      setCallState('connecting')
      setError(null)

      const room = await webrtcService.connect(token, serverUrl)
      setLocalParticipant(room.localParticipant)

      webrtcService.onParticipantConnected((participant: RemoteParticipant) => {
        setRemoteParticipants(prev => [...prev, participant])
      })

      webrtcService.onParticipantDisconnected((participant: RemoteParticipant) => {
        setRemoteParticipants(prev => prev.filter(p => p.identity !== participant.identity))
      })

      webrtcService.onConnectionStateChanged((state: ConnectionState) => {
        if (state === ConnectionState.Disconnected) {
          setCallState('disconnected')
        }
      })

      // Re-render VideoGrid when tracks arrive or leave (tracks are async)
      webrtcService.onTrackSubscribed(() => setTrackVersion(v => v + 1))
      webrtcService.onTrackUnsubscribed(() => setTrackVersion(v => v + 1))
      webrtcService.onReconnecting(() => setIsReconnecting(true))
      webrtcService.onReconnected(() => setIsReconnecting(false))

      setCallState('inCall')
      setRetryCount(0)

      try {
        const history = await getChatHistory(sessionId)
        const formattedHistory = history.map(msg => ({
          id: msg.id,
          sender: msg.senderName,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          isOwn: msg.senderId === userId
        }))
        setChatMessages(formattedHistory)
      } catch (err) {
        console.error('Failed to load chat history:', err)
      }
    } catch (err) {
      console.error('Error joining call:', err)
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to connect: ${msg}`)
      setCallState('error')
    }
  }, [token, serverUrl, sessionId, userId])

  const handleRetry = useCallback(async () => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setError(`Failed after ${MAX_RETRY_ATTEMPTS} attempts. Please check your connection.`)
      return
    }
    setRetryCount(prev => prev + 1)
    await webrtcService.disconnect()
    await handleJoinCall()
  }, [retryCount, handleJoinCall])

  const handleToggleMic = useCallback(async () => {
    try {
      if (isMuted) {
        await webrtcService.enableMicrophone()
      } else {
        await webrtcService.disableMicrophone()
      }
      setIsMuted(!isMuted)
    } catch (err) {
      console.error('Error toggling mic:', err)
      setError('Could not toggle microphone. Please check permissions.')
    }
  }, [isMuted])

  const handleToggleCamera = useCallback(async () => {
    try {
      if (isCameraOff) {
        await webrtcService.enableCamera()
      } else {
        await webrtcService.disableCamera()
      }
      setIsCameraOff(!isCameraOff)
    } catch (err) {
      console.error('Error toggling camera:', err)
      setError('Could not toggle camera. Please check permissions.')
    }
  }, [isCameraOff])

  const handleToggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        await webrtcService.stopScreenShare()
      } else {
        await webrtcService.shareScreen()
      }
      setIsScreenSharing(!isScreenSharing)
    } catch (err) {
      console.error('Error toggling screen share:', err)
      setError('Could not share screen. Please try again.')
    }
  }, [isScreenSharing])

  const handleToggleRecording = useCallback(() => {
    if (!hasRecordingConsent) {
      setShowConsentModal(true)
      return
    }
    setIsRecording(!isRecording)
    if (!isRecording) {
      setRecordingDuration(0)
    }
  }, [isRecording, hasRecordingConsent])

  const handleConsentConfirm = useCallback(() => {
    setHasRecordingConsent(true)
    setShowConsentModal(false)
    setIsRecording(true)
    setRecordingDuration(0)
  }, [])

  const handleSendMessage = useCallback(async (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: userName,
      content,
      timestamp: new Date(),
      isOwn: true
    }
    setChatMessages(prev => [...prev, newMessage])

    try {
      await sendChatMessage({
        callId: sessionId,
        content
      })
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }, [userName, sessionId])

  const handleReturnToDashboard = useCallback(() => {
    if (onCallEnd) {
      onCallEnd()
    } else {
      window.location.href = '/'
    }
  }, [onCallEnd])

  const dismissError = useCallback(() => {
    setError(null)
  }, [])

  if (unsupportedBrowser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg" role="alert">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Unsupported Browser</h2>
          <p className="text-gray-600 mb-4">
            Your browser is not supported for video consultations. Please use Chrome, Firefox, or Safari.
          </p>
          <a
            href="https://www.google.com/chrome/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Download Chrome
          </a>
        </div>
      </div>
    )
  }

  switch (callState) {
    case 'waiting':
      return <WaitingRoom onJoinCall={handleJoinCall} isDoctor={isDoctor} />

    case 'connecting':
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50" role="status" aria-live="polite">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" aria-hidden="true"></div>
            <p className="text-lg font-medium">Connecting to call...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we establish the connection</p>
            {retryCount > 0 && (
              <p className="text-sm text-orange-500 mt-2">Retry attempt {retryCount} of {MAX_RETRY_ATTEMPTS}</p>
            )}
          </div>
        </div>
      )

    case 'error':
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4" role="alert">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-red-500 mb-4" aria-hidden="true">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              {retryCount < MAX_RETRY_ATTEMPTS && (
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Retry ({MAX_RETRY_ATTEMPTS - retryCount} left)
                </button>
              )}
              <button
                onClick={() => { setCallState('waiting'); setError(null) }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Back to Waiting Room
              </button>
            </div>
          </div>
        </div>
      )

    case 'postCall':
      return (
        <PostCallSummary
          callDuration={callDuration}
          participantCount={remoteParticipants.length + 1}
          wasRecorded={isRecording}
          onEnd={handleReturnToDashboard}
        />
      )

    case 'inCall':
    case 'disconnected':
      return (
        <div className="flex flex-col h-screen bg-gray-900 relative" role="main" aria-label="Video consultation room">
          {showConsentModal && (
            <ConsentModal
              onConfirm={handleConsentConfirm}
              onCancel={() => setShowConsentModal(false)}
            />
          )}

          <RecordingIndicator isRecording={isRecording} duration={recordingDuration} />

          {isReconnecting && (
            <div className="bg-yellow-500 text-white px-4 py-2 flex items-center gap-2" role="status" aria-live="polite">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true" />
              <span className="text-sm font-medium">Reconnecting…</span>
            </div>
          )}

          {error && (
            <div className="bg-yellow-500 text-white px-4 py-2 flex items-center justify-between" role="alert" aria-live="assertive">
              <span className="text-sm">{error}</span>
              <button
                onClick={dismissError}
                className="ml-4 text-white hover:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-500"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-2 md:p-4" role="region" aria-label="Video grid">
                <VideoGrid
                  localParticipant={localParticipant}
                  remoteParticipants={remoteParticipants}
                  isLocalMuted={isMuted}
                  isLocalCameraOff={isCameraOff}
                  isScreenSharing={isScreenSharing}
                  onStopScreenShare={handleToggleScreenShare}
                />
              </div>

              <div id="call-controls" className="p-2 md:p-4" role="region" aria-label="Call controls">
                <CallControls
                  isMuted={isMuted}
                  isCameraOff={isCameraOff}
                  isScreenSharing={isScreenSharing}
                  isRecording={isRecording}
                  onToggleMic={handleToggleMic}
                  onToggleCamera={handleToggleCamera}
                  onToggleScreenShare={handleToggleScreenShare}
                  onToggleRecording={handleToggleRecording}
                  onEndCall={handleEndCall}
                  onToggleChat={() => { setShowChat(!showChat); setShowParticipants(false) }}
                  onToggleParticipants={() => { setShowParticipants(!showParticipants); setShowChat(false) }}
                />
              </div>
            </div>

            {(showChat || showParticipants) && (
              <div className="w-full md:w-80 border-l border-gray-700 bg-white fixed inset-0 md:relative z-10 md:z-auto" role="complementary" aria-label="Side panel">
                <button
                  type="button"
                  className="md:hidden absolute top-2 right-2 z-20 p-2 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => { setShowChat(false); setShowParticipants(false) }}
                  aria-label="Close sidebar"
                >
                  ✕
                </button>
                {showChat ? (
                  <ChatPanel
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    currentUserId={userId}
                  />
                ) : (
                  <ParticipantList
                    participants={remoteParticipants}
                    localParticipant={localParticipant}
                    isLocalMuted={isMuted}
                    isLocalCameraOff={isCameraOff}
                  />
                )}
              </div>
            )}
          </div>

          {callState === 'disconnected' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20" role="alert" aria-live="assertive">
              <div className="text-center text-white p-6">
                <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
                <p>You have been disconnected from the call.</p>
                <button
                  type="button"
                  onClick={handleReturnToDashboard}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      )

    default:
      return null
  }
}