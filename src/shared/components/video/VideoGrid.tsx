import React from 'react';
import { VideoTile } from './VideoTile';
import { Participant } from 'livekit-client';

interface VideoGridProps {
  localParticipant?: Participant | null;
  remoteParticipants: Participant[];
  localStream?: MediaStream;
  isLocalMuted?: boolean;
  isLocalCameraOff?: boolean;
  isScreenSharing?: boolean;
  screenShareStream?: MediaStream;
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
  const getParticipantName = (participant: Participant) => {
    return participant.name || participant.identity || 'Unknown';
  };

  const getParticipantStream = (participant: Participant) => {
    const videoTrack = participant.videoTrackPublications.values().next().value;
    return videoTrack?.track?.mediaStreamTrack ? new MediaStream([videoTrack.track.mediaStreamTrack]) : undefined;
  };

  return (
    <div className={`grid gap-4 ${isScreenSharing ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'}`}>
      {/* Screen Share View */}
      {isScreenSharing && screenShareStream && (
        <div className="col-span-full">
          <VideoTile
            stream={screenShareStream}
            name="Screen Share"
            isScreenShare={true}
          />
        </div>
      )}

      {/* Local Participant */}
      {localParticipant && (
        <VideoTile
          stream={localStream}
          name={getParticipantName(localParticipant)}
          isLocal={true}
          isMuted={isLocalMuted}
          isCameraOff={isLocalCameraOff}
          connectionQuality="good"
        />
      )}

      {/* Remote Participants */}
      {remoteParticipants.map(participant => (
        <VideoTile
          key={participant.identity}
          stream={getParticipantStream(participant)}
          name={getParticipantName(participant)}
          isLocal={false}
          connectionQuality="good"
        />
      ))}

      {/* Empty State */}
      {remoteParticipants.length === 0 && (
        <div className="col-span-full flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">Waiting for participants...</p>
            <p className="text-sm mt-1">Others will join shortly</p>
          </div>
        </div>
      )}
    </div>
  );
};