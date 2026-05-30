import React from 'react'

interface CallControlsProps {
  isMuted: boolean
  isCameraOff: boolean
  isScreenSharing: boolean
  isRecording: boolean
  onToggleMic: () => void
  onToggleCamera: () => void
  onToggleScreenShare: () => void
  onToggleRecording: () => void
  onEndCall: () => void
  onToggleChat?: () => void
  onToggleParticipants?: () => void
}

export const CallControls: React.FC<CallControlsProps> = ({
  isMuted,
  isCameraOff,
  isScreenSharing,
  isRecording,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleRecording,
  onEndCall,
  onToggleChat,
  onToggleParticipants
}) => {
  const baseBtn = 'px-4 py-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2'

  return (
    <div className="flex justify-center gap-2 p-4 bg-gray-100 rounded-lg" role="toolbar" aria-label="Call controls">
      <button
        type="button"
        onClick={onToggleMic}
        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        className={`${baseBtn} ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'}`}
      >
        {isMuted ? 'Unmute' : 'Mute'}
      </button>

      <button
        type="button"
        onClick={onToggleCamera}
        aria-label={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
        className={`${baseBtn} ${isCameraOff ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'}`}
      >
        {isCameraOff ? 'Camera On' : 'Camera Off'}
      </button>

      <button
        type="button"
        onClick={onToggleScreenShare}
        aria-label={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
        className={`${baseBtn} ${isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
      >
        {isScreenSharing ? 'Stop Share' : 'Share Screen'}
      </button>

      <button
        type="button"
        onClick={onToggleRecording}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        className={`${baseBtn} ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-200 text-gray-800'}`}
      >
        {isRecording ? 'Stop Rec' : 'Record'}
      </button>

      {onToggleChat && (
        <button
          type="button"
          onClick={onToggleChat}
          aria-label="Toggle chat"
          className={`${baseBtn} bg-gray-200 text-gray-800`}
        >
          Chat
        </button>
      )}

      {onToggleParticipants && (
        <button
          type="button"
          onClick={onToggleParticipants}
          aria-label="Toggle participants"
          className={`${baseBtn} bg-gray-200 text-gray-800`}
        >
          People
        </button>
      )}

      <button
        type="button"
        onClick={onEndCall}
        aria-label="End call"
        className={`${baseBtn} bg-red-600 text-white ml-4`}
      >
        End Call
      </button>
    </div>
  )
}