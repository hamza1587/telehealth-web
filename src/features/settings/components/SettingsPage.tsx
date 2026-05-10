import {
  Box, Card, CardContent, Typography, TextField, Button,
  Stack, Alert, CircularProgress, Divider, Paper, FormControl,
  InputLabel, Select, MenuItem, Grid,
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { useState, useEffect } from 'react'
import type { ProfileForm, SecuritySettingsForm, MfaSettingsForm } from '@shared/types/index.ts'

interface SettingsProps {
  loading: boolean
  error: string | null
  profile: any
  onUpdateProfile: (form: ProfileForm) => Promise<{ success: boolean }>
  onChangePassword: (form: SecuritySettingsForm) => Promise<{ success: boolean }>
  onSetupMfa: () => Promise<any>
  onConfirmMfa: (form: MfaSettingsForm) => Promise<{ success: boolean }>
  onDisableMfa: (code: string) => Promise<{ success: boolean }>
}

export function SettingsPage({
  loading,
  error,
  profile,
  onUpdateProfile,
  onChangePassword,
  onSetupMfa,
  onConfirmMfa,
  onDisableMfa,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const [success, setSuccess] = useState('')
  const [mfaStep, setMfaStep] = useState<'setup' | 'confirm' | 'disable' | 'done'>('done')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaSecret, setMfaSecret] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')

  const [form, setForm] = useState<ProfileForm>({
    displayName: '',
    email: '',
    phoneNumber: '',
    countryCode: '',
    preferredLanguage: 'en',
    city: '',
    timeZone: '',
  })

  const [securityForm, setSecurityForm] = useState<SecuritySettingsForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        countryCode: profile.countryCode || '',
        preferredLanguage: profile.preferredLanguage || 'en',
        city: profile.city || '',
        timeZone: profile.timeZone || '',
      })
    }
  }, [profile])

  const handleProfileUpdate = async () => {
    setSuccess('')
    const result = await onUpdateProfile(form)
    if (result.success) {
      setSuccess('Profile updated successfully!')
    }
  }

  const handlePasswordChange = async () => {
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    setSuccess('')
    const result = await onChangePassword(securityForm)
    if (result.success) {
      setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess('Password changed successfully!')
    }
  }

  const handleMfaSetup = async () => {
    setMfaStep('setup')
    try {
      const res = await onSetupMfa()
      if (res) {
        setMfaSecret(res.secretKey)
        setMfaStep('confirm')
      }
    } catch {
      setMfaStep('done')
    }
  }

  const handleMfaConfirm = async () => {
    const result = await onConfirmMfa({ enabled: true, code: mfaCode })
    if (result.success) {
      setMfaStep('done')
      setMfaCode('')
      setSuccess('MFA enabled successfully!')
    }
  }

  const handleMfaDisable = async () => {
    const result = await onDisableMfa(currentPassword)
    if (result.success) {
      setMfaStep('done')
      setCurrentPassword('')
      setSuccess('MFA disabled successfully!')
    }
  }

  const tabs = [
    { key: 'profile', label: 'Profile', icon: <PersonIcon fontSize="small" /> },
    { key: 'security', label: 'Security', icon: <SecurityIcon fontSize="small" /> },
  ]

  return (
    <Box>
      <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <PersonIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h6">Settings</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your profile and security settings
              </Typography>
            </Box>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Tab Navigation */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
            {tabs.map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'contained' : 'text'}
                size="small"
                startIcon={tab.icon}
                onClick={() => setActiveTab(tab.key)}
                sx={{ borderRadius: 2 }}
              >
                {tab.label}
              </Button>
            ))}
          </Box>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Display Name"
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={form.countryCode}
                    onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))}
                    label="Country"
                  >
                    <MenuItem value="DE">Germany</MenuItem>
                    <MenuItem value="FR">France</MenuItem>
                    <MenuItem value="NL">Netherlands</MenuItem>
                    <MenuItem value="ES">Spain</MenuItem>
                    <MenuItem value="IT">Italy</MenuItem>
                    <MenuItem value="PT">Portugal</MenuItem>
                    <MenuItem value="PL">Poland</MenuItem>
                    <MenuItem value="US">United States</MenuItem>
                    <MenuItem value="GB">United Kingdom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Language</InputLabel>
                  <Select
                    value={form.preferredLanguage}
                    onChange={e => setForm(f => ({ ...f, preferredLanguage: e.target.value }))}
                    label="Preferred Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="de">Deutsch</MenuItem>
                    <MenuItem value="fr">Français</MenuItem>
                    <MenuItem value="nl">Nederlands</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="it">Italiano</MenuItem>
                    <MenuItem value="pt">Português</MenuItem>
                    <MenuItem value="pl">Polski</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  sx={{ borderRadius: 3, px: 4 }}
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </Grid>
            </Grid>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Box>
              {/* Password Change */}
              <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  <LockIcon sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle' }} />
                  Change Password
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={e => setSecurityForm(f => ({ ...f, currentPassword: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={securityForm.newPassword}
                      onChange={e => setSecurityForm(f => ({ ...f, newPassword: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={e => setSecurityForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handlePasswordChange}
                      disabled={loading || !securityForm.currentPassword || !securityForm.newPassword}
                      sx={{ borderRadius: 3 }}
                    >
                      Update Password
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* MFA */}
              <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  <SecurityIcon sx={{ mr: 1, fontSize: 18, verticalAlign: 'middle' }} />
                  Multi-Factor Authentication
                </Typography>

                {mfaStep === 'done' ? (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Add an extra layer of security to your account
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleMfaSetup}
                      sx={{ borderRadius: 3, mt: 1 }}
                    >
                      Set Up MFA
                    </Button>
                  </Box>
                ) : mfaStep === 'confirm' ? (
                  <Box mt={2}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Scan the QR code in your authenticator app with the secret key below, then enter the verification code.
                    </Alert>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', p: 1, bgcolor: 'grey.100', borderRadius: 1, mb: 2 }}>
                      {mfaSecret}
                    </Typography>
                    <TextField
                      fullWidth
                      label="Enter Verification Code"
                      value={mfaCode}
                      onChange={e => setMfaCode(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" onClick={handleMfaConfirm} disabled={mfaCode.length < 6}>
                        Confirm Setup
                      </Button>
                      <Button variant="outlined" onClick={() => { setMfaStep('done'); setMfaCode(''); }}>
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Box mt={2">
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      MFA is currently enabled. Enter your current password to disable it.
                    </Typography>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleMfaDisable}
                        disabled={!currentPassword}
                      >
                        Disable MFA
                      </Button>
                      <Button variant="text" onClick={() => setMfaStep('done')}>Cancel</Button>
                    </Stack>
                  </Box>
                )}
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}