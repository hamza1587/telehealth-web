import React from 'react'
import type { Participant } from 'livekit-client'

interface ParticipantListProps {
  participants: Participant[]
  localParticipant?: Participant | null
  isLocalMuted?: boolean
  isLocalCameraOff?: boolean
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  localParticipant,
  isLocalMuted = false,
  isLocalCameraOff = false
}) => {
  const getParticipantName = (p: Participant) => p.name || p.identity || 'Unknown'
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const getMicStatus = (p: Participant) => {
    const audioTrack = p.audioTrackPublications.values().next().value
    return audioTrack?.isMuted ?? false
  }

  const getCameraStatus = (p: Participant) => {
    const videoTrack = p.videoTrackPublications.values().next().value
    return videoTrack?.isMuted ?? false
  }

  return (
    <div className="border rounded-lg bg-white">
      <div className="p-3 border-b">
        <h3 className="font-semibold">Participants</h3>
        <span className="text-xs text-gray-500" aria-live="polite">
          {participants.length + (localParticipant ? 1 : 0)} in call
        </span>
      </div>

      <div className="p-3 space-y-3">
        {localParticipant && (
          <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
              {getInitials(getParticipantName(localParticipant))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getParticipantName(localParticipant)} (You)</p>
            </div>
            <div className="flex gap-2">
              <span aria-label={isLocalMuted ? 'Muted' : 'Unmuted'} className="text-xs">
                {isLocalMuted ? '🔇' : '🎤'}
              </span>
              <span aria-label={isLocalCameraOff ? 'Camera off' : 'Camera on'} className="text-xs">
                {isLocalCameraOff ? '📹 Off' : '📹 On'}
              </span>
            </div>
          </div>
        )}

        {participants.map(participant => (
          <div key={participant.identity} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs">
              {getInitials(getParticipantName(participant))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getParticipantName(participant)}</p>
            </div>
            <div className="flex gap-2">
              <span aria-label={getMicStatus(participant) ? 'Muted' : 'Unmuted'} className="text-xs">
                {getMicStatus(participant) ? '🔇' : '🎤'}
              </span>
              <span aria-label={getCameraStatus(participant) ? 'Camera off' : 'Camera on'} className="text-xs">
                {getCameraStatus(participant) ? '📹 Off' : '📹 On'}
              </span>
            </div>
          </div>
        ))}

        {participants.length === 0 && !localParticipant && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No participants yet</p>
          </div>
        )}
      </div>
    </div>
  )
}