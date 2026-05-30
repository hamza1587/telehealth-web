import { Box, Alert } from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'
import { GDPRRequestForm } from './components/GDPRRequest.tsx'
import { GDPRRequestList } from './components/GDPRRequestList.tsx'
import { useGDPRRequests } from './hooks/useGDPRRequests.ts'

export function GDPRWorkspace() {
  const {
    requests,
    loading,
    error,
    submitRequest,
    exportData,
  } = useGDPRRequests()

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }} icon={<InfoIcon />}>
        Exercise your data rights under GDPR and the European Health Data Space (EHDS).
        All requests are processed within 30 days as required by law.
      </Alert>

      <GDPRRequestForm
        loading={loading}
        error={error || undefined}
        onSubmitRequest={submitRequest}
        onExportData={exportData}
      />

      <Box sx={{ mt: 4 }}>
        <GDPRRequestList
          requests={requests}
          loading={loading}
          error={error || undefined}
        />
      </Box>
    </Box>
  )
}