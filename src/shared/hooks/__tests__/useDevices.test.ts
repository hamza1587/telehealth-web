import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useDevices } from '../useDevices'

const mockDevices: MediaDeviceInfo[] = [
  { deviceId: 'cam1', kind: 'videoinput', label: 'Front Camera', groupId: '', toJSON: () => ({}) },
  { deviceId: 'mic1', kind: 'audioinput', label: 'Built-in Mic', groupId: '', toJSON: () => ({}) },
  { deviceId: 'spk1', kind: 'audiooutput', label: 'Speaker', groupId: '', toJSON: () => ({}) },
]

function buildMockStream(): MediaStream {
  const track = { stop: vi.fn(), enabled: true, kind: 'video', id: 'v1' } as unknown as MediaStreamTrack
  return {
    getTracks: () => [track],
    getVideoTracks: () => [track],
    getAudioTracks: () => [],
  } as unknown as MediaStream
}

beforeEach(() => {
  vi.clearAllMocks()

  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      enumerateDevices: vi.fn().mockResolvedValue(mockDevices),
      getUserMedia: vi.fn().mockResolvedValue(buildMockStream()),
    },
  })

  Object.defineProperty(navigator, 'permissions', {
    writable: true,
    value: {
      query: vi.fn().mockResolvedValue({ state: 'granted' }),
    },
  })
})

describe('useDevices', () => {
  it('initialises with empty device lists', () => {
    const { result } = renderHook(() => useDevices())
    expect(result.current.cameras).toHaveLength(0)
    expect(result.current.microphones).toHaveLength(0)
  })

  it('enumerates devices after permission grant', async () => {
    const { result } = renderHook(() => useDevices())
    await waitFor(() => expect(result.current.cameras.length).toBeGreaterThan(0))
    expect(result.current.cameras[0].deviceId).toBe('cam1')
    expect(result.current.microphones[0].deviceId).toBe('mic1')
    expect(result.current.speakers[0].deviceId).toBe('spk1')
  })

  it('selects first devices by default', async () => {
    const { result } = renderHook(() => useDevices())
    await waitFor(() => expect(result.current.selectedCamera).toBe('cam1'))
    expect(result.current.selectedMicrophone).toBe('mic1')
  })

  it('sets camera permission to denied on NotAllowedError', async () => {
    const err = Object.assign(new Error('denied'), { name: 'NotAllowedError' })
    Object.defineProperty(navigator, 'permissions', {
      writable: true,
      value: { query: vi.fn().mockResolvedValue({ state: 'denied' }) },
    })
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn().mockResolvedValue([]),
        getUserMedia: vi.fn().mockRejectedValue(err),
      },
    })

    const { result } = renderHook(() => useDevices())
    await waitFor(() => expect(result.current.cameraPermission).toBe('denied'))
    expect(result.current.error).toContain('denied')
  })

  it('updateing selectedCamera triggers setSelectedCamera', async () => {
    const { result } = renderHook(() => useDevices())
    await waitFor(() => expect(result.current.cameras.length).toBeGreaterThan(0))
    act(() => { result.current.setSelectedCamera('cam1') })
    expect(result.current.selectedCamera).toBe('cam1')
  })
})
