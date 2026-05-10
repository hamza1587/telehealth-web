import {
  Box, Card, CardContent, Typography, Paper, Stack,
  CircularProgress, Alert, Timeline, TimelineItem,
  TimelineSeparator, TimelineConnector, TimelineContent,
  TimelineDot, List, ListItem, ListItemText, ListItemIcon,
  Divider,
} from '@mui/material'
import {
  Public as PublicIcon,
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import type { DataRightRequest } from '@shared/types/dataRights.ts'

const typeLabels: Record<string, string> = {
  access: 'Right of Access',
  rectification: 'Right of Rectification',
  erasure: 'Right to Erasure',
  restriction: 'Right to Restriction',
  portability: 'Right to Data Portability',
  objection: 'Right to Objection',
}

const typeIcons: Record<string, JSX.Element> = {
  access: <PublicIcon fontSize="small" color="info" />,
  rectification: <CheckIcon fontSize="small" color="success" />,
  erasure: <CancelIcon fontSize="small" color="error" />,
  restriction: <PendingIcon fontSize="small" color="warning" />,
  portability: <InfoIcon fontSize="small" color="info" />,
  objection: <ErrorIcon fontSize="small" color="error" />,
}

const statusColors: Record<string, { bg: string; color: string }> = {
  submitted: { bg: '#e3f2fd', color: '#1565c0' },
  identity_verification_required: { bg: '#fff8e1', color: '#f57f17' },
  in_review: { bg: '#f3e5f5', color: '#7b1fa2' },
  waiting_user: { bg: '#fff3e0', color: '#e65100' },
  approved: { bg: '#e8f5e9', color: '#2e7d32' },
  partially_approved: { bg: '#e8f5e9', color: '#558b2f' },
  rejected: { bg: '#ffebee', color: '#c62828' },
  completed: { bg: '#e8f5e9', color: '#1b5e20' },
}

interface GDPRRequestListProps {
  requests: DataRightRequest[]
  loading: boolean
  error: string | null
}

export function GDPRRequestList({
  requests,
  loading,
  error,
}: GDPRRequestListProps) {
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

  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <InfoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No data rights requests found
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Submit a new GDPR/ EHDS request to manage your data rights.
        </Typography>
      </Box>
    )
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4 }}>
      <List>
        {requests.map((request, index) => {
          const statusConfig = statusColors[request.status] || statusColors.submitted
          return (
            <Box key={request.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  py: 2,
                  bgcolor: statusConfig.bg,
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                }}
              >
                <ListItemIcon>
                  <Avatar
                    sx={{
                      bgcolor: statusConfig.bg,
                      color: statusConfig.color,
                      border: `2px solid ${statusConfig.color}`,
                    }}
                  >
                    {typeIcons[request.type] || <InfoIcon />}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body1" fontWeight={600}>
                        {typeLabels[request.type] || request.type}
                      </Typography>
                      <Chip
                        label={request.status.replace(/_/g, ' ')}
                        size="small"
                        sx={{
                          bgcolor: statusConfig.bg,
                          color: statusConfig.color,
                          border: `1px solid ${statusConfig.color}`,
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {request.description.length > 100
                          ? request.description.substring(0, 100) + '...'
                          : request.description}
                      </Typography>
                      <Timeline sx={{ p: 0, m: 0, minHeight: 20 }}>
                        <TimelineItem>
                          <TimelineSeparator>
                            <TimelineDot
                              color={request.identityVerified ? 'success' : 'warning'}
                              variant="outlined"
                              size="sm"
                            />
                            <TimelineConnector />
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="caption">
                              Created: {new Date(request.createdAt).toLocaleDateString()}
                            </Typography>
                          </TimelineContent>
                        </TimelineItem>
                        {request.completedAt && (
                          <TimelineItem>
                            <TimelineSeparator>
                              <TimelineDot color="success" variant="filled" size="sm" />
                            </TimelineSeparator>
                            <TimelineContent>
                              <Typography variant="caption">
                                Completed: {new Date(request.completedAt).toLocaleDateString()}
                              </Typography>
                            </TimelineContent>
                          </TimelineItem>
                        )}
                      </Timeline>
                    </Stack>
                  }
                />
              </ListItem>
            </Box>
          )
        })}
      </List>
    </Paper>
  )
}