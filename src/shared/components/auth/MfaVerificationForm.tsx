import { useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
} from '@mui/material'
import {
  Security as SecurityIcon,
} from '@mui/icons-material'

interface MfaVerificationFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function MfaVerificationForm({ onSuccess, onCancel }: MfaVerificationFormProps) {
  const { verifyMfa, isLoading, error, clearError } = useAuth()
  
  const [code, setCode] = useState('')
  const [mfaToken] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    // Note: In a real implementation, the mfaToken should be passed from the login response
    // For now, we're using a placeholder. The backend returns mfaToken in the login response
    
    // when MFA is required.
    const result = await verifyMfa({ 
      mfaToken: mfaToken || 'placeholder-token', 
      code 
    })

    if (result.success) {
      onSuccess()
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Two-Factor Authentication
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter the verification code from your authenticator app
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={clearError}>
            {error}
          </Alert>
        )}

  <TextField
    label="Verification Code"
    type="text"
    required
    fullWidth
    value={code}
    onChange={(e) => setCode(e.target.value)}
    disabled={isLoading}
    inputProps={{
      maxLength: 6,
      pattern: '[0-9]*',
    }}
    placeholder="000000"
    helperText="Enter the 6-digit code from your authenticator app"
  />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>

        <Typography variant="body2" color="text.secondary" align="center">
          Lost access to your authenticator?{' '}
          <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
            Use recovery code
          </Box>
        </Typography>
      </Stack>
    </Box>
  )
}
