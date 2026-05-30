import { Box, Card, CardContent, Typography, Chip, Button, Alert, CircularProgress } from '@mui/material'
import EventIcon from '@mui/icons-material/Event'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import CancelIcon from '@mui/icons-material/Cancel'
import type { Appointment } from '@shared/types/appointment.ts'

interface AppointmentListProps {
  appointments: Appointment[]
  loading: boolean
  error: string | null
  onCancel: (appointmentId: string) => void
}

export function AppointmentList({ appointments, loading, error, onCancel }: AppointmentListProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  }

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return 'primary'
      case 'in_progress':
        return 'success'
      case 'completed':
        return 'default'
      case 'cancelled_patient':
      case 'cancelled_doctor':
        return 'error'
      case 'pending_payment':
        return 'warning'
      default:
        return 'default'
    }
  }

  const canCancel = (status: Appointment['status']) => {
    return ['confirmed', 'pending_payment'].includes(status)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  if (appointments.length === 0) {
    return (
      <Alert severity="info">
        No appointments found. Book a consultation with a specialist.
      </Alert>
    )
  }

  return (
    <Box>
      {appointments.map(appointment => {
        const start = formatDateTime(appointment.scheduledStart)
        const end = formatDateTime(appointment.scheduledEnd)

        return (
          <Card key={appointment.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {appointment.doctorName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {appointment.doctorSpecialty}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EventIcon fontSize="small" />
                      <Typography variant="body2">
                        {start.date} {start.time} - {end.time}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.pricePerSecond * 60} {appointment.currency}/min
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <Chip
                    label={appointment.status.replace('_', ' ')}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                  {canCancel(appointment.status) && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={() => onCancel(appointment.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {appointment.status === 'in_progress' && appointment.meetingUrl && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<VideoCallIcon />}
                      onClick={() => window.open(appointment.meetingUrl, '_blank')}
                    >
                      Join Call
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )
}