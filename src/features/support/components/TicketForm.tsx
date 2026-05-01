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
import type { TicketForm, TicketCategory } from '@shared/types/support.ts'

interface TicketFormProps {
  onSubmit: (form: TicketForm) => Promise<void>
  submitting: boolean
  error: string | null
}

const CATEGORIES: TicketCategory[] = [
  'payment_issue',
  'credit_issue',
  'call_quality_issue',
  'doctor_no_show',
  'patient_no_show',
  'prescription_issue',
  'clinical_complaint',
  'privacy_request',
  'account_issue',
]

export function TicketForm({ onSubmit, submitting, error }: TicketFormProps) {
  const [category, setCategory] = useState<TicketCategory>('payment_issue')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async () => {
    const form: TicketForm = { category, subject, description }
    await onSubmit(form)
    setSubject('')
    setDescription('')
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Create Support Ticket
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={e => setCategory(e.target.value as TicketCategory)}
            label="Category"
          >
            {CATEGORIES.map(cat => (
              <MenuItem key={cat} value={cat}>
                {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Description"
          multiline
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !subject || !description}
        >
          {submitting ? <CircularProgress size={24} /> : 'Submit Ticket'}
        </Button>
      </CardContent>
    </Card>
  )
}