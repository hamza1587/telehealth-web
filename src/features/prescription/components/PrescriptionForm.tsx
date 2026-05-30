import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import type { Prescription, PrescriptionForm, MedicationItem } from '@shared/types/prescription.ts'

interface PrescriptionFormProps {
  prescription: Prescription | null
  onSave: (form: PrescriptionForm) => Promise<void>
  onFinalize: () => Promise<void>
  loading: boolean
  saving: boolean
  error: string | null
}

const ROUTES = ['oral', 'sublingual', 'topical', 'injection', 'inhalation']
const FREQUENCIES = ['once daily', 'twice daily', 'three times daily', 'four times daily', 'as needed']

export function PrescriptionForm({
  prescription,
  onSave,
  onFinalize,
  loading,
  saving,
  error,
}: PrescriptionFormProps) {
  const [country, setCountry] = useState(prescription?.country || 'DE')
  const [medications, setMedications] = useState<Omit<MedicationItem, 'id'>[]>(
    prescription?.medications.map(m => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      route: m.route,
      quantity: m.quantity,
      refills: m.refills,
      instructions: m.instructions,
      warnings: m.warnings,
    })) || [{ name: '', dosage: '', frequency: '', duration: '', route: 'oral', quantity: '', refills: 0, instructions: '', warnings: [] }]
  )

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', route: 'oral', quantity: '', refills: 0, instructions: '', warnings: [] }])
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (index: number, field: keyof Omit<MedicationItem, 'id'>, value: string | number) => {
    setMedications(medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ))
  }

  const handleSave = async () => {
    const form: PrescriptionForm = { country, medications }
    await onSave(form)
  }

  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Prescription
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Country"
          value={country}
          onChange={e => setCountry(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Medications
        </Typography>

        {medications.map((med, index) => (
          <Box key={index} sx={{ border: '1px solid', borderColor: 'divider', p: 2, mb: 2, borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">Medication {index + 1}</Typography>
              {medications.length > 1 && (
          <IconButton size="small" onClick={() => removeMedication(index)}>
            <Delete />
          </IconButton>
              )}
            </Box>

            <TextField
              fullWidth
              label="Medication Name"
              value={med.name}
              onChange={e => updateMedication(index, 'name', e.target.value)}
              sx={{ mb: 1 }}
            />

            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                label="Dosage"
                value={med.dosage}
                onChange={e => updateMedication(index, 'dosage', e.target.value)}
                sx={{ flex: 1 }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Route</InputLabel>
                <Select
                  value={med.route}
                  onChange={e => updateMedication(index, 'route', e.target.value)}
                  label="Route"
                >
                  {ROUTES.map(route => (
                    <MenuItem key={route} value={route}>{route}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={med.frequency}
                  onChange={e => updateMedication(index, 'frequency', e.target.value)}
                  label="Frequency"
                >
                  {FREQUENCIES.map(freq => (
                    <MenuItem key={freq} value={freq}>{freq}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Duration"
                value={med.duration}
                onChange={e => updateMedication(index, 'duration', e.target.value)}
                sx={{ flex: 1 }}
              />
            </Box>

            <TextField
              fullWidth
              label="Instructions"
              value={med.instructions}
              onChange={e => updateMedication(index, 'instructions', e.target.value)}
              sx={{ mb: 1 }}
            />
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={addMedication}
          sx={{ mb: 2 }}
        >
          Add Medication
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Draft'}
          </Button>
          {prescription && prescription.status === 'draft' && (
            <Button
              variant="contained"
              onClick={onFinalize}
              disabled={saving}
            >
              Finalize Prescription
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}