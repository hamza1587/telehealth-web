import { useState, useCallback } from 'react'
import {
  Box, Button, TextField, Typography, Alert, Stack, Paper,
  Stepper, Step, StepLabel, Divider, IconButton, Tooltip, Chip,
  CircularProgress,
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import { QRCodeCanvas } from 'qrcode.react'
import { authApi } from '@shared/api/authApi.ts'

const STEPS = ['Scan QR code', 'Verify code', 'Save backup codes']

interface MfaSetupPanelProps {
  onComplete?: () => void
  onCancel?: () => void
}

export function MfaSetupPanel({ onComplete, onCancel }: MfaSetupPanelProps) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [qrCodeUri, setQrCodeUri] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [keyCopied, setKeyCopied] = useState(false)

  const startSetup = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.setupMfa()
      setQrCodeUri(res.qrCodeUri)
      setSecretKey(res.secretKey)
      setStep(1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start MFA setup.')
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmCode = useCallback(async () => {
    if (verifyCode.length !== 6) return
    setLoading(true)
    setError(null)
    try {
      await authApi.confirmMfaSetup(verifyCode)
      const { recoveryCodes } = await authApi.generateRecoveryCodes()
      setBackupCodes(recoveryCodes)
      setStep(2)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [verifyCode])

  const copyKey = () => {
    navigator.clipboard.writeText(secretKey)
    setKeyCopied(true)
    setTimeout(() => setKeyCopied(false), 2000)
  }

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'telehealth-recovery-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (step === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <SecurityIcon sx={{ fontSize: 56, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">Enable Two-Factor Authentication</Typography>
          <Typography variant="body2" color="text.secondary" maxWidth={400}>
            Add an extra layer of security to your account. You'll need an authenticator app
            like Google Authenticator, Authy, or Microsoft Authenticator.
          </Typography>
          {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={startSetup} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Set up 2FA'}
            </Button>
            {onCancel && (
              <Button variant="text" onClick={onCancel}>Cancel</Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stepper activeStep={step - 1} alternativeLabel>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider />

        {step === 1 && (
          <Stack spacing={3} alignItems="center">
            <Typography variant="body1" textAlign="center">
              Scan this QR code with your authenticator app, then enter the 6-digit code below.
            </Typography>

            <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, display: 'inline-block' }}>
              <QRCodeCanvas
                value={qrCodeUri}
                size={200}
                level="M"
                includeMargin={false}
              />
            </Box>

            <Box sx={{ width: '100%' }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Can't scan? Enter this key manually:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  value={secretKey}
                  size="small"
                  fullWidth
                  InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontSize: 13 } }}
                />
                <Tooltip title={keyCopied ? 'Copied!' : 'Copy key'}>
                  <IconButton size="small" onClick={copyKey} color={keyCopied ? 'success' : 'default'}>
                    {keyCopied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}

            <TextField
              label="6-digit verification code"
              fullWidth
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputProps={{ inputMode: 'numeric', maxLength: 6 }}
              placeholder="000000"
              autoFocus
            />

            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                onClick={confirmCode}
                disabled={loading || verifyCode.length !== 6}
              >
                {loading ? <CircularProgress size={20} /> : 'Verify & activate'}
              </Button>
              {onCancel && (
                <Button variant="outlined" fullWidth onClick={onCancel}>Cancel</Button>
              )}
            </Stack>
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={3} alignItems="center">
            <Box sx={{ textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 56, color: 'success.main' }} />
              <Typography variant="h6" fontWeight="bold" mt={1}>
                2FA is now active!
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Save these backup codes somewhere safe. Each code can only be used once.
              </Typography>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: 2, width: '100%',
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1,
              }}
            >
              {backupCodes.map(code => (
                <Chip
                  key={code}
                  label={code}
                  variant="outlined"
                  size="small"
                  sx={{ fontFamily: 'monospace', justifyContent: 'center' }}
                />
              ))}
            </Paper>

            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadBackupCodes}
                fullWidth
              >
                Download codes
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={onComplete}
              >
                Done
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}
