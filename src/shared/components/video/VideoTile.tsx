import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoTileProps {
  stream?: MediaStream;
  name: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
  connectionQuality?: 'good' | 'medium' | 'poor';
  isScreenShare?: boolean;
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
      case 'good': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden" role="group" aria-label={`Video tile for ${name}`}>
      {/* Video Feed */}
      {stream && !isCameraOff ? (
        <video
          autoPlay
          muted={isLocal}
          playsInline
          ref={video => {
            if (video) video.srcObject = stream;
          }}
          className="w-full h-full object-cover"
          data-testid="video-element"
          aria-label={`Video feed for ${name}`}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center">
            <VideoOff className="w-12 h-12 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm">{name}</p>
          </div>
        </div>
      )}

      {/* Name Badge */}
      <Badge 
        className="absolute bottom-2 left-2 bg-black/70 text-white"
        variant="secondary"
      >
        {isLocal ? `${name} (You)` : name}
      </Badge>

      {/* Status Indicators */}
      <div className="absolute top-2 right-2 flex gap-2" role="group" aria-label="Call status indicators">
        {/* Connection Quality */}
        <div 
          className={`w-3 h-3 rounded-full ${getQualityColor()}`}
          title={`Connection: ${connectionQuality}`}
          aria-label={`Connection quality: ${connectionQuality}`}
          aria-hidden="true"
        />
        
        {/* Mic Status */}
        <div className="bg-black/70 rounded-full p-1">
          {isMuted ? (
            <MicOff className="w-3 h-3 text-red-500" aria-label="Muted" />
          ) : (
            <Mic className="w-3 h-3 text-green-500" aria-label="Unmuted" />
          )}
        </div>
      </div>

      {/* Screen Share Label */}
      {isScreenShare && (
        <Badge 
          className="absolute top-2 left-2 bg-blue-500"
          variant="secondary"
        >
          Screen Share
        </Badge>
      )}
    </div>
  );
};