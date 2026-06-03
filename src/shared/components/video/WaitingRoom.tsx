import React, { useEffect, useRef, useCallback } from 'react'
import { useDevices } from '@shared/hooks/useDevices'
import { DeviceSelector } from './DeviceSelector'
import { NetworkQualityBadge } from './NetworkQualityBadge'
import type { NetworkQuality } from './NetworkQualityBadge'

interface WaitingRoomProps {
  onJoinCall: () => void
  isDoctor?: boolean
  networkQuality?: NetworkQuality
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  onJoinCall,
  isDoctor = false,
  networkQuality = 'unknown',
}) => {
  const {
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
  } = useDevices()

  const videoRef = useRef<HTMLVideoElement>(null)

  // Attach preview stream to the video element
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (previewStream) {
      el.srcObject = previewStream
    } else {
      el.srcObject = null
    }
  }, [previewStream])

  const cameraEnabled = cameraPermission === 'granted'
  const micEnabled = micPermission === 'granted'
  const canJoin = !isLoading && (cameraPermission === 'granted' || cameraPermission === 'prompt')

  const handleToggleCamera = useCallback(async () => {
    if (!previewStream) return
    previewStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
  }, [previewStream])

  const handleToggleMic = useCallback(async () => {
    if (!previewStream) return
    previewStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
  }, [previewStream])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md border rounded-lg bg-white shadow-sm">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {isDoctor ? 'Doctor Waiting Room' : 'Patient Waiting Room'}
          </h1>
          <NetworkQualityBadge quality={networkQuality} showLabel />
        </div>

        <div className="p-6 space-y-6">
          {/* Camera preview */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover transition-opacity ${previewStream && cameraEnabled ? 'opacity-100' : 'opacity-0'}`}
              aria-label="Camera preview"
            />
            {(!previewStream || !cameraEnabled) && (
              <div
                className="absolute inset-0 flex items-center justify-center text-white"
                aria-hidden="true"
              >
                <span className="text-sm text-gray-400">Camera Off</span>
              </div>
            )}
            <span className="absolute top-2 left-2 px-2 py-1 text-xs rounded bg-black/70 text-white pointer-events-none">
              {cameraEnabled ? 'Camera On' : 'Camera Off'}
            </span>
          </div>

          {/* Quick toggles */}
          <div className="flex justify-center gap-4" role="group" aria-label="Quick device controls">
            <button
              type="button"
              onClick={handleToggleMic}
              disabled={micPermission !== 'granted'}
              aria-label={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
              className={`px-4 py-2 rounded font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                micEnabled
                  ? 'bg-blue-500 text-white focus:ring-blue-500'
                  : 'bg-red-500 text-white focus:ring-red-500'
              }`}
            >
              {micEnabled ? 'Mic On' : 'Mic Off'}
            </button>

            <button
              type="button"
              onClick={handleToggleCamera}
              disabled={cameraPermission !== 'granted'}
              aria-label={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              className={`px-4 py-2 rounded font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                cameraEnabled
                  ? 'bg-blue-500 text-white focus:ring-blue-500'
                  : 'bg-red-500 text-white focus:ring-red-500'
              }`}
            >
              {cameraEnabled ? 'Camera On' : 'Camera Off'}
            </button>
          </div>

          {/* Device selection */}
          <DeviceSelector
            cameras={cameras}
            microphones={microphones}
            speakers={speakers}
            selectedCamera={selectedCamera}
            selectedMicrophone={selectedMicrophone}
            selectedSpeaker={selectedSpeaker}
            onCameraChange={setSelectedCamera}
            onMicrophoneChange={setSelectedMicrophone}
            onSpeakerChange={setSelectedSpeaker}
            cameraPermission={cameraPermission}
            micPermission={micPermission}
            onRequestPermissions={requestPermissions}
            isLoading={isLoading}
            error={error}
          />

          {/* Join button */}
          <button
            type="button"
            onClick={onJoinCall}
            disabled={!canJoin}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Join consultation"
          >
            {isLoading ? 'Checking devices…' : 'Join Consultation'}
          </button>

          <p className="text-center text-sm text-gray-500" aria-live="polite" role="status">
            Ready to join? Click the button above when you're ready.
          </p>
        </div>
      </div>
    </div>
  )
}
