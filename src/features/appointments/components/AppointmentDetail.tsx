import { useEffect, useState, type JSX } from 'react'
import {
  Box, Card, CardContent, Typography, Paper, Stack, Grid, Chip,
  Divider, IconButton, Button, Alert, CircularProgress, Avatar,
  Badge
} from '@mui/material'
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab'
import {
  CalendarToday, AccessTime, Videocam, MedicalServices,
  CheckCircle, Pending, Error as ErrorIcon,
  NavigateBefore, CancelOutlined, Cancel, Refresh,
} from '@mui/icons-material'
import type { AppointmentDetail } from '@shared/types/index.ts'
import { EditIcon } from 'lucide-react'

interface AppointmentDetailProps {
  appointment: AppointmentDetail | null
  loading: boolean
  error: string | null
  onJoin: () => void
  onCancel: () => void
  onReschedule: () => void
  onBack: () => void
}

const statusColors: Record<string, { bg: string; icon: JSX.Element; label: string }> = {
  draft: { bg: '#f5f5f5', icon: <Pending fontSize="small" />, label: 'Draft' },
  pending_payment: { bg: '#fff3e0', icon: <Pending fontSize="small" />, label: 'Pending Payment' },
  confirmed: { bg: '#e3f2fd', icon: <CheckCircle fontSize="small" />, label: 'Confirmed' },
  patient_waiting: { bg: '#e8f5e9', icon: <AccessTime fontSize="small" />, label: 'Patient Waiting' },
  doctor_waiting: { bg: '#fce4ec', icon: <AccessTime fontSize="small" />, label: 'Doctor Waiting' },
  in_progress: { bg: '#e8f5e9', icon: <Videocam fontSize="small" />, label: 'In Progress' },
  completed: { bg: '#f1f8e9', icon: <CheckCircle fontSize="small" />, label: 'Completed' },
  cancelled_patient: { bg: '#ffebee', icon: <Cancel fontSize="small" />, label: 'Cancelled by You' },
  cancelled_doctor: { bg: '#ffebee', icon: <Cancel fontSize="small" />, label: 'Cancelled by Doctor' },
  no_show_patient: { bg: '#ffebee', icon: <ErrorIcon fontSize="small" />, label: 'No Show' },
  no_show_doctor: { bg: '#fff8e1', icon: <ErrorIcon fontSize="small" />, label: 'Doctor No Show' },
  failed_technical: { bg: '#ffebee', icon: <ErrorIcon fontSize="small" />, label: 'Technical Issue' },
  refunded: { bg: '#fff8e1', icon: <Refresh fontSize="small" />, label: 'Refunded' },
}

export function AppointmentDetailView({
  appointment,
  loading,
  error,
  onJoin,
  onCancel,
  onReschedule,
  onBack,
}: AppointmentDetailProps) {
  const [countdown, setCountdown] = useState<string>('')

  useEffect(() => {
    if (!appointment || appointment.status !== 'confirmed') return

    const timer = setInterval(() => {
      const start = new Date(appointment.scheduledStart)
      const diff = start.getTime() - Date.now()
      if (diff <= 0) {
        setCountdown('Starting now!')
        clearInterval(timer)
        return
      }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setCountdown(`Starts in ${mins}m ${secs}s`)
    }, 1000)

    return () => clearInterval(timer)
  }, [appointment])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!appointment) {
    return <Alert severity="info">Select an appointment to view details.</Alert>
  }

  const startDate = new Date(appointment.scheduledStart)
  const endDate = new Date(appointment.scheduledEnd)
  const config = statusColors[appointment.status] || statusColors.draft
  // Calculate duration in seconds
  const durationSeconds = (endDate.getTime() - startDate.getTime()) / 1000
  // Calculate estimated cost based on duration and price per second
  const estimatedCost = (durationSeconds * appointment.pricePerSecond / 100).toFixed(2)

  return (
    <Box>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, background: 'linear-gradient(135deg, #1565c0 0%, #00897b 100%)', color: 'white' }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={onBack} sx={{ color: 'white' }}>
              <NavigateBefore />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Appointment Details
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                ID: {appointment.id.slice(0, 8)}...
              </Typography>
            </Box>
          </Stack>
          <Badge
            overlap="circular"
            badgeContent={
              <Box sx={{
                width: 12, height: 12, borderRadius: '50%',
                bgcolor: appointment.status === 'in_progress' ? '#4caf50' :
                  appointment.status === 'confirmed' ? '#2196f3' : '#757575',
                boxShadow: 2,
              }} />
            }
          >
            <Chip
              label={config.label}
              sx={{
                bgcolor: config.bg,
                color: '#1565c0',
                fontWeight: 700,
                border: 'none',
              }}
              size="small"
            />
          </Badge>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Doctor Info */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80, height: 80,
                  bgcolor: 'primary.main',
                  mx: 'auto', mb: 2,
                  fontSize: 32,
                }}
              >
                {appointment.doctorName[0]}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {appointment.doctorName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <MedicalServices sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                {appointment.doctorSpecialty}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Schedule Info */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                SCHEDULE
              </Typography>
              <Timeline>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <CalendarToday fontSize="small" />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body1">{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Typography>
                  </TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <AccessTime fontSize="small" />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body1">
                      {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
                {appointment.meetingUrl && appointment.status === 'in_progress' && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="success">
                        <Videocam fontSize="small" />
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent>
                      <Button variant="contained" color="success" startIcon={<Videocam />} onClick={onJoin} fullWidth>
                        Join Now
                      </Button>
                    </TimelineContent>
                  </TimelineItem>
                )}
                {appointment.status === 'confirmed' && countdown && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="warning">
                        <AccessTime fontSize="small" />
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
                        {countdown}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>

              {appointment.status === 'cancelled_patient' && appointment.cancellationReason && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">
                    Cancellation reason: {appointment.cancellationReason}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Billing Info */}
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                BILLING
              </Typography>
              <Stack spacing={1.5} mt={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Rate</Typography>
                  <Typography variant="body2">{(appointment.pricePerSecond * 60).toFixed(2)} {appointment.currency}/min</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Credits Reserved</Typography>
                  <Typography variant="body2">{appointment.creditsReserved.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Credits Used</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {appointment.creditsUsed ? appointment.creditsUsed.toFixed(2) : '—'}
                  </Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" fontWeight={600}>Estimated Cost</Typography>
                  <Typography variant="body1" fontWeight={600} color="primary">
                    {estimatedCost} {appointment.currency}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                NOTES {!appointment.notes && '(optional)'}
              </Typography>
              {appointment.notes ? (
                <Typography variant="body2">{appointment.notes}</Typography>
              ) : (
                <Typography variant="body2" color="text.disabled">
                  No notes added for this appointment.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {(appointment.status === 'confirmed' || appointment.status === 'pending_payment') && (
              <Button variant="outlined" color="error" startIcon={<CancelOutlined />} onClick={onCancel}>
                Cancel
              </Button>
            )}
            {(appointment.status === 'confirmed' || appointment.status === 'pending_payment') && (
              <Button variant="outlined" startIcon={<EditIcon />} onClick={onReschedule}>
                Reschedule
              </Button>
            )}
            {appointment.status === 'in_progress' && (
              <Button
                variant="contained"
                color="success"
                startIcon={<Videocam />}
                onClick={onJoin}
                sx={{ minWidth: 160 }}
              >
                Join Consultation
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}