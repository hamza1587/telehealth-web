import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCallState } from '../useCallState'

// Mock livekit ConnectionState enum value
vi.mock('livekit-client', () => ({
  ConnectionState: { Connected: 'connected', Disconnected: 'disconnected', Reconnecting: 'reconnecting' },
}))

// Mock webrtcService
vi.mock('@shared/services/webrtc', () => ({
  webrtcService: {
    connect: vi.fn().mockResolvedValue({
      localParticipant: { identity: 'user-1', name: 'Test User' },
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    toggleMicrophone: vi.fn().mockResolvedValue(undefined),
    toggleCamera: vi.fn().mockResolvedValue(undefined),
    toggleScreenShare: vi.fn().mockResolvedValue(undefined),
    onParticipantConnected: vi.fn().mockReturnValue(() => {}),
    onParticipantDisconnected: vi.fn().mockReturnValue(() => {}),
    onConnectionStateChanged: vi.fn().mockReturnValue(() => {}),
    onTrackSubscribed: vi.fn().mockReturnValue(() => {}),
    onTrackUnsubscribed: vi.fn().mockReturnValue(() => {}),
    onReconnecting: vi.fn().mockReturnValue(() => {}),
    onReconnected: vi.fn().mockReturnValue(() => {}),
  },
}))

vi.mock('@shared/api/chatApi', () => ({
  getChatHistory: vi.fn().mockResolvedValue([]),
  sendChatMessage: vi.fn().mockResolvedValue({}),
}))

const defaultOptions = {
  token: 'test-token',
  serverUrl: 'wss://test.livekit.io',
  sessionId: 'session-1',
  userId: 'user-1',
  userName: 'Test User',
}

describe('useCallState', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('starts in waiting phase', () => {
    const { result } = renderHook(() => useCallState(defaultOptions))
    expect(result.current.callPhase).toBe('waiting')
    expect(result.current.isMuted).toBe(false)
    expect(result.current.isCameraOff).toBe(false)
    expect(result.current.isRecording).toBe(false)
  })

  it('transitions waiting → connecting → inCall on joinCall', async () => {
    const { result } = renderHook(() => useCallState(defaultOptions))
    expect(result.current.callPhase).toBe('waiting')

    await act(async () => { await result.current.joinCall() })
    expect(result.current.callPhase).toBe('inCall')
  })

  it('sets error state when connect fails', async () => {
    const { webrtcService } = await import('@shared/services/webrtc')
    vi.mocked(webrtcService.connect).mockRejectedValueOnce(new Error('Network failure'))

    const { result } = renderHook(() => useCallState(defaultOptions))
    await act(async () => { await result.current.joinCall() })
    expect(result.current.callPhase).toBe('error')
    expect(result.current.error).toContain('Network failure')
  })

  it('transitions to postCall on endCall', async () => {
    const { result } = renderHook(() => useCallState(defaultOptions))
    await act(async () => { await result.current.joinCall() })
    await act(async () => { await result.current.endCall() })
    expect(result.current.callPhase).toBe('postCall')
  })

  it('toggleMic flips isMuted', async () => {
    const { result } = renderHook(() => useCallState(defaultOptions))
    await act(async () => { await result.current.joinCall() })
    expect(result.current.isMuted).toBe(false)
    await act(async () => { await result.current.toggleMic() })
    expect(result.current.isMuted).toBe(true)
    await act(async () => { await result.current.toggleMic() })
    expect(result.current.isMuted).toBe(false)
  })

  it('toggleCamera flips isCameraOff', async () => {
    const { result } = renderHook(() => useCallState(defaultOptions))
    await act(async () => { await result.current.joinCall() })
    await act(async () => { await result.current.toggleCamera() })
    expect(result.current.isCameraOff).toBe(true)
  })

  it('requestRecording opens consent modal when no prior consent', () => {
    const { result } = renderHook(() => useCallState(defaultOptions))
    act(() => { result.current.toggleRecording() })
    expect(result.current.showConsentModal).toBe(true)
    expect(result.current.isRecording).toBe(false)
  })

  it('confirmConsent starts recording', () => {
    const { result } = renderHook(() => useCallState(defaultOptions))
    act(() => { result.current.toggleRecording() })
    act(() => { result.current.confirmConsent() })
    expect(result.current.isRecording).toBe(true)
    expect(result.current.showConsentModal).toBe(false)
  })

  it('sendMessage appends to chatMessages', async () => {
    const { result } = renderHook(() => useCallState(defaultOptions))
    await act(async () => { await result.current.sendMessage('Hello') })
    expect(result.current.chatMessages).toHaveLength(1)
    expect(result.current.chatMessages[0].content).toBe('Hello')
    expect(result.current.chatMessages[0].isOwn).toBe(true)
  })

  it('dismissError clears error', async () => {
    const { webrtcService } = await import('@shared/services/webrtc')
    vi.mocked(webrtcService.connect).mockRejectedValueOnce(new Error('Oops'))
    const { result } = renderHook(() => useCallState(defaultOptions))
    await act(async () => { await result.current.joinCall() })
    expect(result.current.error).not.toBeNull()
    act(() => { result.current.dismissError() })
    expect(result.current.error).toBeNull()
  })

  it('retries up to maxRetryAttempts', async () => {
    const { webrtcService } = await import('@shared/services/webrtc')
    vi.mocked(webrtcService.connect).mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useCallState(defaultOptions))
    // Exceed max retries
    for (let i = 0; i <= result.current.maxRetryAttempts; i++) {
      await act(async () => { await result.current.retry() })
    }
    expect(result.current.error).toContain('Failed after')
  })
})
