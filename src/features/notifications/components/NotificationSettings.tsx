import {
  Box, Card, CardContent, Typography, Grid, Stack,
  FormControlLabel, Switch, Button, Alert, Divider, Paper,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  SmsFailed as SmsIcon,
  NotificationsActive as PushIcon,
  Save as SaveIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useState } from 'react'
import type { NotificationPreferencesForm } from '@shared/types/index.ts'

interface NotificationCenterProps {
  preferences: NotificationPreferencesForm | null
  loading: boolean
  error: string | null
  onSavePreferences: (prefs: NotificationPreferencesForm) => Promise<boolean>
  onExportData: () => void
  onDeleteAccount: () => void
}

const NOTIFICATION_TYPES = [
  { key: 'appointment_confirmation', label: 'Appointment Confirmations', icon: <PublicIcon fontSize="small" /> },
  { key: 'appointment_reminder', label: 'Appointment Reminders', icon: <PublicIcon fontSize="small" /> },
  { key: 'doctor_late', label: 'Doctor Running Late', icon: <PublicIcon fontSize="small" /> },
  { key: 'patient_waiting', label: 'Patient Waiting', icon: <PublicIcon fontSize="small" /> },
  { key: 'consultation_completed', label: 'Consultation Completed', icon: <PublicIcon fontSize="small" /> },
  { key: 'low_credit', label: 'Low Credit Balance', icon: <LockIcon fontSize="small" /> },
  { key: 'payment_success', label: 'Payment Success', icon: <PublicIcon fontSize="small" /> },
  { key: 'payment_failure', label: 'Payment Failure', icon: <PublicIcon fontSize="small" /> },
  { key: 'prescription_available', label: 'Prescription Available', icon: <PublicIcon fontSize="small" /> },
  { key: 'data_rights_update', label: 'Data Rights Updates', icon: <PublicIcon fontSize="small" /> },
  { key: 'consent_update', label: 'Consent Updates', icon: <PublicIcon fontSize="small" /> },
  { key: 'security_alert', label: 'Security Alerts', icon: <LockIcon fontSize="small" /> },
]

export function NotificationCenter({
  preferences,
  loading,
  error,
  onSavePreferences,
  onExportData,
  onDeleteAccount,
}: NotificationCenterProps) {
  const [form, setForm] = useState<NotificationPreferencesForm>({
    email: true,
    sms: false,
    push: true,
    inApp: true,
    types: {},
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useState(() => {
    if (preferences) {
      setForm(preferences)
    }
  })

  const handleChannelToggle = (channel: keyof NotificationPreferencesForm) => {
    setForm(prev => ({ ...prev, [channel]: !prev[channel] }))
  }

  const handleTypeToggle = (type: string) => {
    setForm(prev => ({
      ...prev,
      types: { ...prev.types, [type]: !prev.types[type] },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    const result = await onSavePreferences(form)
    if (result) setSuccess(true)
    setSaving(false)
  }

  return (
    <Box>
      <Card variant="outlined" sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <NotificationsIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h6">Notification Preferences</Typography>
              <Typography variant="body2" color="text.secondary">
                Control how and when you receive notifications
              </Typography>
            </Box>
          </Stack>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
              Preferences updated successfully!
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Delivery Channels
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderColor: form.email ? 'primary.main' : 'divider',
                  bgcolor: form.email ? 'primary.light' : 'background.paper',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: 2 },
                }}
                onClick={() => handleChannelToggle('email')}
              >
                <EmailIcon
                  sx={{
                    fontSize: 32,
                    color: form.email ? 'primary.dark' : 'action.disabled',
                    mb: 1,
                  }}
                />
                <Typography variant="body2" fontWeight={600}>Email</Typography>
                <FormControlLabel
                  control={<Switch checked={form.email} size="small" color="primary" />}
                  label=""
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderColor: form.sms ? 'primary.main' : 'divider',
                  bgcolor: form.sms ? 'primary.light' : 'background.paper',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: 2 },
                }}
                onClick={() => handleChannelToggle('sms')}
              >
                <SmsIcon
                  sx={{
                    fontSize: 32,
                    color: form.sms ? 'primary.dark' : 'action.disabled',
                    mb: 1,
                  }}
                />
                <Typography variant="body2" fontWeight={600}>SMS</Typography>
                <FormControlLabel
                  control={<Switch checked={form.sms} size="small" color="primary" />}
                  label=""
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderColor: form.push ? 'primary.main' : 'divider',
                  bgcolor: form.push ? 'primary.light' : 'background.paper',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: 2 },
                }}
                onClick={() => handleChannelToggle('push')}
              >
                <PushIcon
                  sx={{
                    fontSize: 32,
                    color: form.push ? 'primary.dark' : 'action.disabled',
                    mb: 1,
                  }}
                />
                <Typography variant="body2" fontWeight={600}>Push</Typography>
                <FormControlLabel
                  control={<Switch checked={form.push} size="small" color="primary" />}
                  label=""
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderColor: form.inApp ? 'primary.main' : 'divider',
                  bgcolor: form.inApp ? 'primary.light' : 'background.paper',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: 2 },
                }}
                onClick={() => handleChannelToggle('inApp')}
              >
                <NotificationsIcon
                  sx={{
                    fontSize: 32,
                    color: form.inApp ? 'primary.dark' : 'action.disabled',
                    mb: 1,
                  }}
                />
                <Typography variant="body2" fontWeight={600}>In-App</Typography>
                <FormControlLabel
                  control={<Switch checked={form.inApp} size="small" color="primary" />}
                  label=""
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Notification Types
          </Typography>

          <Stack spacing={1}>
            {NOTIFICATION_TYPES.map(({ key, label, icon }) => (
              <Paper
                key={key}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  borderColor: form.types[key] ? 'primary.main' : 'divider',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  {icon}
                  <Typography variant="body2">{label}</Typography>
                </Stack>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!form.types[key]}
                      onChange={() => handleTypeToggle(key)}
                      size="small"
                      color="primary"
                    />
                  }
                  label=""
                />
              </Paper>
            ))}
          </Stack>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ borderRadius: 3 }}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* GDPR Section */}
      <Card variant="outlined" sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <LockIcon color="warning" fontSize="large" />
            <Box>
              <Typography variant="h6">Data & Privacy</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your data rights and privacy settings
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm="auto">
              <Button
                variant="outlined"
                startIcon={<PublicIcon />}
                onClick={onExportData}
                sx={{ borderRadius: 3 }}
              >
                Export My Data
              </Button>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={onDeleteAccount}
                sx={{ borderRadius: 3 }}
              >
                Delete Account
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}