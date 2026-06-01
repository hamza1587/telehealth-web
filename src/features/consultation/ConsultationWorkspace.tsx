import React, { useState, useEffect } from 'react'
import { useVideoService } from './hooks/useVideoService'
import { VideoConsultationRoom } from '@shared/components/video/VideoConsultationRoom'

interface ConsultationSession {
  id: string
  patientName: string
  doctorName: string
  scheduledTime: Date
  status: 'scheduled' | 'in-progress' | 'completed'
}

export const ConsultationWorkspace: React.FC = () => {
  const [activeSession, setActiveSession] = useState<ConsultationSession | null>(null)
  const [sessions, setSessions] = useState<ConsultationSession[]>([])
  const [roomToken, setRoomToken] = useState<{ roomUrl: string; token: string } | null>(null)
  const { createRoom, activateRoom, generateToken, loading, error } = useVideoService()

  useEffect(() => {
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
    ]
    setSessions(mockSessions)
  }, [])

  const startConsultation = async (session: ConsultationSession) => {
    try {
      // Create video room
      const room = await createRoom(
        `Consultation with ${session.patientName}`,
        10,
        'US'
      )

      // Activate the room
      const activeRoom = await activateRoom(room.id)

      // Generate token for current user
      const token = await generateToken(activeRoom.id, 'doctor-user-id')

      setRoomToken({
        roomUrl: activeRoom.twilioRoomSid || '',
        token: token
      })

      setActiveSession({ ...session, status: 'in-progress' })
    } catch (err) {
      console.error('Failed to start consultation:', err)
    }
  }

  if (activeSession && roomToken) {
    return (
      <VideoConsultationRoom
        sessionId={activeSession.id}
        token={roomToken.token}
        serverUrl="wss://your-livekit-server.com"
        isDoctor={true}
        userId="doctor-user-id"
        userName="Dr. Smith"
      />
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Video Consultations</h1>
        <p className="text-gray-500 mt-2">
          Manage and join video consultation sessions
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="border rounded-lg bg-white shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Quick Start</h2>
          </div>
          <div className="p-4">
            <div className="flex gap-4">
              <button
                type="button"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Starting...' : 'Start New Consultation'}
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              >
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg bg-white shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Scheduled Consultations</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {sessions.filter(s => s.status === 'scheduled').map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">📹</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{session.patientName}</h3>
                      <p className="text-sm text-gray-500">
                        with {session.doctorName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.scheduledTime.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 border rounded text-sm">Scheduled</span>
                    <button
                      type="button"
                      onClick={() => startConsultation(session)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Joining...' : 'Join Now'}
                    </button>
                  </div>
                </div>
              ))}
              {sessions.filter(s => s.status === 'scheduled').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No scheduled consultations</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border rounded-lg bg-white shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Recent Consultations</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {sessions.filter(s => s.status === 'completed').map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">✓</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{session.patientName}</h3>
                      <p className="text-sm text-gray-500">
                        with {session.doctorName}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-gray-200 rounded text-sm">Completed</span>
                </div>
              ))}
              {sessions.filter(s => s.status === 'completed').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent consultations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}