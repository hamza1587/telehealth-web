import {
  Box, Typography, IconButton, Tooltip,
  CircularProgress, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Stack, Chip, Avatar,
} from '@mui/material'
import {
  Videocam, VideocamOff, CheckCircle, Pending, Error,
  Visibility, Refresh,
} from '@mui/icons-material'
import type { ConsultationSession, ConsultationStatus } from '@shared/types/consultation.ts'
import type { JSX } from 'react'

interface ConsultationSessionListProps {
  sessions: ConsultationSession[]
  loading: boolean
  error: string | null
  onView: (session: ConsultationSession) => void
  onJoin: (session: ConsultationSession) => void
}

const statusConfig: Record<ConsultationStatus, { color: string; label: string; icon: JSX.Element }> = {
  waiting_room: { color: 'info', label: 'Waiting Room', icon: <Pending fontSize="small" /> },
  connecting: { color: 'warning', label: 'Connecting', icon: <Refresh fontSize="small" /> },
  in_progress: { color: 'success', label: 'In Progress', icon: <Videocam fontSize="small" /> },
  paused: { color: 'warning', label: 'Paused', icon: <VideocamOff fontSize="small" /> },
  ended: { color: 'default', label: 'Ended', icon: <CheckCircle fontSize="small" /> },
  failed: { color: 'error', label: 'Failed', icon: <Error fontSize="small" /> },
}

export function ConsultationSessionList({
  sessions,
  loading,
  error,
  onView,
  onJoin,
}: ConsultationSessionListProps) {
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

  if (sessions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No consultation sessions found
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Your past and upcoming sessions will appear here.
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Doctor</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Cost</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((session) => {
            const config = statusConfig[session.status] || statusConfig.ended
            const cost = (session.billableSeconds * session.pricePerSecond / 100).toFixed(2)
            const date = new Date(session.startTime || '').toLocaleString()

            return (
              <TableRow key={session.id} hover>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                      {session.doctorId[0]}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>
                      Dr. {session.doctorId.slice(0, 8)}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {session.type === 'video' ? '🎥 Video' : '📞 Audio'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{date}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {Math.floor(session.billableSeconds / 60)}m {session.billableSeconds % 60}s
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={config.label}
                    color={config.color as any}
                    size="small"
                    icon={config.icon}
                    variant={session.status === 'in_progress' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {cost} {session.currency}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    {session.status === 'in_progress' && (
                      <Tooltip title="Join session">
                        <IconButton size="small" color="success" onClick={() => onJoin(session)}>
                          <Videocam />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="View details">
                      <IconButton size="small" onClick={() => onView(session)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}