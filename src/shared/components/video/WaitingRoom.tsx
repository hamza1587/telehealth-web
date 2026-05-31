import React, { useState, useEffect, useCallback } from 'react';

interface Device {
  deviceId: string
  label: string
  kind: 'audioinput' | 'videoinput' | 'audiooutput'
}

interface WaitingRoomProps {
  onJoinCall: () => void
  isDoctor?: boolean
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ onJoinCall, isDoctor = false }) => {
  const [cameras, setCameras] = useState<Device[]>([])
  const [microphones, setMicrophones] = useState<Device[]>([])
  const [speakers, setSpeakers] = useState<Device[]>([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [selectedMicrophone, setSelectedMicrophone] = useState('')
  const [selectedSpeaker, setSelectedSpeaker] = useState('')
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [micEnabled, setMicEnabled] = useState(true)
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null)

  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(d => d.kind === 'videoinput').map(d => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${d.deviceId.slice(0, 8)}`,
        kind: 'videoinput' as const
      }))
      const audioDevices = devices.filter(d => d.kind === 'audioinput').map(d => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`,
        kind: 'audioinput' as const
      }))
      const speakerDevices = devices.filter(d => d.kind === 'audiooutput').map(d => ({
        deviceId: d.deviceId,
        label: d.label || `Speaker ${d.deviceId.slice(0, 8)}`,
        kind: 'audiooutput' as const
      }))

      setCameras(videoDevices)
      setMicrophones(audioDevices)
      setSpeakers(speakerDevices)

      if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId)
      if (audioDevices.length > 0) setSelectedMicrophone(audioDevices[0].deviceId)
      if (speakerDevices.length > 0) setSelectedSpeaker(speakerDevices[0].deviceId)
    } catch (error) {
      console.error('Error enumerating devices:', error)
    }
  }

  const startPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setPreviewStream(stream)
    } catch (error) {
      console.error('Error starting preview:', error)
    }
  }

  useEffect(() => {
    enumerateDevices()
    startPreview()
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleCamera = useCallback(() => {
    setCameraEnabled(prev => !prev)
    if (previewStream) {
      previewStream.getVideoTracks().forEach(track => {
        track.enabled = !cameraEnabled
      })
    }
  }, [cameraEnabled, previewStream])

  const toggleMicrophone = useCallback(() => {
    setMicEnabled(prev => !prev)
    if (previewStream) {
      previewStream.getAudioTracks().forEach(track => {
        track.enabled = !micEnabled
      })
    }
  }, [micEnabled, previewStream])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md border rounded-lg bg-white shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold text-center">
            {isDoctor ? 'Doctor Waiting Room' : 'Patient Waiting Room'}
          </h1>
        </div>
        <div className="p-6 space-y-6">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {previewStream && cameraEnabled ? (
              <video
                autoPlay
                muted
                playsInline
                ref={video => {
                  if (video) video.srcObject = previewStream
                }}
                className="w-full h-full object-cover"
                aria-label="Camera preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <span aria-hidden="true">Camera Off</span>
              </div>
            )}
            <span className="absolute top-2 left-2 px-2 py-1 text-xs rounded bg-black/70 text-white">
              {cameraEnabled ? 'Camera On' : 'Camera Off'}
            </span>
          </div>

          <div className="flex justify-center gap-4" role="group" aria-label="Device controls">
            <button
              type="button"
              onClick={toggleMicrophone}
              aria-label={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
              className={`px-4 py-2 rounded ${micEnabled ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}
            >
              {micEnabled ? 'Mic On' : 'Mic Off'}
            </button>
            <button
              type="button"
              onClick={toggleCamera}
              aria-label={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              className={`px-4 py-2 rounded ${cameraEnabled ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}
            >
              {cameraEnabled ? 'Camera On' : 'Camera Off'}
            </button>
          </div>

          <div className="space-y-4" role="group" aria-label="Device selection">
            <div>
              <label htmlFor="camera-select" className="text-sm font-medium">Camera</label>
              <select
                id="camera-select"
                value={selectedCamera}
                onChange={e => setSelectedCamera(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                {cameras.map(camera => (
                  <option key={camera.deviceId} value={camera.deviceId}>{camera.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mic-select" className="text-sm font-medium">Microphone</label>
              <select
                id="mic-select"
                value={selectedMicrophone}
                onChange={e => setSelectedMicrophone(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                {microphones.map(mic => (
                  <option key={mic.deviceId} value={mic.deviceId}>{mic.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="speaker-select" className="text-sm font-medium">Speaker</label>
              <select
                id="speaker-select"
                value={selectedSpeaker}
                onChange={e => setSelectedSpeaker(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                {speakers.map(speaker => (
                  <option key={speaker.deviceId} value={speaker.deviceId}>{speaker.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={onJoinCall}
            className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Join Consultation
          </button>

          <div className="text-center text-sm text-gray-500" aria-live="polite">
            <p>Ready to join? Click the button above when you're ready.</p>
            <p className="mt-2">
              <span className="px-2 py-1 border rounded" role="status">Waiting for other participant</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}