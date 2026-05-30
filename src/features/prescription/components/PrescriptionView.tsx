import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Button,
} from '@mui/material'
import Description from '@mui/icons-material/Description'
import DownloadIcon from '@mui/icons-material/Download'
import type { Prescription } from '@shared/types/prescription.ts'

interface PrescriptionViewProps {
  prescription: Prescription | null
  loading: boolean
  error: string | null
}

export function PrescriptionView({ prescription, loading, error }: PrescriptionViewProps) {
  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography>Loading prescription...</Typography>
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

  if (!prescription) {
    return (
      <Alert severity="info">
        No prescription was issued for this consultation.
      </Alert>
    )
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
          Prescription
        </Typography>
          <Chip
            label={prescription.status}
            color={prescription.status === 'final' ? 'success' : 'warning'}
            size="small"
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Country: {prescription.country}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Doctor
          </Typography>
          <Typography>
            {prescription.doctorSignature.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            License: {prescription.doctorSignature.licenseNumber} ({prescription.doctorSignature.licenseAuthority})
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Medications
          </Typography>
          {prescription.medications.map((med, index) => (
            <Box key={med.id} sx={{ mb: 1, pl: 2, borderLeft: '2px solid', borderColor: 'primary.main' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {index + 1}. {med.name}
              </Typography>
              <Typography variant="body2">
                {med.dosage} {med.route} - {med.frequency} for {med.duration}
              </Typography>
              {med.instructions && (
                <Typography variant="caption" color="text.secondary">
                  Instructions: {med.instructions}
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {prescription.pdfUrl && (
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => window.open(prescription.pdfUrl as string, '_blank')}>
            Download PDF
          </Button>
        )}
      </CardContent>
    </Card>
  )
}