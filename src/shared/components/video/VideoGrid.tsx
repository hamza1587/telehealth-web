import React from 'react'
import { VideoTile } from './VideoTile'
import { Participant } from 'livekit-client'

interface VideoGridProps {
  localParticipant?: Participant | null
  remoteParticipants: Participant[]
  localStream?: MediaStream
  isLocalMuted?: boolean
  isLocalCameraOff?: boolean
  isScreenSharing?: boolean
  screenShareStream?: MediaStream
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localParticipant,
  remoteParticipants,
  localStream,
  isLocalMuted = false,
  isLocalCameraOff = false,
  isScreenSharing = false,
  screenShareStream
}) => {
  const getParticipantName = (p: Participant) => p.name || p.identity || 'Unknown'

  return (
    <div className={`grid gap-4 ${isScreenSharing && screenShareStream ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
      {isScreenSharing && screenShareStream && (
        <div className="col-span-full">
          <VideoTile stream={screenShareStream} name="Screen Share" isScreenShare />
        </div>
      )}

      {localParticipant && (
        <VideoTile
          stream={localStream}
          name={getParticipantName(localParticipant)}
          isLocal
          isMuted={isLocalMuted}
          isCameraOff={isLocalCameraOff}
        />
      )}

      {remoteParticipants.map(participant => (
        <VideoTile
          key={participant.identity}
          name={getParticipantName(participant)}
        />
      ))}

      {remoteParticipants.length === 0 && !localParticipant && (
        <div className="col-span-full flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">Waiting for participants...</p>
            <p className="text-sm mt-1">Others will join shortly</p>
          </div>
        </div>
      )}
    </div>
  )
}