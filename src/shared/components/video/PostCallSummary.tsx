import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Video, Download, Calendar } from 'lucide-react';

interface PostCallSummaryProps {
  callDuration: number;
  participantCount: number;
  wasRecorded: boolean;
  recordingUrl?: string;
  onDownloadRecording?: () => void;
  onScheduleFollowUp?: () => void;
  onEnd: () => void;
}

export const PostCallSummary: React.FC<PostCallSummaryProps> = ({
  callDuration,
  participantCount,
  wasRecorded,
  recordingUrl,
  onDownloadRecording,
  onScheduleFollowUp,
  onEnd
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Call Ended</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-lg font-semibold">{formatDuration(callDuration)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Participants</p>
                <p className="text-lg font-semibold">{participantCount}</p>
              </div>
            </div>
          </div>

          {/* Recording Status */}
          {wasRecorded && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Recording Available</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                This consultation was recorded with consent.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {wasRecorded && onDownloadRecording && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onDownloadRecording}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Recording
              </Button>
            )}
            {onScheduleFollowUp && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onScheduleFollowUp}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </Button>
            )}
            <Button
              className="w-full"
              onClick={onEnd}
            >
              Return to Dashboard
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>Thank you for using the consultation platform.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};