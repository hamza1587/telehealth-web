import React from 'react'
import type { DeviceInfo, PermissionState } from '@shared/hooks/useDevices'

interface DeviceSelectorProps {
  cameras: DeviceInfo[]
  microphones: DeviceInfo[]
  speakers: DeviceInfo[]
  selectedCamera: string
  selectedMicrophone: string
  selectedSpeaker: string
  onCameraChange: (id: string) => void
  onMicrophoneChange: (id: string) => void
  onSpeakerChange: (id: string) => void
  cameraPermission: PermissionState
  micPermission: PermissionState
  onRequestPermissions: () => void
  isLoading?: boolean
  error?: string | null
}

const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
const selectClass =
  'w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed'

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  cameras,
  microphones,
  speakers,
  selectedCamera,
  selectedMicrophone,
  selectedSpeaker,
  onCameraChange,
  onMicrophoneChange,
  onSpeakerChange,
  cameraPermission,
  micPermission,
  onRequestPermissions,
  isLoading = false,
  error,
}) => {
  const permissionDenied = cameraPermission === 'denied' || micPermission === 'denied'
  const permissionUnsupported = cameraPermission === 'unsupported'

  if (permissionUnsupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg" role="alert">
        <p className="text-sm text-yellow-800 font-medium">Browser not supported</p>
        <p className="text-xs text-yellow-700 mt-1">
          Please use Chrome, Firefox, or Safari to access camera and microphone.
        </p>
      </div>
    )
  }

  if (permissionDenied) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2" role="alert">
        <p className="text-sm text-red-800 font-medium">Camera / microphone access denied</p>
        <p className="text-xs text-red-700">
          Allow access in your browser's site settings, then reload the page.
        </p>
        <button
          type="button"
          onClick={onRequestPermissions}
          className="text-xs underline text-red-700 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4" role="group" aria-label="Device selection">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="assertive">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="device-camera" className={labelClass}>
          Camera
        </label>
        <select
          id="device-camera"
          value={selectedCamera}
          onChange={e => onCameraChange(e.target.value)}
          className={selectClass}
          disabled={isLoading || cameras.length === 0}
          aria-label="Select camera"
        >
          {cameras.length === 0 && <option value="">No camera found</option>}
          {cameras.map(cam => (
            <option key={cam.deviceId} value={cam.deviceId}>
              {cam.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="device-microphone" className={labelClass}>
          Microphone
        </label>
        <select
          id="device-microphone"
          value={selectedMicrophone}
          onChange={e => onMicrophoneChange(e.target.value)}
          className={selectClass}
          disabled={isLoading || microphones.length === 0}
          aria-label="Select microphone"
        >
          {microphones.length === 0 && <option value="">No microphone found</option>}
          {microphones.map(mic => (
            <option key={mic.deviceId} value={mic.deviceId}>
              {mic.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="device-speaker" className={labelClass}>
          Speaker
        </label>
        <select
          id="device-speaker"
          value={selectedSpeaker}
          onChange={e => onSpeakerChange(e.target.value)}
          className={selectClass}
          disabled={isLoading || speakers.length === 0}
          aria-label="Select speaker"
        >
          {speakers.length === 0 && <option value="">Default speaker</option>}
          {speakers.map(spk => (
            <option key={spk.deviceId} value={spk.deviceId}>
              {spk.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <p className="text-xs text-gray-500" aria-live="polite" role="status">
          Detecting devices…
        </p>
      )}
    </div>
  )
}
