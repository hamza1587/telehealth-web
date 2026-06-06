import React, { memo } from 'react'
import { Track } from 'livekit-client'
import type { LocalParticipant, RemoteParticipant, LocalTrack, RemoteTrack } from 'livekit-client'
import { VideoTile } from './VideoTile'
import { ScreenShareView } from './ScreenShareView'

interface VideoGridProps {
  localParticipant?: LocalParticipant | null
  remoteParticipants: RemoteParticipant[]
  isLocalMuted?: boolean
  isLocalCameraOff?: boolean
  isScreenSharing?: boolean
  onStopScreenShare?: () => void
}

function getCameraTrack(p: LocalParticipant | RemoteParticipant): LocalTrack | RemoteTrack | undefined {
  const pub = p.getTrackPublication(Track.Source.Camera)
  return pub?.track as LocalTrack | RemoteTrack | undefined
}

function findScreenShareEntry(
  local: LocalParticipant | null | undefined,
  remotes: RemoteParticipant[],
): { track: LocalTrack | RemoteTrack; presenterName: string; isLocal: boolean } | null {
  if (local) {
    const pub = local.getTrackPublication(Track.Source.ScreenShare)
    if (pub?.track) {
      return {
        track: pub.track as LocalTrack,
        presenterName: local.name ?? local.identity,
        isLocal: true,
      }
    }
  }
  for (const remote of remotes) {
    const pub = remote.getTrackPublication(Track.Source.ScreenShare)
    if (pub?.track) {
      return {
        track: pub.track as RemoteTrack,
        presenterName: remote.name ?? remote.identity,
        isLocal: false,
      }
    }
  }
  return null
}

function getParticipantName(p: LocalParticipant | RemoteParticipant): string {
  return p.name ?? p.identity ?? 'Unknown'
}

const VideoGridBase: React.FC<VideoGridProps> = ({
  localParticipant,
  remoteParticipants,
  isLocalMuted = false,
  isLocalCameraOff = false,
  onStopScreenShare,
}) => {
  const screenShare = findScreenShareEntry(localParticipant, remoteParticipants)
  const participantCount = (localParticipant ? 1 : 0) + remoteParticipants.length

  return (
    <div className="flex flex-col gap-4 h-full">
      {screenShare && (
        <ScreenShareView
          track={screenShare.track}
          presenterName={screenShare.presenterName}
          isLocal={screenShare.isLocal}
          onStop={screenShare.isLocal ? onStopScreenShare : undefined}
        />
      )}

      <div
        className={`grid gap-3 ${
          participantCount <= 1
            ? 'grid-cols-1'
            : participantCount <= 4
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-2 md:grid-cols-3'
        } ${screenShare ? 'max-h-40 overflow-hidden' : 'flex-1'}`}
      >
        {localParticipant && (
          <VideoTile
            track={isLocalCameraOff ? undefined : (getCameraTrack(localParticipant) ?? undefined)}
            name={getParticipantName(localParticipant)}
            isLocal
            isMuted={isLocalMuted}
            isCameraOff={isLocalCameraOff}
          />
        )}

        {remoteParticipants.map(participant => (
          <VideoTile
            key={participant.identity}
            track={getCameraTrack(participant)}
            name={getParticipantName(participant)}
            isMuted={participant.isMicrophoneEnabled === false}
          />
        ))}

        {participantCount === 0 && (
          <div className="col-span-full flex items-center justify-center h-64 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
            <div className="text-center text-gray-400">
              <p className="text-lg font-medium">Waiting for participants…</p>
              <p className="text-sm mt-1">Others will join shortly</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const VideoGrid = memo(VideoGridBase)
