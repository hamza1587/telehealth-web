import {
  Box, Typography, List, ListItem, ListItemText,
  ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton,
  Badge, CircularProgress, Alert, Tooltip, Stack,
  Divider,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  SmsFailed as SmsIcon,
  NotificationsActive as PushIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Public as PublicIcon,
} from '@mui/icons-material'
import type { Notification, NotificationChannel } from '@shared/types/notification.ts'
import type { JSX } from 'react'

interface NotificationListProps {
  notifications: Notification[]
  loading: boolean
  error: string | null
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onDelete: (id: string) => void
}

const channelIcons: Record<NotificationChannel, JSX.Element> = {
  email: <EmailIcon fontSize="small" />,
  sms: <SmsIcon fontSize="small" />,
  push: <PushIcon fontSize="small" />,
  in_app: <NotificationsIcon fontSize="small" />,
}

const typeIcons: Record<string, JSX.Element> = {
  appointment_reminder: <PublicIcon fontSize="small" color="info" />,
  appointment_confirmation: <CheckIcon fontSize="small" color="success" />,
  doctor_late: <WarningIcon fontSize="small" color="warning" />,
  patient_waiting: <InfoIcon fontSize="small" color="info" />,
  consultation_completed: <CheckIcon fontSize="small" color="success" />,
  low_credit: <WarningIcon fontSize="small" color="warning" />,
  payment_success: <CheckIcon fontSize="small" color="success" />,
  payment_failure: <ErrorIcon fontSize="small" color="error" />,
  refund_update: <InfoIcon fontSize="small" color="info" />,
  prescription_available: <PublicIcon fontSize="small" color="success" />,
  data_rights_update: <PublicIcon fontSize="small" color="info" />,
  consent_update: <PublicIcon fontSize="small" color="info" />,
  security_alert: <ErrorIcon fontSize="small" color="error" />,
}

const typeColors: Record<string, string> = {
  appointment_reminder: 'info',
  appointment_confirmation: 'success',
  doctor_late: 'warning',
  patient_waiting: 'info',
  consultation_completed: 'success',
  low_credit: 'warning',
  payment_success: 'success',
  payment_failure: 'error',
  refund_update: 'info',
  prescription_available: 'success',
  data_rights_update: 'info',
  consent_update: 'info',
  security_alert: 'error',
}

export function NotificationList({
  notifications,
  loading,
  error,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}: NotificationListProps) {
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

  if (notifications.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No notifications
        </Typography>
        <Typography variant="body2" color="text.disabled">
          You're all caught up!
        </Typography>
      </Box>
    )
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <ListItem>
        <ListItemText
          primary="Notifications"
          secondary={`${notifications.filter(n => n.status !== 'read').length} unread`}
        />
        <ListItemSecondaryAction>
          <Tooltip title="Mark all as read">
            <IconButton edge="end" onClick={onMarkAllRead}>
              <MarkReadIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
      <Divider />
      {notifications.map((notification) => (
        <Box key={notification.id}>
          <ListItem
            secondaryAction={
              <Stack direction="row" spacing={0.5}>
                {notification.channels.map((ch) => (
                  <Tooltip title={ch} key={ch}>
                    {channelIcons[ch]}
                  </Tooltip>
                ))}
                <Tooltip title="Mark as read">
                  <IconButton
                    edge="end"
                    onClick={() => onMarkRead(notification.id)}
                    disabled={notification.status === 'read'}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton edge="end" onClick={() => onDelete(notification.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            }
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: notification.status === 'read' ? 'action.disabledBackground' :
                    (typeColors[notification.type] || 'primary') + '.light',
                }}
              >
                {typeIcons[notification.type] || <InfoIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body1" fontWeight={notification.status === 'unread' ? 700 : 400}>
                    {notification.title}
                  </Typography>
                  {notification.status === 'unread' && (
                    <Badge color="primary" variant="dot" />
                  )}
                </Stack>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          <Divider />
        </Box>
      ))}
    </List>
  )
}