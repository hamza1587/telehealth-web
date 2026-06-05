import { useState, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { apiBaseUrl } from '@shared/config/patient.ts'
import type { Prescription } from '@shared/types/prescription.ts'

interface GatewayResult {
  gateway: string;
  results: {
    gatewayPrescriptionId: string;
    status: string;
    nationalPrescriptionId?: string;
  }[];
}

interface DoseSpotPrescribeFormProps {
  prescription: Prescription;
  patientId: string;
  doctorId: string;
  countryCode?: string;
  onSubmitted?: (result: GatewayResult) => void;
}

export function DoseSpotPrescribeForm({
  prescription,
  patientId,
  doctorId,
  countryCode = 'DE',
  onSubmitted,
}: DoseSpotPrescribeFormProps) {
  const [country, setCountry] = useState(countryCode)
  const [deaNumber, setDeaNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GatewayResult | null>(null)

  const hasControlledSubstance = prescription.medications.some(m =>
    m.warnings?.some(w => w.toLowerCase().includes('controlled')),
  )

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiBaseUrl}/gateway/prescription/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          doctorId,
          countryCode: country,
          deaNumber: deaNumber || undefined,
          medications: prescription.medications.map(m => ({
            name: m.name,
            dosage: m.dosage,
            quantity: String(m.quantity),
            daysSupply: parseInt(m.duration ?? '30') || 30,
            refills: m.refills ?? 0,
            instructions: m.instructions,
            isControlledSubstance: m.warnings?.some(w => w.toLowerCase().includes('controlled')),
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string; detail?: string }
        throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`)
      }
      const data = await res.json() as GatewayResult
      setResult(data)
      onSubmitted?.(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }, [patientId, doctorId, country, deaNumber, prescription.medications, onSubmitted])

  if (result) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <CheckCircleIcon color="success" />
            <Typography variant="h6">Prescription submitted via {result.gateway}</Typography>
          </Stack>
          <Stack spacing={1}>
            {result.results.map((r, i) => (
              <Box key={r.gatewayPrescriptionId} sx={{ p: 1.5, bgcolor: 'success.lighter', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Medication {i + 1}
                </Typography>
                <Typography variant="body2">Gateway ID: {r.gatewayPrescriptionId}</Typography>
                {r.nationalPrescriptionId && (
                  <Typography variant="body2">National ID: {r.nationalPrescriptionId}</Typography>
                )}
                <Chip label={r.status} size="small" color="success" sx={{ mt: 0.5 }} />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    )
  }

  if (prescription.status !== 'final') {
    return (
      <Alert severity="info">
        Finalize the prescription before submitting to the gateway.
      </Alert>
    )
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Submit to DoseSpot
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2}>
          <TextField
            label="Country code"
            value={country}
            onChange={e => setCountry(e.target.value.toUpperCase())}
            inputProps={{ maxLength: 2 }}
            helperText="ISO 3166-1 alpha-2 (e.g. DE, FR, GB)"
            size="small"
          />

          {hasControlledSubstance && (
            <TextField
              label="DEA number (required for controlled substances)"
              value={deaNumber}
              onChange={e => setDeaNumber(e.target.value)}
              size="small"
            />
          )}

          <Divider />

          <Typography variant="body2" color="text.secondary">
            {prescription.medications.length} medication{prescription.medications.length !== 1 ? 's' : ''} will be
            transmitted to DoseSpot for country <strong>{country}</strong>.
          </Typography>

          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            onClick={() => void handleSubmit()}
            disabled={loading}
          >
            {loading ? 'Submitting…' : 'Submit to DoseSpot'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
