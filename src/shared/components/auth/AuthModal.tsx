import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  Paper,
  IconButton,
  Box,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { LoginForm } from './LoginForm.tsx'
import { RegisterForm } from './RegisterForm.tsx'

type AuthView = 'login' | 'register'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  initialView?: AuthView
  onSuccess?: () => void
}

export function AuthModal({ open, onClose, initialView = 'login', onSuccess }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView)

  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slots={{
        paper: Paper
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
          }
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <DialogContent sx={{ p: 4 }}>
          <Paper elevation={0} sx={{ p: 2 }}>
            {view === 'login' ? (
              <LoginForm
                onSuccess={handleSuccess}
                onRegisterClick={() => setView('register')}
                onForgotPasswordClick={() => {
                  // TODO: Show forgot password form
                  alert('Forgot password - to be implemented')
                }}
              />
            ) : (
              <RegisterForm
                onSuccess={handleSuccess}
                onLoginClick={() => setView('login')}
              />
            )}
          </Paper>
        </DialogContent>
      </Box>
    </Dialog>
  )
}
