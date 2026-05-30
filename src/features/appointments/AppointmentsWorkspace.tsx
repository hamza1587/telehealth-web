import { useState, useCallback } from 'react'
import {
  Box, Card, CardContent, Typography, Grid,
  Chip, Button, Paper, Stack,
} from '@mui/material'
import {
  Today as TodayIcon,
} from '@mui/icons-material'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import { useAppointments } from './hooks/useAppointments.ts'
import { AppointmentList } from './components/AppointmentList.tsx'
import { AppointmentDetailView } from './components/AppointmentDetail.tsx'
export function AppointmentsWorkspace() {
  const { user } = useAuth()
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const {
    appointments,
    selectedAppointment,
    loading,
    error,
    fetchAppointmentDetail,
    cancelAppointment,
  } = useAppointments(user?.userId || null)

  const handleView = useCallback(async (id: string) => {
    setSelectedId(id)
    setView('detail')
    await fetchAppointmentDetail(id)
  }, [fetchAppointmentDetail])

  const handleBack = useCallback(() => {
    setView('list')
    setSelectedId(null)
  }, [])

  const handleCancel = useCallback(async (id: string, _reason: string) => {
    await cancelAppointment(id)
  }, [cancelAppointment])

  if (view === 'detail') {
    return (
      <AppointmentDetailView
        appointment={selectedAppointment}
        loading={loading}
        error={error || undefined}
        onJoin={() => { }}
        onCancel={() => {
          if (selectedId) handleCancel(selectedId, 'Patient requested')
        }}
        onReschedule={() => { }}
        onBack={handleBack}
      />
    )
  }

  return (
    <Box>
      {/* Header */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6">My Appointments</Typography>
            <Typography variant="body2" color="text.secondary">
              View, cancel, or reschedule your consultations
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              label="All"
              color={filterStatus === 'all' ? 'primary' : 'default'}
              variant={filterStatus === 'all' ? 'filled' : 'outlined'}
              onClick={() => setFilterStatus('all')}
              clickable
              size="small"
            />
            <Chip
              label="Confirmed"
              color={filterStatus === 'confirmed' ? 'primary' : 'default'}
              variant={filterStatus === 'confirmed' ? 'filled' : 'outlined'}
              onClick={() => setFilterStatus('confirmed')}
              clickable
              size="small"
            />
            <Chip
              label="Upcoming"
              color={filterStatus === 'upcoming' ? 'primary' : 'default'}
              variant={filterStatus === 'upcoming' ? 'filled' : 'outlined'}
              onClick={() => setFilterStatus('upcoming')}
              clickable
              size="small"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Stats Row */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {appointments.filter(a => a.status === 'confirmed').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Confirmed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>
                {appointments.filter(a => a.status === 'completed').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main' }}>
                {appointments.filter(a => ['cancelled_patient', 'cancelled_doctor'].includes(a.status)).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Cancelled</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main' }}>
                {appointments.filter(a => a.status === 'no_show_patient').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">No Shows</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Stack direction="row" spacing={2} mb={3}>
        <Button
          variant="contained"
          sx={{ borderRadius: 3, px: 3 }}
        >
          Book New
        </Button>
        <Button
          variant="outlined"
          startIcon={<TodayIcon />}
          sx={{ borderRadius: 3 }}
        >
          Today's Schedule
        </Button>
      </Stack>

      {/* Appointment List */}
      <AppointmentList
        appointments={appointments}
        loading={loading}
        error={error || undefined}
        onCancel={(id: any) => handleCancel(id)}
        onView={handleView}
        onReschedule={() => { }}
      />
    </Box>
  )
}
