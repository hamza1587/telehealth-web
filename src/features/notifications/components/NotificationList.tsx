import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material'
import { NotificationsIcon, MarkEmailReadIcon } from '@mui/icons-material'
import type { Notification } from '@shared/types/notification.ts'

interface NotificationListProps {
  notifications: Notification[]
  loading: boolean
  error: string | null
  onMarkAsRead: (id: string) => void
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'appointment_confirmation':
    case 'appointment_reminder':
      return '📅'
    case 'consultation_completed':
      return '✅'
    case 'payment_success':
      return '💳'
    case 'payment_failure':
      return '❌'
    case 'low_credit':
      return '⚠️'
    case 'prescription_available':
      return '💊'
    case 'security_alert':
      return '🔐'
    default:
      return '🔔'
  }
}

export function NotificationList({
  notifications,
  loading,
  error,
  onMarkAsRead,
}: NotificationListProps) {
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

  if (notifications.length === 0) {
    return (
      <Alert severity="info">
        No notifications yet. You'll receive updates about your appointments and consultations here.
      </Alert>
    )
  }

  return (
    <Box>
      {notifications.map(notification => (
        <Card key={notification.id} variant="outlined" sx={{ mb: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                <Typography variant="h6" sx={{ mr: 1 }}>
                  {getNotificationIcon(notification.type)}
                </Typography>
                <Box>
                  <Typography variant="subtitle1">{notification.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={notification.status}
                  color={notification.status === 'delivered' ? 'success' : 'warning'}
                  size="small"
                />
                {notification.status !== 'delivered' && (
                  <IconButton
                    size="small"
                    onClick={() => onMarkAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <MarkEmailReadIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}