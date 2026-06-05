import { useState, useEffect, useCallback } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  Collapse,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import { apiBaseUrl } from '@shared/config/patient.ts'

interface DrugInteraction {
  medication1: string;
  medication2: string;
  severity: 'Low' | 'Moderate' | 'High';
  description: string;
  recommendation: string;
}

interface DrugInteractionAlertProps {
  existingMedications: string[];
  newMedications: string[];
  countryCode?: string;
  onInteractionsLoaded?: (interactions: DrugInteraction[]) => void;
}

const SEVERITY_CONFIG: Record<DrugInteraction['severity'], { color: 'info' | 'warning' | 'error'; icon: React.ReactNode }> = {
  Low: { color: 'info', icon: <InfoIcon fontSize="small" /> },
  Moderate: { color: 'warning', icon: <WarningAmberIcon fontSize="small" /> },
  High: { color: 'error', icon: <ErrorIcon fontSize="small" /> },
}

export function DrugInteractionAlert({
  existingMedications,
  newMedications,
  countryCode = 'DE',
  onInteractionsLoaded,
}: DrugInteractionAlertProps) {
  const [interactions, setInteractions] = useState<DrugInteraction[]>([])
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  const checkInteractions = useCallback(async () => {
    if (newMedications.length === 0) return
    setLoading(true)
    try {
      const res = await fetch(`${apiBaseUrl}/gateway/drug-interactions/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ existingMedications, newMedications, countryCode }),
      })
      if (!res.ok) return
      const data = await res.json() as DrugInteraction[]
      setInteractions(data)
      onInteractionsLoaded?.(data)
    } catch {
      // Interaction check failures are non-fatal — don't surface error
    } finally {
      setLoading(false)
      setChecked(true)
    }
  }, [existingMedications, newMedications, countryCode, onInteractionsLoaded])

  useEffect(() => {
    void checkInteractions()
  }, [checkInteractions])

  if (loading) return null
  if (!checked || interactions.length === 0) return null

  const highest = interactions.reduce<DrugInteraction['severity']>((acc, i) => {
    if (i.severity === 'High') return 'High'
    if (i.severity === 'Moderate' && acc !== 'High') return 'Moderate'
    return acc
  }, 'Low')

  const { color } = SEVERITY_CONFIG[highest]

  return (
    <Alert severity={color} icon={false} sx={{ mb: 2 }}>
      <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon fontSize="small" />
        {interactions.length} drug interaction{interactions.length !== 1 ? 's' : ''} detected
      </AlertTitle>
      <Stack spacing={1.5} sx={{ mt: 1 }}>
        {interactions.map((interaction, i) => {
          const config = SEVERITY_CONFIG[interaction.severity]
          return (
            <Box key={i}>
              {i > 0 && <Divider sx={{ mb: 1.5 }} />}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                <Chip
                  icon={config.icon as React.ReactElement}
                  label={interaction.severity}
                  size="small"
                  color={config.color}
                />
                <Typography variant="body2" fontWeight={600}>
                  {interaction.medication1} + {interaction.medication2}
                </Typography>
              </Stack>
              <Collapse in>
                <Typography variant="body2" sx={{ mb: 0.5 }}>{interaction.description}</Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Recommendation:</strong> {interaction.recommendation}
                </Typography>
              </Collapse>
            </Box>
          )
        })}
      </Stack>
    </Alert>
  )
}
