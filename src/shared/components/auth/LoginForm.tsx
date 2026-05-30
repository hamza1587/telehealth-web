import { useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Link,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material'
import { MfaVerificationForm } from './MfaVerificationForm.tsx'

interface LoginFormProps {
  onSuccess?: () => void
  onRegisterClick?: () => void
  onForgotPasswordClick?: () => void
}

export function LoginForm({ onSuccess, onRegisterClick, onForgotPasswordClick }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mfaToken, setMfaToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const result = await login({ email, password })

    if (result.success) {
      if (result.mfaRequired) {
        // MFA required, show MFA form
        // The mfaToken is not returned in response but we need to handle MFA flow
        // For now, we'll set a flag to show MFA input
        setMfaToken('pending')
      } else {
        onSuccess?.()
      }
    }
  }

  const handleMfaSuccess = () => {
    setMfaToken(null)
    onSuccess?.()
  }

  const handleMfaCancel = () => {
    setMfaToken(null)
  }

  // Show MFA verification form if MFA is required
  if (mfaToken) {
    return (
      <MfaVerificationForm
        onSuccess={handleMfaSuccess}
        onCancel={handleMfaCancel}
      />
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <Typography variant="h5" align="center" sx={{ fontWeight: 'bold' }}>
          Welcome Back
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center">
          Sign in to your Telehealth Platform account
        </Typography>

        {error && (
          <Alert severity="error" onClose={clearError}>
            {error}
          </Alert>
        )}

  <TextField
    label="Email Address"
    type="email"
    required
    fullWidth
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    disabled={isLoading}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <EmailIcon color="action" />
        </InputAdornment>
      ),
    }}
  />

  <TextField
    label="Password"
    type={showPassword ? 'text' : 'password'}
    required
    fullWidth
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    disabled={isLoading}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <LockIcon color="action" />
        </InputAdornment>
      ),
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            onClick={() => setShowPassword(!showPassword)}
            edge="end"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Remember me"
          />
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={onForgotPasswordClick}
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Divider>or</Divider>

        <Typography variant="body2" align="center">
          Don't have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={onRegisterClick}
          >
            Sign up
          </Link>
        </Typography>
      </Stack>
    </Box>
  )
}
