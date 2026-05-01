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
import { DownloadIcon } from '@mui/icons-material'
import type { DataRightRequest } from '@shared/types/dataRights.ts'

interface DataRightsListProps {
  requests: DataRightRequest[]
  loading: boolean
  error: string | null
  onDownloadData: () => void
}

const getStatusColor = (status: DataRightRequest['status']) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'approved':
      return 'success'
    case 'in_review':
      return 'info'
    case 'waiting_user':
      return 'warning'
    case 'rejected':
      return 'error'
    default:
      return 'default'
  }
}

const getTypeLabel = (type: DataRightRequest['type']) => {
  return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function DataRightsList({
  requests,
  loading,
  error,
  onDownloadData,
}: DataRightsListProps) {
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
        <Typography variant="h6">Data Rights Requests</Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onDownloadData}>
          Download My Data
        </Button>
      </Box>

      {requests.length === 0 ? (
        <Alert severity="info">
          No data rights requests yet. Use the form above to exercise your GDPR rights.
        </Alert>
      ) : (
        requests.map(request => (
          <Card key={request.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6">{getTypeLabel(request.type)}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {request.description || 'No description provided'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Submitted: {new Date(request.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Chip
                  label={request.status.replace('_', ' ')}
                  color={getStatusColor(request.status)}
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  )
}