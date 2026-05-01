import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import type { DataRightForm, DataRightType } from '@shared/types/dataRights.ts'

interface DataRightsFormProps {
  onSubmit: (form: DataRightForm) => Promise<void>
  submitting: boolean
  error: string | null
}

const RIGHT_TYPES: { value: DataRightType; label: string }[] = [
  { value: 'access', label: 'Access my data' },
  { value: 'rectification', label: 'Correct my data' },
  { value: 'erasure', label: 'Delete my data' },
  { value: 'restriction', label: 'Restrict processing' },
  { value: 'portability', label: 'Data portability' },
  { value: 'objection', label: 'Object to processing' },
]

export function DataRightsForm({ onSubmit, submitting, error }: DataRightsFormProps) {
  const [type, setType] = useState<DataRightType>('access')
  const [description, setDescription] = useState('')

  const handleSubmit = async () => {
    const form: DataRightForm = { type, description }
    await onSubmit(form)
    setDescription('')
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Exercise Your Data Rights
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Right Type</InputLabel>
          <Select
            value={type}
            onChange={e => setType(e.target.value as DataRightType)}
            label="Right Type"
          >
            {RIGHT_TYPES.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Description (optional)"
          multiline
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Please provide any additional details about your request..."
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={24} /> : 'Submit Request'}
        </Button>
      </CardContent>
    </Card>
  )
}