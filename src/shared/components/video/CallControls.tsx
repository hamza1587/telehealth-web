import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MessageSquare, 
  ScreenShare, 
  ScreenShareOff,
  PhoneOff,
  Circle,
  Users
} from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onEndCall: () => void;
  onToggleChat?: () => void;
  onToggleParticipants?: () => void;
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
  return (
    <div className="flex justify-center gap-2 p-4 bg-gray-100 rounded-lg">
      {/* Microphone */}
      <Button
        variant={isMuted ? "destructive" : "default"}
        size="icon"
        onClick={onToggleMic}
        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        data-testid="mic-toggle"
      >
        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </Button>

      {/* Camera */}
      <Button
        variant={isCameraOff ? "destructive" : "default"}
        size="icon"
        onClick={onToggleCamera}
        aria-label={isCameraOff ? "Turn on camera" : "Turn off camera"}
        data-testid="camera-toggle"
      >
        {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
      </Button>

      {/* Screen Share */}
      <Button
        variant={isScreenSharing ? "secondary" : "outline"}
        size="icon"
        onClick={onToggleScreenShare}
        aria-label={isScreenSharing ? "Stop screen sharing" : "Share screen"}
        data-testid="screen-share-toggle"
      >
        {isScreenSharing ? <ScreenShareOff className="w-4 h-4" /> : <ScreenShare className="w-4 h-4" />}
      </Button>

      {/* Recording */}
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        onClick={onToggleRecording}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        data-testid="recording-toggle"
        className={isRecording ? "animate-pulse" : ""}
      >
        <Circle className={`w-4 h-4 ${isRecording ? "fill-red-500 text-red-500" : ""}`} />
      </Button>

      {/* Chat */}
      {onToggleChat && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleChat}
          aria-label="Toggle chat"
          data-testid="chat-toggle"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      )}

      {/* Participants */}
      {onToggleParticipants && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleParticipants}
          aria-label="Toggle participants"
          data-testid="participants-toggle"
        >
          <Users className="w-4 h-4" />
        </Button>
      )}

      {/* End Call */}
      <Button
        variant="destructive"
        size="icon"
        onClick={onEndCall}
        aria-label="End call"
        data-testid="end-call"
        className="ml-4"
      >
        <PhoneOff className="w-4 h-4" />
      </Button>
    </div>
  );
};