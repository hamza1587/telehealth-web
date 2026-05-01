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
  Divider,
} from '@mui/material'
import type { ClinicalNote, ClinicalNoteForm } from '@shared/types/clinical.ts'

interface ClinicalNoteFormProps {
  note: ClinicalNote | null
  onSave: (form: ClinicalNoteForm) => Promise<void>
  onFinalize: () => Promise<void>
  loading: boolean
  saving: boolean
  error: string | null
}

export function ClinicalNoteForm({
  note,
  onSave,
  onFinalize,
  loading,
  saving,
  error,
}: ClinicalNoteFormProps) {
  const [form, setForm] = useState<ClinicalNoteForm>({
    chiefComplaint: note?.chiefComplaint || '',
    historyOfPresentIllness: note?.historyOfPresentIllness || '',
    relevantPastHistory: note?.relevantPastHistory || '',
    medications: note?.medications || '',
    allergies: note?.allergies || '',
    observations: note?.observations || '',
    assessment: note?.assessment || '',
    plan: note?.plan || '',
    adviceGiven: note?.adviceGiven || '',
    safetyNetInstructions: note?.safetyNetInstructions || '',
    followUpRecommendation: note?.followUpRecommendation || '',
  })

  const handleChange = (field: keyof ClinicalNoteForm) => (value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
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
          Clinical Note
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Subjective
        </Typography>
        <TextField
          fullWidth
          label="Chief Complaint"
          value={form.chiefComplaint}
          onChange={e => handleChange('chiefComplaint')(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="History of Present Illness"
          multiline
          rows={3}
          value={form.historyOfPresentIllness}
          onChange={e => handleChange('historyOfPresentIllness')(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Relevant Past History"
          multiline
          rows={2}
          value={form.relevantPastHistory}
          onChange={e => handleChange('relevantPastHistory')(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Objective
        </Typography>
        <TextField
          fullWidth
          label="Observations"
          multiline
          rows={3}
          value={form.observations}
          onChange={e => handleChange('observations')(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Medications"
          value={form.medications}
          onChange={e => handleChange('medications')(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Allergies"
          value={form.allergies}
          onChange={e => handleChange('allergies')(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Assessment & Plan
        </Typography>
        <TextField
          fullWidth
          label="Assessment"
          multiline
          rows={3}
          value={form.assessment}
          onChange={e => handleChange('assessment')(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Plan"
          multiline
          rows={3}
          value={form.plan}
          onChange={e => handleChange('plan')(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Follow-up
        </Typography>
        <TextField
          fullWidth
          label="Advice Given"
          multiline
          rows={2}
          value={form.adviceGiven}
          onChange={e => handleChange('adviceGiven')(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Safety-net Instructions"
          multiline
          rows={2}
          value={form.safetyNetInstructions}
          onChange={e => handleChange('safetyNetInstructions')(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Follow-up Recommendation"
          multiline
          rows={2}
          value={form.followUpRecommendation}
          onChange={e => handleChange('followUpRecommendation')(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Draft'}
          </Button>
          {note && note.status === 'draft' && (
            <Button
              variant="contained"
              onClick={onFinalize}
              disabled={saving}
            >
              Finalize Note
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}