import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import type { SupportTicket } from '@shared/types/support.ts'

interface TicketListProps {
  tickets: SupportTicket[]
  loading: boolean
  error: string | null
  onCreateTicket: () => void
}

const getCategoryLabel = (category: SupportTicket['category']) => {
  return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getPriorityColor = (priority: SupportTicket['priority']) => {
  switch (priority) {
    case 'urgent':
      return 'error'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    default:
      return 'default'
  }
}

const getStatusColor = (status: SupportTicket['status']) => {
  switch (status) {
    case 'resolved':
      return 'success'
    case 'in_review':
      return 'info'
    case 'waiting_user':
      return 'warning'
    case 'escalated':
      return 'error'
    default:
      return 'default'
  }
}

export function TicketList({ tickets, loading, error, onCreateTicket }: TicketListProps) {
  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Support Tickets</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateTicket}>
          New Ticket
        </Button>
      </Box>

      {tickets.length === 0 ? (
        <Alert severity="info">
          No support tickets yet. Click "New Ticket" to get help with any issues.
        </Alert>
      ) : (
        tickets.map(ticket => (
          <Card key={ticket.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6">{ticket.subject}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {getCategoryLabel(ticket.category)}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {ticket.description.substring(0, 100)}...
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={ticket.priority}
                    color={getPriorityColor(ticket.priority)}
                    size="small"
                  />
                  <Chip
                    label={ticket.status.replace('_', ' ')}
                    color={getStatusColor(ticket.status)}
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(ticket.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  )
}