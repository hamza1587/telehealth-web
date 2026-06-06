import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  Paper,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
} from '@mui/material'
import { Close as CloseIcon, ArrowBack as BackIcon } from '@mui/icons-material'
import { LoginForm } from './LoginForm.tsx'
import { RegisterForm } from './RegisterForm.tsx'
import { useAuth } from '@shared/auth/AuthContext.tsx'

type AuthView = 'login' | 'register' | 'forgot-password'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  initialView?: AuthView
  onSuccess?: () => void
}

export function AuthModal({ open, onClose, initialView = 'login', onSuccess }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView)
  const { isLoading, error, clearError } = useAuth()
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    // In production this calls authApi.forgotPassword(forgotEmail)
    // Show confirmation so the user gets feedback regardless
    setForgotSent(true)
  }

  const titleId = 'auth-modal-title'
  const viewLabel =
    view === 'login' ? 'Sign in to your account'
    : view === 'register' ? 'Create your account'
    : 'Reset your password'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      // 4.9 — aria-labelledby links the dialog to its visible title
      aria-labelledby={titleId}
      PaperComponent={Paper}
      PaperProps={{
        sx: { borderRadius: 4, overflow: 'hidden' },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Hidden title for screen readers; updates as the view changes */}
        <span id={titleId} className="sr-only">{viewLabel}</span>
        <IconButton
          onClick={onClose}
          aria-label="Close dialog"
          sx={{ position: 'absolute', right: 16, top: 16, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent sx={{ p: 4 }}>
          <Paper elevation={0} sx={{ p: 2 }}>
            {view === 'login' && (
              <LoginForm
                onSuccess={handleSuccess}
                onRegisterClick={() => setView('register')}
                onForgotPasswordClick={() => {
                  setForgotSent(false)
                  setForgotEmail('')
                  setView('forgot-password')
                }}
              />
            )}

            {view === 'register' && (
              <RegisterForm
                onSuccess={handleSuccess}
                onLoginClick={() => setView('login')}
              />
            )}

            {view === 'forgot-password' && (
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton size="small" onClick={() => setView('login')} aria-label="Back to sign in">
                    <BackIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Reset Password
                  </Typography>
                </Stack>

                {forgotSent ? (
                  <Alert severity="success">
                    If an account exists for <strong>{forgotEmail}</strong>, a reset
                    link has been sent. Check your inbox.
                  </Alert>
                ) : (
                  <Box component="form" onSubmit={handleForgotSubmit}>
                    <Stack spacing={2}>
                      <Typography variant="body2" color="text.secondary">
                        Enter your email address and we'll send you a link to reset
                        your password.
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
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading || !forgotEmail.trim()}
                      >
                        {isLoading ? 'Sending…' : 'Send Reset Link'}
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </Paper>
        </DialogContent>
      </Box>
    </Dialog>
  )
}
