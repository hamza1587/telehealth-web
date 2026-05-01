import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Divider,
} from '@mui/material'
import { DescriptionIcon } from '@mui/icons-material'
import type { ClinicalNote } from '@shared/types/clinical.ts'

interface ClinicalNoteViewProps {
  note: ClinicalNote | null
  loading: boolean
  error: string | null
}

export function ClinicalNoteView({ note, loading, error }: ClinicalNoteViewProps) {
  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography>Loading clinical note...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )
  }

  if (!note) {
    return (
      <Alert severity="info">
        No clinical note available yet. The doctor will add notes after your consultation.
      </Alert>
    )
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Clinical Note
          </Typography>
          <Chip
            label={note.status}
            color={note.status === 'final' ? 'success' : 'warning'}
            size="small"
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Version {note.version} • Updated: {new Date(note.updatedAt).toLocaleDateString()}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Chief Complaint
          </Typography>
          <Typography>{note.chiefComplaint}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Assessment
          </Typography>
          <Typography>{note.assessment}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Plan
          </Typography>
          <Typography whiteSpace="pre-line">{note.plan}</Typography>
        </Box>

        {note.followUpRecommendation && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Follow-up
            </Typography>
            <Typography>{note.followUpRecommendation}</Typography>
          </Box>
        )}

        {note.safetyNetInstructions && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Safety-net Instructions
            </Typography>
            <Typography>{note.safetyNetInstructions}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}