import React from 'react'

interface RecordingIndicatorProps {
  isRecording: boolean
  duration?: number
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({ isRecording, duration = 0 }) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isRecording) return null

  return (
    <div
      className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg"
      role="status"
      aria-live="polite"
      aria-label={`Recording in progress. Duration: ${formatDuration(duration)}`}
    >
      <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
      <span className="text-xs font-bold text-red-700">REC</span>
      <span className="text-sm font-mono text-red-700">{formatDuration(duration)}</span>
      <span className="text-xs text-red-600 ml-auto">Recording in progress</span>
    </div>
  )
}