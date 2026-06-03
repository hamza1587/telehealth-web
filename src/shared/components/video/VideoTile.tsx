import React, { useRef, useEffect } from 'react'
import type { RemoteTrack, LocalTrack } from 'livekit-client'

interface VideoTileProps {
  track?: RemoteTrack | LocalTrack
  name: string
  isLocal?: boolean
  isMuted?: boolean
  isCameraOff?: boolean
  connectionQuality?: 'good' | 'medium' | 'poor'
  isScreenShare?: boolean
}

const qualityColor: Record<string, string> = {
  good: 'bg-green-500',
  medium: 'bg-yellow-500',
  poor: 'bg-red-500',
}

export const VideoTile: React.FC<VideoTileProps> = ({
  track,
  name,
  isLocal = false,
  isMuted = false,
  isCameraOff = false,
  connectionQuality = 'good',
  isScreenShare = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el || !track || isCameraOff) return
    track.attach(el)
    return () => {
      track.detach(el)
    }
  }, [track, isCameraOff])

  const showVideo = !!track && !isCameraOff

  return (
    <div
      className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden"
      role="group"
      aria-label={`Video tile for ${name}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-opacity ${showVideo ? 'opacity-100' : 'opacity-0 absolute'}`}
        aria-label={`Video feed for ${name}`}
      />

      {!showVideo && (
        <div className="flex items-center justify-center h-full text-white select-none" aria-hidden="true">
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-xl font-semibold">
            {name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      )}

      <span className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded bg-black/70 text-white pointer-events-none">
        {isLocal ? `${name} (You)` : name}
      </span>

      <div className="absolute top-2 right-2 flex gap-1" role="group" aria-label="Status indicators">
        <div
          className={`w-2.5 h-2.5 rounded-full ${qualityColor[connectionQuality] ?? 'bg-gray-500'}`}
          title={`Connection: ${connectionQuality}`}
          aria-label={`Connection quality: ${connectionQuality}`}
        />
        {isMuted && (
          <span className="bg-red-600 text-white text-xs px-1 rounded" aria-label="Muted">
            Muted
          </span>
        )}
      </div>

      {isScreenShare && (
        <span className="absolute top-2 left-2 px-2 py-1 text-xs rounded bg-blue-600 text-white pointer-events-none">
          Screen Share
        </span>
      )}
    </div>
  )
}
