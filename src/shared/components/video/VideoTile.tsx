import React from 'react'

interface VideoTileProps {
  stream?: MediaStream
  name: string
  isLocal?: boolean
  isMuted?: boolean
  isCameraOff?: boolean
  connectionQuality?: 'good' | 'medium' | 'poor'
  isScreenShare?: boolean
}

export const VideoTile: React.FC<VideoTileProps> = ({
  stream,
  name,
  isLocal = false,
  isMuted = false,
  isCameraOff = false,
  connectionQuality = 'good',
  isScreenShare = false
}) => {
  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'good': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden" role="group" aria-label={`Video tile for ${name}`}>
      {stream && !isCameraOff ? (
        <video
          autoPlay
          muted={isLocal}
          playsInline
          ref={video => {
            if (video) video.srcObject = stream
          }}
          className="w-full h-full object-cover"
          aria-label={`Video feed for ${name}`}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <span>{name}</span>
        </div>
      )}

      <span className="absolute bottom-2 left-2 px-2 py-1 text-xs rounded bg-black/70 text-white">
        {isLocal ? `${name} (You)` : name}
      </span>

      <div className="absolute top-2 right-2 flex gap-2" role="group" aria-label="Call status indicators">
        <div
          className={`w-3 h-3 rounded-full ${getQualityColor()}`}
          aria-label={`Connection quality: ${connectionQuality}`}
          aria-hidden="true"
          title={`Connection: ${connectionQuality}`}
        />
        <div className="bg-black/70 rounded-full p-1">
          {isMuted ? (
            <span className="text-red-500 text-xs" aria-label="Muted">Muted</span>
          ) : (
            <span className="text-green-500 text-xs" aria-label="Unmuted">Unmuted</span>
          )}
        </div>
      </div>

      {isScreenShare && (
        <span className="absolute top-2 left-2 px-2 py-1 text-xs rounded bg-blue-500 text-white">
          Screen Share
        </span>
      )}
    </div>
  )
}