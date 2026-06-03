import React, { useRef, useEffect } from 'react'
import type { RemoteTrack, LocalTrack } from 'livekit-client'

interface ScreenShareViewProps {
  track: RemoteTrack | LocalTrack
  presenterName: string
  isLocal?: boolean
  onStop?: () => void
}

export const ScreenShareView: React.FC<ScreenShareViewProps> = ({
  track,
  presenterName,
  isLocal = false,
  onStop,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    track.attach(el)
    return () => {
      track.detach(el)
    }
  }, [track])

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden bg-black"
      role="region"
      aria-label={`${presenterName} is sharing their screen`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full object-contain max-h-[60vh]"
        aria-label={`Screen share from ${presenterName}`}
      />

      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
          Screen Share
        </span>
        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
          {presenterName}{isLocal ? ' (You)' : ''}
        </span>
      </div>

      {isLocal && onStop && (
        <button
          type="button"
          onClick={onStop}
          className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black"
          aria-label="Stop sharing screen"
        >
          Stop Sharing
        </button>
      )}
    </div>
  )
}
