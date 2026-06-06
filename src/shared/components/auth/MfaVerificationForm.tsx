import { useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import {
  Box, Button, TextField, Typography, Alert, Stack, Tabs, Tab,
} from '@mui/material'
import { Security as SecurityIcon } from '@mui/icons-material'

interface MfaVerificationFormProps {
  mfaToken: string
  onSuccess: () => void
  onCancel: () => void
}

export function MfaVerificationForm({ mfaToken, onSuccess, onCancel }: MfaVerificationFormProps) {
  const { verifyMfa, isLoading, error, clearError } = useAuth()
  const [tab, setTab] = useState<0 | 1>(0)
  const [code, setCode] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const payload = tab === 0
      ? { mfaToken, code }
      : { mfaToken, code: recoveryCode, isRecoveryCode: true }

    const result = await verifyMfa(payload)
    if (result.success) onSuccess()
  }

  const submitDisabled = isLoading || (tab === 0 ? code.length !== 6 : recoveryCode.trim().length === 0)

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <Box sx={{ textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">Two-Factor Authentication</Typography>
          <Typography variant="body2" color="text.secondary">
            Verify your identity to continue.
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(_, v) => { setTab(v); clearError() }} variant="fullWidth">
          <Tab label="Authenticator code" />
          <Tab label="Recovery code" />
        </Tabs>

        {error && <Alert severity="error" onClose={clearError}>{error}</Alert>}

        {tab === 0 ? (
          <TextField
            label="6-digit code"
            required
            fullWidth
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={isLoading}
            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            placeholder="000000"
            helperText="Enter the code from your authenticator app."
            autoFocus
          />
        ) : (
          <TextField
            label="Recovery code"
            required
            fullWidth
            value={recoveryCode}
            onChange={e => setRecoveryCode(e.target.value.trim())}
            disabled={isLoading}
            placeholder="xxxx-xxxx-xxxx-xxxx"
            helperText="Enter one of the recovery codes you saved during setup."
            autoFocus
          />
        )}

        <Button type="submit" variant="contained" size="large" fullWidth disabled={submitDisabled}>
          {isLoading ? 'Verifying…' : 'Verify'}
        </Button>

        <Button variant="text" fullWidth onClick={onCancel} disabled={isLoading}>
          Back to sign in
        </Button>
      </Stack>
    </Box>
  )
}
