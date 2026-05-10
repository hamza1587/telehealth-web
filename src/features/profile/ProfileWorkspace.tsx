import {
  Box, Card, CardContent, Typography, Paper, Grid, Stack,
  CircularProgress, Alert, Tabs, Tab,
} from '@mui/material'
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Public as PublicIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import { useProfileSettings } from './hooks/useProfileSettings.ts'
import { SettingsPage } from './components/SettingsPage.tsx'

export function ProfileWorkspace() {
  const { user, logout } = useAuth()
  const {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
    setupMfa,
    confirmMfa,
    disableMfa,
    manageDevice,
  } = useProfileSettings()

  return (
    <Box>
      <Card variant="outlined" sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 24 }}>
              {user?.displayName?.[0] || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6">Hello, {user?.displayName || 'User'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email} • {user?.userType}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <SettingsPage
        loading={loading}
        error={error || undefined}
        profile={profile}
        onUpdateProfile={updateProfile}
        onChangePassword={changePassword}
        onSetupMfa={setupMfa}
        onConfirmMfa={confirmMfa}
        onDisableMfa={disableMfa}
      />
    </Box>
  )
}