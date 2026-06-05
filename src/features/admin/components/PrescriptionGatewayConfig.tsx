import { useState, useEffect, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { apiBaseUrl } from '@shared/config/patient.ts'

type PrescriptionGateway = 'dosespot' | 'none'
type LabGateway = 'health_gorilla' | 'none'

interface CountryConfig {
  prescriptionGateway: PrescriptionGateway;
  labGateway: LabGateway;
}

interface EditState {
  prescriptionGateway: PrescriptionGateway;
  labGateway: LabGateway;
  saving: boolean;
}

export function PrescriptionGatewayConfig() {
  const [configs, setConfigs] = useState<Record<string, CountryConfig> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, EditState>>({})
  const [saved, setSaved] = useState<string | null>(null)

  const loadConfigs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${apiBaseUrl}/gateway/config`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as Record<string, CountryConfig>
      setConfigs(data)
      const initialEdits: Record<string, EditState> = {}
      for (const [country, cfg] of Object.entries(data)) {
        initialEdits[country] = { ...cfg, saving: false }
      }
      setEdits(initialEdits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load config')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadConfigs() }, [loadConfigs])

  const handleSave = useCallback(async (countryCode: string) => {
    const edit = edits[countryCode]
    if (!edit) return
    setEdits(prev => ({ ...prev, [countryCode]: { ...edit, saving: true } }))
    try {
      const res = await fetch(`${apiBaseUrl}/gateway/config/${countryCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionGateway: edit.prescriptionGateway, labGateway: edit.labGateway }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSaved(countryCode)
      setTimeout(() => setSaved(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setEdits(prev => ({ ...prev, [countryCode]: { ...edit, saving: false } }))
    }
  }, [edits])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) return <Alert severity="error">{error}</Alert>
  if (!configs) return null

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          E-Prescription Gateway Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Map each country to its prescription and lab gateway. Changes apply immediately (in-memory; restart resets to defaults).
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              <TableCell>Prescription gateway</TableCell>
              <TableCell>Lab gateway</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(configs).sort().map(countryCode => {
              const edit = edits[countryCode]
              const isDirty =
                edit?.prescriptionGateway !== configs[countryCode].prescriptionGateway ||
                edit?.labGateway !== configs[countryCode].labGateway

              return (
                <TableRow key={countryCode}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" fontWeight={600}>{countryCode}</Typography>
                      {saved === countryCode && <Chip label="Saved" size="small" color="success" />}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel>Rx gateway</InputLabel>
                      <Select
                        value={edit?.prescriptionGateway ?? 'none'}
                        label="Rx gateway"
                        onChange={e =>
                          setEdits(prev => ({
                            ...prev,
                            [countryCode]: { ...prev[countryCode], prescriptionGateway: e.target.value as PrescriptionGateway },
                          }))
                        }
                      >
                        <MenuItem value="dosespot">DoseSpot</MenuItem>
                        <MenuItem value="none">None</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Lab gateway</InputLabel>
                      <Select
                        value={edit?.labGateway ?? 'none'}
                        label="Lab gateway"
                        onChange={e =>
                          setEdits(prev => ({
                            ...prev,
                            [countryCode]: { ...prev[countryCode], labGateway: e.target.value as LabGateway },
                          }))
                        }
                      >
                        <MenuItem value="health_gorilla">Health Gorilla</MenuItem>
                        <MenuItem value="none">None</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant={isDirty ? 'contained' : 'outlined'}
                      startIcon={edit?.saving ? <CircularProgress size={12} color="inherit" /> : <SaveIcon />}
                      onClick={() => void handleSave(countryCode)}
                      disabled={edit?.saving || !isDirty}
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
