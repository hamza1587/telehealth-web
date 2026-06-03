import React from 'react'

export type NetworkQuality = 'excellent' | 'good' | 'poor' | 'lost' | 'unknown'

interface NetworkQualityBadgeProps {
  quality: NetworkQuality
  showLabel?: boolean
  className?: string
}

const QUALITY_CONFIG: Record<NetworkQuality, { bars: number; color: string; label: string }> = {
  excellent: { bars: 4, color: 'text-green-500', label: 'Excellent' },
  good:      { bars: 3, color: 'text-green-400', label: 'Good' },
  poor:      { bars: 1, color: 'text-red-500',   label: 'Poor' },
  lost:      { bars: 0, color: 'text-red-600',   label: 'No signal' },
  unknown:   { bars: 2, color: 'text-gray-400',  label: 'Unknown' },
}

export const NetworkQualityBadge: React.FC<NetworkQualityBadgeProps> = ({
  quality,
  showLabel = false,
  className = '',
}) => {
  const { bars, color, label } = QUALITY_CONFIG[quality]
  const totalBars = 4

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
      aria-label={`Network quality: ${label}`}
      title={`Network: ${label}`}
    >
      {/* Signal bars */}
      <span className={`flex items-end gap-px ${color}`} aria-hidden="true">
        {Array.from({ length: totalBars }, (_, i) => (
          <span
            key={i}
            className="rounded-sm w-1 bg-current transition-opacity"
            style={{
              height: `${(i + 1) * 4}px`,
              opacity: i < bars ? 1 : 0.2,
            }}
          />
        ))}
      </span>

      {showLabel && (
        <span className={`text-xs font-medium ${color}`}>{label}</span>
      )}
    </span>
  )
}
