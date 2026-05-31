import type { SelectChangeEvent } from '@mui/material'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Stack, Alert, FormControl, InputLabel,
  Select, MenuItem, Grid, Chip,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Save as SaveIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { useState } from 'react'
import type { GDPRRequestForm } from '@shared/types/index.ts'

export function GDPRRequestForm({
  loading,
  error,
  onSubmitRequest,
  onExportData,
}: {
  loading: boolean
  error: string | null
  onSubmitRequest: (form: GDPRRequestForm) => Promise<boolean>
  onExportData: () => void
}) {
  const [form, setForm] = useState<GDPRRequestForm>({
    type: 'access',
    description: '',
    dataCategories: [],
  })
  const [success, setSuccess] = useState('')

  const dataCategories = [
    'personal_information',
    'medical_records',
    'appointment_history',
    'billing_data',
    'consent_records',
    'communication_logs',
    'device_information',
    'usage_data',
  ] as const

  const handleSubmit = async () => {
    setSuccess('')
    const result = await onSubmitRequest(form)
    if (result) {
      setForm({ type: 'access', description: '', dataCategories: [] })
      setSuccess('Your request has been submitted successfully!')
    }
  }

  const toggleCategory = (cat: string) => {
    setForm(prev => ({
      ...prev,
      dataCategories: prev.dataCategories.includes(cat)
        ? prev.dataCategories.filter(c => c !== cat)
        : [...prev.dataCategories, cat],
    }))
  }

  return (
    <Box>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Submit Request */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <InfoIcon color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h6">Submit a Data Rights Request</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Exercise your rights under GDPR and EHDS
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Request Type</InputLabel>
                    <Select
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                      label="Request Type"
                    >
                      <MenuItem value="access">Right of Access</MenuItem>
                      <MenuItem value="rectification">Right of Rectification</MenuItem>
                      <MenuItem value="erasure">Right to Erasure</MenuItem>
                      <MenuItem value="restriction">Right to Restriction</MenuItem>
                      <MenuItem value="portability">Right to Data Portability</MenuItem>
                      <MenuItem value="objection">Right to Objection</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Please describe your request in detail..."
                    helperText="Provide specific details about the data you're requesting, or what needs to be corrected."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Data Categories</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {dataCategories.map(cat => (
                      <Chip
                        key={cat}
                        label={cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        onClick={() => toggleCategory(cat)}
                        color={form.dataCategories.includes(cat) ? 'primary' : 'default'}
                        variant={form.dataCategories.includes(cat) ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={loading || !form.description.trim() || form.dataCategories.length === 0}
                    startIcon={<SaveIcon />}
                    sx={{ borderRadius: 3 }}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 4, mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={1.5} mt={1}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  fullWidth
                  onClick={onExportData}
                  sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
                >
                  Export All My Data
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Request Status
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No pending requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}