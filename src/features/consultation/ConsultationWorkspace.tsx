import React, { useState, useEffect } from 'react';
import { VideoConsultationRoom } from '@/components/video/VideoConsultationRoom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock } from 'lucide-react';

interface ConsultationSession {
  id: string;
  patientName: string;
  doctorName: string;
  scheduledTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export const ConsultationWorkspace: React.FC = () => {
  const [activeSession, setActiveSession] = useState<ConsultationSession | null>(null);
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);

  useEffect(() => {
    // Mock consultation sessions
    const mockSessions: ConsultationSession[] = [
      {
        id: '1',
        patientName: 'John Doe',
        doctorName: 'Dr. Smith',
        scheduledTime: new Date(),
        status: 'scheduled'
      },
      {
        id: '2',
        patientName: 'Jane Wilson',
        doctorName: 'Dr. Johnson',
        scheduledTime: new Date(Date.now() + 3600000),
        status: 'scheduled'
      }
    ];
    setSessions(mockSessions);
  }, []);

  const startConsultation = (session: ConsultationSession) => {
    setActiveSession({
      ...session,
      status: 'in-progress'
    });
  };

  const endConsultation = () => {
    if (activeSession) {
      setSessions(prev => 
        prev.map(s => 
          s.id === activeSession.id 
            ? { ...s, status: 'completed' }
            : s
        )
      );
      setActiveSession(null);
    }
  };

  if (activeSession) {
    return (
      <VideoConsultationRoom
        sessionId={activeSession.id}
        token="mock-token" // In real app, this would come from API
        serverUrl="wss://your-livekit-server.com"
        isDoctor={true}
        userId="current-user-id"
        userName="Current User"
      />
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Video Consultations</h1>
        <p className="text-muted-foreground mt-2">
          Manage and join video consultation sessions
        </p>
      </div>

      <div className="grid gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button className="flex-1">
                <Video className="w-4 h-4 mr-2" />
                Start New Consultation
              </Button>
              <Button variant="outline" className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Consultation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Consultations */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.filter(s => s.status === 'scheduled').map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{session.patientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        with {session.doctorName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {session.scheduledTime.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Scheduled</Badge>
                    <Button 
                      size="sm"
                      onClick={() => startConsultation(session)}
                    >
                      Join Now
                    </Button>
                  </div>
                </div>
              ))}
              {sessions.filter(s => s.status === 'scheduled').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No scheduled consultations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Consultations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.filter(s => s.status === 'completed').map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Video className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{session.patientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        with {session.doctorName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Completed at {session.scheduledTime.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              ))}
              {sessions.filter(s => s.status === 'completed').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent consultations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};