import { Box, Card, CardContent, Typography, Button, Alert, CircularProgress } from '@mui/material'
import Event from '@mui/icons-material/Event'
import AccessTime from '@mui/icons-material/AccessTime'
import VideoCall from '@mui/icons-material/VideoCall'
import type { Appointment } from '@shared/types/appointment.ts'

interface WaitingRoomProps {
  appointment: Appointment
  onJoin: () => void
  loading: boolean
  error: string | null
}

export function WaitingRoom({ appointment, onJoin, loading, error }: WaitingRoomProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  }

  const start = formatDateTime(appointment.scheduledStart)
  const end = formatDateTime(appointment.scheduledEnd)

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Waiting Room
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Your appointment is scheduled. Please wait for the doctor to join or click "Join Now" to enter the consultation.
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Appointment Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Event fontSize="small" />
              <Typography>
                {start.date} from {start.time} to {end.time}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime fontSize="small" />
              <Typography>
                Rate: {appointment.pricePerSecond * 60} {appointment.currency}/min
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
                startIcon={<VideoCall />}
            onClick={onJoin}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Join Consultation'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}