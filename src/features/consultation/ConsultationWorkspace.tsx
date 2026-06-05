import { useState, useEffect, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material'
import { VideoConsultationRoom } from '@shared/components/video/VideoConsultationRoom'
import { apiBaseUrl, livekitServerUrl } from '@shared/config/patient.ts'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import { SectionHeader } from '@shared/components/common/SectionHeader.tsx'
import type { Appointment, AppointmentStatus } from '@shared/types/appointment.ts'
import type { SessionTokenResponse } from '@shared/types/consultation.ts'

const JOINABLE: AppointmentStatus[] = ['confirmed', 'patient_waiting', 'doctor_waiting', 'in_progress']
const RECENT: AppointmentStatus[] = ['completed', 'failed_technical', 'refunded', 'no_show_patient', 'no_show_doctor']

function statusChipColor(
  status: AppointmentStatus,
): 'default' | 'primary' | 'warning' | 'success' | 'error' {
  if (status === 'in_progress') return 'success'
  if (status === 'confirmed') return 'primary'
  if (status === 'patient_waiting' || status === 'doctor_waiting') return 'warning'
  if (status === 'completed') return 'default'
  return 'error'
}

function statusLabel(status: AppointmentStatus): string {
  const map: Partial<Record<AppointmentStatus, string>> = {
    draft: 'Draft',
    pending_payment: 'Pending Payment',
    confirmed: 'Confirmed',
    patient_waiting: 'Waiting — Patient',
    doctor_waiting: 'Waiting — Doctor',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled_patient: 'Cancelled',
    cancelled_doctor: 'Cancelled',
    no_show_patient: 'No Show',
    no_show_doctor: 'No Show',
    failed_technical: 'Technical Failure',
    refunded: 'Refunded',
  }
  return map[status] ?? status
}

export function ConsultationWorkspace() {
  const { user, isAuthenticated } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<SessionTokenResponse | null>(null)

  const fetchAppointments = useCallback(async () => {
    setLoadingList(true)
    setListError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/platform/appointments/my-appointments`)
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `Request failed (${response.status})`)
      }
      const data: unknown = await response.json()
      if (Array.isArray(data)) {
        setAppointments(data as Appointment[])
      } else {
        const obj = data as { appointments?: Appointment[] }
        setAppointments(obj.appointments ?? [])
      }
    } catch (err) {
      console.error('[API Error] Failed to load appointments:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      })
      setListError('Could not load appointments. Check that the platform API is running.')
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      void fetchAppointments()
    }
  }, [isAuthenticated, fetchAppointments])

  const handleJoin = useCallback(async (appointmentId: string) => {
    setJoiningId(appointmentId)
    setJoinError(null)
    try {
      const response = await fetch(
        `${apiBaseUrl}/platform/consultations/${appointmentId}/join`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      )
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `Failed to join (${response.status})`)
      }
      const token = (await response.json()) as SessionTokenResponse
      setActiveAppointmentId(appointmentId)
      setSessionToken(token)
    } catch (err) {
      console.error('[API Error] Failed to join consultation:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        appointmentId,
      })
      setJoinError('Could not join the consultation. Please try again.')
    } finally {
      setJoiningId(null)
    }
  }, [])

  const handleCallEnd = useCallback(() => {
    setActiveAppointmentId(null)
    setSessionToken(null)
    void fetchAppointments()
  }, [fetchAppointments])

  if (sessionToken && activeAppointmentId) {
    return (
      <VideoConsultationRoom
        sessionId={activeAppointmentId}
        token={sessionToken.token}
        serverUrl={livekitServerUrl}
        isDoctor={user?.userType === 'Doctor'}
        userId={user?.userId ?? ''}
        userName={user?.displayName ?? user?.email ?? 'User'}
        onCallEnd={handleCallEnd}
      />
    )
  }

  const upcoming = appointments.filter((a) => JOINABLE.includes(a.status))
  const recent = appointments.filter((a) => RECENT.includes(a.status))

  return (
    <Stack spacing={3}>
      <SectionHeader
        eyebrow="Teleconsultation"
        title="Video Consultations"
        status={
          !isAuthenticated
            ? 'Sign in required'
            : upcoming.length > 0
              ? `${upcoming.length} joinable`
              : 'No active sessions'
        }
        statusColor={upcoming.length > 0 ? 'warning' : 'default'}
      />

      {!isAuthenticated && (
        <Alert severity="info">
          Sign in to view and join your consultation appointments.
        </Alert>
      )}

      {isAuthenticated && (
        <>
          {listError && (
            <Alert
              severity="error"
              onClose={() => setListError(null)}
              action={
                <Button size="small" onClick={() => void fetchAppointments()}>
                  Retry
                </Button>
              }
            >
              {listError}
            </Alert>
          )}

          {joinError && (
            <Alert severity="error" onClose={() => setJoinError(null)}>
              {joinError}
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Upcoming &amp; Active
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => void fetchAppointments()}
                disabled={loadingList}
                startIcon={
                  loadingList ? <CircularProgress size={14} color="inherit" /> : undefined
                }
              >
                Refresh
              </Button>
            </Stack>

            {loadingList && upcoming.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : upcoming.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <VideoCallIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                  No upcoming consultations
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Book an appointment in the Discovery workspace to get started.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {upcoming.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appointment={appt}
                    joining={joiningId === appt.id}
                    onJoin={handleJoin}
                  />
                ))}
              </Stack>
            )}
          </Paper>

          {recent.length > 0 && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Recent Sessions
              </Typography>
              <Stack divider={<Divider />}>
                {recent.slice(0, 5).map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appointment={appt}
                    joining={false}
                    onJoin={handleJoin}
                    past
                  />
                ))}
              </Stack>
            </Paper>
          )}
        </>
      )}
    </Stack>
  )
}

interface AppointmentRowProps {
  appointment: Appointment
  joining: boolean
  onJoin: (id: string) => void
  past?: boolean
}

function AppointmentRow({ appointment, joining, onJoin, past = false }: AppointmentRowProps) {
  const isJoinable = JOINABLE.includes(appointment.status)
  const start = new Date(appointment.scheduledStart)
  const end = new Date(appointment.scheduledEnd)
  const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: past ? 1.5 : 2,
        borderRadius: 2,
        ...(isJoinable && {
          border: '1px solid',
          borderColor: 'primary.light',
          bgcolor: 'action.hover',
        }),
      }}
    >
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonIcon sx={{ fontSize: 15, color: 'text.secondary', flexShrink: 0 }} />
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {appointment.doctorName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {appointment.doctorSpecialty}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <ScheduleIcon sx={{ fontSize: 13, color: 'text.secondary', flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary">
            {start.toLocaleDateString()} · {start.toLocaleTimeString([], timeOpts)}
            {' – '}
            {end.toLocaleTimeString([], timeOpts)}
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
        <Chip
          label={statusLabel(appointment.status)}
          color={statusChipColor(appointment.status)}
          size="small"
          variant="outlined"
        />
        {!past && isJoinable && (
          <Button
            variant="contained"
            size="small"
            onClick={() => onJoin(appointment.id)}
            disabled={joining}
            startIcon={
              joining ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <VideoCallIcon />
              )
            }
          >
            {joining ? 'Joining…' : 'Join Now'}
          </Button>
        )}
      </Stack>
    </Box>
  )
}
