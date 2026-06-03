import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRecordingConsent } from '../useRecordingConsent'

vi.mock('@shared/services/recording', () => ({
  startRecording: vi.fn().mockResolvedValue({ recordingId: 'rec-123', status: 'recording', startedAt: new Date().toISOString() }),
  stopRecording: vi.fn().mockResolvedValue({ id: 'rec-123', status: 'done' }),
}))

describe('useRecordingConsent', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('starts in idle phase', () => {
    const { result } = renderHook(() => useRecordingConsent())
    expect(result.current.phase).toBe('idle')
    expect(result.current.isRecording).toBe(false)
    expect(result.current.showConsentModal).toBe(false)
  })

  it('opens consent modal on requestRecording', () => {
    const { result } = renderHook(() => useRecordingConsent())
    act(() => { result.current.requestRecording() })
    expect(result.current.showConsentModal).toBe(true)
    expect(result.current.phase).toBe('consent-pending')
  })

  it('cancels consent back to idle', () => {
    const { result } = renderHook(() => useRecordingConsent())
    act(() => { result.current.requestRecording() })
    act(() => { result.current.cancelConsent() })
    expect(result.current.phase).toBe('idle')
    expect(result.current.showConsentModal).toBe(false)
  })

  it('starts recording after consent confirmed', async () => {
    const { result } = renderHook(() => useRecordingConsent())
    act(() => { result.current.requestRecording() })
    await act(async () => { await result.current.confirmConsent('call-1') })
    expect(result.current.phase).toBe('recording')
    expect(result.current.isRecording).toBe(true)
    expect(result.current.recordingId).toBe('rec-123')
  })

  it('stops recording', async () => {
    const { result } = renderHook(() => useRecordingConsent())
    act(() => { result.current.requestRecording() })
    await act(async () => { await result.current.confirmConsent('call-1') })
    await act(async () => { await result.current.stopRecording('call-1') })
    expect(result.current.phase).toBe('done')
    expect(result.current.isRecording).toBe(false)
  })

  it('handles startRecording error', async () => {
    const { startRecording } = await import('@shared/services/recording')
    vi.mocked(startRecording).mockRejectedValueOnce(new Error('Server error'))
    const { result } = renderHook(() => useRecordingConsent())
    act(() => { result.current.requestRecording() })
    await act(async () => { await result.current.confirmConsent('call-1') })
    expect(result.current.phase).toBe('error')
    expect(result.current.error).toBe('Server error')
  })

  it('dismisses error and resets to idle', async () => {
    const { startRecording } = await import('@shared/services/recording')
    vi.mocked(startRecording).mockRejectedValueOnce(new Error('Fail'))
    const { result } = renderHook(() => useRecordingConsent())
    act(() => { result.current.requestRecording() })
    await act(async () => { await result.current.confirmConsent('call-1') })
    act(() => { result.current.dismissError() })
    expect(result.current.phase).toBe('idle')
    expect(result.current.error).toBeNull()
  })
})
