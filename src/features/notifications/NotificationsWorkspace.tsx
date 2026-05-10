import {
  Box, Card, CardContent, Typography, Stack, Switch,
  FormControlLabel, Divider, TextField, Button, Alert,
  CircularProgress, Grid,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  SmsFailed as SmsIcon,
  NotificationsActive as PushIcon,
  Public as PublicIcon,
} from '@mui/icons-material'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import { useNotifications } from './hooks/useNotifications.ts'
import { NotificationList } from './components/NotificationList.tsx'
import { NotificationCenter } from './components/NotificationSettings.tsx'

export function NotificationsWorkspace() {
  const { user } = useAuth()
  const {
    notifications,
    preferences,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    fetchNotifications,
  } = useNotifications()

  return (
    <Box>
      {/* Summary Bar */}
      <Card variant="outlined" sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6">Notifications</Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount} unread • {notifications.length} total
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" onClick={markAllAsRead} disabled={unreadCount === 0}>
                Mark all read
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <NotificationList
            notifications={notifications}
            loading={loading}
            error={error || undefined}
            onMarkRead={markAsRead}
            onMarkAllRead={markAllAsRead}
            onDelete={() => {}}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <NotificationCenter
            preferences={preferences}
            loading={false}
            error={undefined}
            onSavePreferences={async (prefs) => {
              const ok = await updatePreferences(prefs)
              if (ok) fetchNotifications()
              return ok
            }}
            onExportData={() => {}}
            onDeleteAccount={() => {}}
          />
        </Grid>
      </Grid>
    </Box>
  )
}