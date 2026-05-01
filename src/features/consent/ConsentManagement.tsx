import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Checkbox,
  Typography,
  Alert,
  Divider,
  List,
  Chip,
} from '@mui/material'
import {
  Gavel as TermsIcon,
  PrivacyTip as PrivacyIcon,
  LocalHospital as MedicalIcon,
} from '@mui/icons-material'
import { apiBaseUrl } from '@shared/config/patient.ts'

interface ConsentTemplate {
  id: string
  consentType: string
  version: string
  title: string
  content: string
  isRequired: boolean
  isAccepted: boolean
  acceptedAt?: Date
}

interface ConsentManagementProps {
  onAllConsentsAccepted?: () => void
}

export function ConsentManagement({ onAllConsentsAccepted }: ConsentManagementProps) {
  const [consents, setConsents] = useState<ConsentTemplate[]>([
    {
      id: '1',
      consentType: 'TermsOfService',
      version: '1.0',
      title: 'Terms of Service',
      content: 'By using our telehealth platform, you agree to abide by our terms of service...',
      isRequired: true,
      isAccepted: false,
    },
    {
      id: '2',
      consentType: 'PrivacyPolicy',
      version: '1.0',
      title: 'Privacy Policy',
      content: 'We take your privacy seriously. This policy explains how we collect, use, and protect your personal health information...',
      isRequired: true,
      isAccepted: false,
    },
    {
      id: '3',
      consentType: 'TelehealthConsent',
      version: '1.0',
      title: 'Telehealth Informed Consent',
      content: 'Telehealth involves the use of electronic communications to enable healthcare providers to diagnose, consult, and treat patients remotely...',
      isRequired: true,
      isAccepted: false,
    },
  ])
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async () => {
    setSubmitting(true)
    setError(null)

    try {
      const acceptedConsents = consents
        .filter(c => c.isAccepted)
        .map(c => ({ consentType: c.consentType, version: c.version }))

      const response = await fetch(`${apiBaseUrl}/platform/consents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consents: acceptedConsents }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to save consents')
      }

      setAccepted(true)
      onAllConsentsAccepted?.()
    } catch (err) {
      console.error('[API Error] Consent submission failed:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString()
      })
      setError(err instanceof Error ? err.message : 'Failed to save consents')
    } finally {
      setSubmitting(false)
    }
  }

  const allRequiredAccepted = consents
    .filter(c => c.isRequired)
    .every(c => c.isAccepted)

  const toggleConsent = (id: string) => {
    setConsents(prev =>
      prev.map(c =>
        c.id === id ? { ...c, isAccepted: !c.isAccepted } : c
      )
    )
  }

  const getConsentIcon = (type: string) => {
    switch (type) {
      case 'TermsOfService':
        return <TermsIcon color="primary" />
      case 'PrivacyPolicy':
        return <PrivacyIcon color="primary" />
      case 'TelehealthConsent':
        return <MedicalIcon color="primary" />
      default:
        return <TermsIcon color="primary" />
    }
  }

  if (accepted) {
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        Thank you! Your consent has been recorded. You can now proceed with using the platform.
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Consent Management
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Please review and accept the following required consents to use our telehealth platform.
        Your data privacy and informed consent are important to us.
      </Alert>

      <List>
        {consents.map((consent) => (
          <Card key={consent.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getConsentIcon(consent.consentType)}
                <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
                  {consent.title}
                </Typography>
                {consent.isRequired && (
                  <Chip label="Required" color="primary" size="small" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Version {consent.version}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                {consent.content}
              </Typography>
            </CardContent>
            <Divider />
            <CardActions sx={{ px: 2, py: 1 }}>
              <Checkbox
                checked={consent.isAccepted}
                onChange={() => toggleConsent(consent.id)}
              />
              <Typography variant="body2">
                I have read and accept the {consent.title}
              </Typography>
            </CardActions>
          </Card>
        ))}
      </List>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          disabled={!allRequiredAccepted || submitting}
          onClick={handleAccept}
        >
          {submitting ? 'Processing...' : 'Accept All Consents'}
        </Button>
      </Box>
    </Box>
  )
}
