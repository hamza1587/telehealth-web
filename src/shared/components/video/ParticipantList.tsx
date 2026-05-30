import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';
import { Participant } from 'livekit-client';

interface ParticipantListProps {
  participants: Participant[];
  localParticipant?: Participant | null;
  isLocalMuted?: boolean;
  isLocalCameraOff?: boolean;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  localParticipant,
  isLocalMuted = false,
  isLocalCameraOff = false
}) => {
  const getParticipantName = (participant: Participant) => {
    return participant.name || participant.identity || 'Unknown';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMicStatus = (participant: Participant) => {
    const audioTrack = participant.audioTrackPublications.values().next().value;
    return audioTrack?.isMuted ?? false;
  };

  const getCameraStatus = (participant: Participant) => {
    const videoTrack = participant.videoTrackPublications.values().next().value;
    return videoTrack?.isMuted ?? false;
  };

  return (
    <div className="border rounded-lg bg-white">
      {/* Header */}
      <div className="p-3 border-b">
        <h3 className="font-semibold">Participants</h3>
        <Badge variant="secondary" className="mt-1">
          {participants.length + (localParticipant ? 1 : 0)} in call
        </Badge>
      </div>

      {/* Participant List */}
      <div className="p-3 space-y-3">
        {/* Local Participant */}
        {localParticipant && (
          <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-500 text-white text-xs">
                {getInitials(getParticipantName(localParticipant))}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {getParticipantName(localParticipant)} (You)
              </p>
            </div>
            <div className="flex gap-2">
              {isLocalMuted ? (
                <MicOff className="w-4 h-4 text-red-500" aria-label="Muted" />
              ) : (
                <Mic className="w-4 h-4 text-green-500" aria-label="Unmuted" />
              )}
              {isLocalCameraOff ? (
                <VideoOff className="w-4 h-4 text-red-500" aria-label="Camera off" />
              ) : (
                <Video className="w-4 h-4 text-green-500" aria-label="Camera on" />
              )}
            </div>
          </div>
        )}

        {/* Remote Participants */}
        {participants.map(participant => (
          <div
            key={participant.identity}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-500 text-white text-xs">
                {getInitials(getParticipantName(participant))}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {getParticipantName(participant)}
              </p>
            </div>
            <div className="flex gap-2">
              {getMicStatus(participant) ? (
                <MicOff className="w-4 h-4 text-red-500" aria-label="Muted" />
              ) : (
                <Mic className="w-4 h-4 text-green-500" aria-label="Unmuted" />
              )}
              {getCameraStatus(participant) ? (
                <VideoOff className="w-4 h-4 text-red-500" aria-label="Camera off" />
              ) : (
                <Video className="w-4 h-4 text-green-500" aria-label="Camera on" />
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {participants.length === 0 && !localParticipant && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No participants yet</p>
          </div>
        )}
      </div>
    </div>
  );
};