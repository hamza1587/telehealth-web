import { useState, useEffect, useCallback, useRef } from 'react'

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported'

export interface DeviceInfo {
  deviceId: string
  label: string
  kind: MediaDeviceKind
}

export interface UseDevicesResult {
  cameras: DeviceInfo[]
  microphones: DeviceInfo[]
  speakers: DeviceInfo[]
  selectedCamera: string
  selectedMicrophone: string
  selectedSpeaker: string
  setSelectedCamera: (id: string) => void
  setSelectedMicrophone: (id: string) => void
  setSelectedSpeaker: (id: string) => void
  cameraPermission: PermissionState
  micPermission: PermissionState
  previewStream: MediaStream | null
  isLoading: boolean
  error: string | null
  requestPermissions: () => Promise<void>
  stopPreview: () => void
}

function isBrowserSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
}

async function queryPermission(name: PermissionName): Promise<PermissionState> {
  if (!navigator.permissions?.query) return 'prompt'
  try {
    const status = await navigator.permissions.query({ name })
    return status.state as PermissionState
  } catch {
    return 'prompt'
  }
}

export function useDevices(): UseDevicesResult {
  const [cameras, setCameras] = useState<DeviceInfo[]>([])
  const [microphones, setMicrophones] = useState<DeviceInfo[]>([])
  const [speakers, setSpeakers] = useState<DeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [selectedMicrophone, setSelectedMicrophone] = useState('')
  const [selectedSpeaker, setSelectedSpeaker] = useState('')
  const [cameraPermission, setCameraPermission] = useState<PermissionState>('prompt')
  const [micPermission, setMicPermission] = useState<PermissionState>('prompt')
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopPreview = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setPreviewStream(null)
  }, [])

  const enumerate = useCallback(async () => {
    if (!isBrowserSupported()) {
      setError('Your browser does not support media devices.')
      return
    }
    try {
      const all = await navigator.mediaDevices.enumerateDevices()
      const toInfo = (d: MediaDeviceInfo, idx: number): DeviceInfo => ({
        deviceId: d.deviceId,
        label: d.label || `Device ${idx + 1}`,
        kind: d.kind,
      })
      const cams = all.filter(d => d.kind === 'videoinput').map(toInfo)
      const mics = all.filter(d => d.kind === 'audioinput').map(toInfo)
      const spks = all.filter(d => d.kind === 'audiooutput').map(toInfo)
      setCameras(cams)
      setMicrophones(mics)
      setSpeakers(spks)
      if (cams[0] && !selectedCamera) setSelectedCamera(cams[0].deviceId)
      if (mics[0] && !selectedMicrophone) setSelectedMicrophone(mics[0].deviceId)
      if (spks[0] && !selectedSpeaker) setSelectedSpeaker(spks[0].deviceId)
    } catch (err) {
      setError('Failed to enumerate media devices.')
      console.error('enumerateDevices error:', err)
    }
  }, [selectedCamera, selectedMicrophone, selectedSpeaker])

  const requestPermissions = useCallback(async () => {
    if (!isBrowserSupported()) {
      setCameraPermission('unsupported')
      setMicPermission('unsupported')
      setError('Your browser does not support camera and microphone access.')
      return
    }
    setIsLoading(true)
    setError(null)
    stopPreview()

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: selectedMicrophone ? { deviceId: { exact: selectedMicrophone } } : true,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      setPreviewStream(stream)
      setCameraPermission('granted')
      setMicPermission('granted')
      await enumerate()
    } catch (err) {
      const e = err as DOMException
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setCameraPermission('denied')
        setMicPermission('denied')
        setError('Camera and microphone access was denied. Please allow access in your browser settings and reload the page.')
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setError('No camera or microphone found. Please connect a device and try again.')
      } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
        setError('Camera or microphone is already in use by another application.')
      } else {
        setError(`Could not access media devices: ${e.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedCamera, selectedMicrophone, enumerate, stopPreview])

  // Bootstrap: check permissions and start preview on mount
  useEffect(() => {
    if (!isBrowserSupported()) {
      setCameraPermission('unsupported')
      setMicPermission('unsupported')
      return
    }

    let cancelled = false

    const init = async () => {
      const [cam, mic] = await Promise.all([
        queryPermission('camera' as PermissionName),
        queryPermission('microphone' as PermissionName),
      ])
      if (cancelled) return
      setCameraPermission(cam)
      setMicPermission(mic)

      if (cam === 'granted' && mic === 'granted') {
        await requestPermissions()
      } else if (cam !== 'denied' && mic !== 'denied') {
        await enumerate()
        await requestPermissions()
      } else {
        await enumerate()
        setError('Camera or microphone access was denied. Allow access in browser settings.')
      }
    }

    init().catch(console.error)

    return () => {
      cancelled = true
      stopPreview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-request preview when device selection changes (after initial mount)
  useEffect(() => {
    if (!previewStream || !selectedCamera) return
    stopPreview()
    requestPermissions().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera, selectedMicrophone])

  return {
    cameras,
    microphones,
    speakers,
    selectedCamera,
    selectedMicrophone,
    selectedSpeaker,
    setSelectedCamera,
    setSelectedMicrophone,
    setSelectedSpeaker,
    cameraPermission,
    micPermission,
    previewStream,
    isLoading,
    error,
    requestPermissions,
    stopPreview,
  }
}
