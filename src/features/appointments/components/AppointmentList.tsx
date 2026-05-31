import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  CircularProgress, Alert, Stack, Pagination, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Avatar
} from '@mui/material'
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Videocam as VideoIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import type { ChipOwnProps } from '@mui/material'
import type { Appointment, AppointmentStatus } from '@shared/types/appointment.ts'

interface AppointmentListProps {
  appointments: Appointment[]
  loading: boolean
  error: string | null
  onCancel: (id: string) => void
  onView: (id: string) => void
  onReschedule: (id: string) => void
}

const statusConfig: Record<AppointmentStatus, { color: ChipOwnProps['color']; label: string }> = {
  draft: { color: 'default', label: 'Draft' },
  pending_payment: { color: 'warning', label: 'Pending Payment' },
  confirmed: { color: 'primary', label: 'Confirmed' },
  patient_waiting: { color: 'info', label: 'Waiting' },
  doctor_waiting: { color: 'secondary', label: 'Doctor Waiting' },
  in_progress: { color: 'success', label: 'In Progress' },
  completed: { color: 'default', label: 'Completed' },
  cancelled_patient: { color: 'error', label: 'Cancelled' },
  cancelled_doctor: { color: 'error', label: 'Cancelled by Doctor' },
  no_show_patient: { color: 'error', label: 'No Show' },
  no_show_doctor: { color: 'error', label: 'Doctor No Show' },
  failed_technical: { color: 'error', label: 'Technical Issue' },
  refunded: { color: 'warning', label: 'Refunded' },
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
}

export function AppointmentList({
  appointments,
  loading,
  error,
  onCancel,
  onView,
  onReschedule,
}: AppointmentListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
  }

  if (appointments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CalendarIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No appointments found
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Book a consultation with a specialist to get started.
        </Typography>
      </Box>
    )
  }

  const filtered = appointments.filter((apt) => {
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    const matchesSearch = !searchQuery ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorSpecialty.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const totalPages = Math.ceil(filtered.length / rowsPerPage)

  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6">Your Appointments ({filtered.length})</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                placeholder="Search by doctor or specialty"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                }}
                sx={{ width: 280 }}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="pending_payment">Pending Payment</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled_patient">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Specialty</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((apt) => {
                  const { date, time } = formatDateTime(apt.scheduledStart)
                  const config = statusConfig[apt.status]
                  return (
                    <TableRow key={apt.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                            {apt.doctorName[0]}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>{apt.doctorName}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{apt.doctorSpecialty}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="column" spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2">{date}</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <TimeIcon fontSize="small" color="action" />
                            <Typography variant="body2">{time}</Typography>
                          </Stack>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={config.label}
                          color={config.color}
                          size="small"
                          variant={apt.status === 'in_progress' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{(apt.pricePerSecond * 60).toFixed(2)} {apt.currency}/min</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View details">
                            <IconButton size="small" onClick={() => onView(apt.id)}>
                              <PersonIcon />
                            </IconButton>
                          </Tooltip>
                          {apt.status === 'confirmed' && (
                            <Tooltip title="Reschedule">
                              <IconButton size="small" onClick={() => onReschedule(apt.id)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {(apt.status === 'confirmed' || apt.status === 'pending_payment') && (
                            <Tooltip title="Cancel">
                              <IconButton size="small" color="error" onClick={() => onCancel(apt.id)}>
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {apt.status === 'in_progress' && apt.meetingUrl && (
                            <Tooltip title="Join consultation">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => window.open(apt.meetingUrl, '_blank')}
                              >
                                <VideoIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_e: React.ChangeEvent<unknown>, p: number) => setPage(p)}
                variant="outlined"
                shape="rounded"
                siblingCount={1}
                boundaryCount={1}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}