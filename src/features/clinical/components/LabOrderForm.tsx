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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ScienceIcon from '@mui/icons-material/Science'
import { apiBaseUrl } from '@shared/config/patient.ts'

const COMMON_TESTS = [
  { code: '58410-2', display: 'Complete blood count (CBC)' },
  { code: '2093-3', display: 'Cholesterol total' },
  { code: '2345-7', display: 'Glucose' },
  { code: '2160-0', display: 'Creatinine' },
  { code: '1742-6', display: 'ALT (Alanine aminotransferase)' },
  { code: '3094-0', display: 'BUN (Blood urea nitrogen)' },
  { code: '2951-2', display: 'Sodium' },
  { code: '6768-6', display: 'Alkaline phosphatase' },
  { code: '14804-9', display: 'HbA1c' },
  { code: '3016-3', display: 'TSH (Thyroid stimulating hormone)' },
]

interface LabResult {
  id: string;
  orderId: string;
  status: string;
  conclusion?: string;
  results: { code: string; display: string; value: string; unit: string; referenceRange?: string; interpretation?: string }[];
  issuedAt?: string;
}

interface LabOrder {
  id: string;
  status: string;
  testCode: string;
  testDisplay: string;
  createdAt: string;
}

interface LabOrderFormProps {
  patientId: string;
  consultationId: string;
  countryCode?: string;
}

export function LabOrderForm({ patientId, consultationId: _consultationId, countryCode = 'DE' }: LabOrderFormProps) {
  const [testCode, setTestCode] = useState(COMMON_TESTS[0].code)
  const [customDisplay, setCustomDisplay] = useState('')
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'asap'>('routine')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<LabOrder | null>(null)
  const [results, setResults] = useState<LabResult | null>(null)
  const [loadingResults, setLoadingResults] = useState(false)

  const selectedTest = COMMON_TESTS.find(t => t.code === testCode)
  const testDisplay = customDisplay || selectedTest?.display || testCode

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiBaseUrl}/gateway/lab-orders/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, testCode, testDisplay, priority, notes: notes || undefined, countryCode }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string; detail?: string }
        throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`)
      }
      setOrder(await res.json() as LabOrder)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed')
    } finally {
      setLoading(false)
    }
  }, [patientId, testCode, testDisplay, priority, notes, countryCode])

  const handleFetchResults = useCallback(async () => {
    if (!order) return
    setLoadingResults(true)
    try {
      const res = await fetch(`${apiBaseUrl}/gateway/lab-orders/${order.id}/results?countryCode=${countryCode}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as LabResult | null
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results')
    } finally {
      setLoadingResults(false)
    }
  }, [order, countryCode])

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <ScienceIcon color="primary" />
          <Typography variant="h6">Lab Order — Health Gorilla</Typography>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!order ? (
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Test panel</InputLabel>
              <Select value={testCode} onChange={e => setTestCode(e.target.value)} label="Test panel">
                {COMMON_TESTS.map(t => (
                  <MenuItem key={t.code} value={t.code}>{t.display}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Custom test name (optional)"
              value={customDisplay}
              onChange={e => setCustomDisplay(e.target.value)}
              size="small"
              placeholder={selectedTest?.display}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                onChange={e => setPriority(e.target.value as 'routine' | 'urgent' | 'asap')}
                label="Priority"
              >
                <MenuItem value="routine">Routine</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="asap">ASAP</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Clinical notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              multiline
              minRows={2}
              size="small"
            />

            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ScienceIcon />}
              onClick={() => void handleSubmit()}
              disabled={loading}
            >
              {loading ? 'Ordering…' : 'Place lab order'}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Alert severity="success">
              Lab order placed — ID: <strong>{order.id}</strong>
            </Alert>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={order.testDisplay} size="small" />
              <Chip label={`Status: ${order.status}`} size="small" color="primary" />
            </Box>

            <Divider />

            {results ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Results</Typography>
                {results.conclusion && (
                  <Typography variant="body2" color="text.secondary">{results.conclusion}</Typography>
                )}
                {results.results.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No individual observations returned yet.</Typography>
                )}
                {results.results.map((obs, i) => (
                  <Box key={i} sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{obs.display}</Typography>
                    <Typography variant="body2">{obs.value} {obs.unit}</Typography>
                    {obs.referenceRange && (
                      <Typography variant="caption" color="text.secondary">Ref: {obs.referenceRange}</Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Button
                variant="outlined"
                size="small"
                onClick={() => void handleFetchResults()}
                disabled={loadingResults}
                startIcon={loadingResults ? <CircularProgress size={14} /> : undefined}
              >
                {loadingResults ? 'Fetching results…' : 'Fetch results'}
              </Button>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
