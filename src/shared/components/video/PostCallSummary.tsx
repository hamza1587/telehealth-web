import React from 'react'

interface PostCallSummaryProps {
  callDuration: number
  participantCount: number
  wasRecorded: boolean
  onEnd: () => void
}

export const PostCallSummary: React.FC<PostCallSummaryProps> = ({
  callDuration,
  participantCount,
  wasRecorded,
  onEnd
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} min ${secs} sec`
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md border rounded-lg bg-white shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold text-center">Call Ended</h1>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500">⏱</span>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-lg font-semibold">{formatDuration(callDuration)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500">👥</span>
              <div>
                <p className="text-sm font-medium">Participants</p>
                <p className="text-lg font-semibold">{participantCount}</p>
              </div>
            </div>
          </div>

          {wasRecorded && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">📹</span>
                <span className="font-medium">Recording Available</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                This consultation was recorded with consent.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={onEnd}
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Return to Dashboard
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Thank you for using the consultation platform.</p>
          </div>
        </div>
      </div>
    </div>
  )
}