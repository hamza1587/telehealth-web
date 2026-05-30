import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';

interface RecordingIndicatorProps {
  isRecording: boolean;
  duration?: number;
  onConsentRequired?: () => void;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  isRecording,
  duration = 0,
  onConsentRequired
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return null;
  }

  return (
    <div 
      className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg"
      role="status"
      aria-live="polite"
      aria-label={`Recording in progress. Duration: ${formatDuration(duration)}`}
    >
      <Circle className="w-3 h-3 fill-red-500 text-red-500 animate-pulse" />
      <Badge variant="destructive" className="text-xs">
        REC
      </Badge>
      <span className="text-sm font-mono text-red-700">
        {formatDuration(duration)}
      </span>
      <span className="text-xs text-red-600 ml-auto">
        Recording in progress
      </span>
    </div>
  );
};