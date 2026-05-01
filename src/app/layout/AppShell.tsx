import { useMemo, useState } from 'react'
import { useLocalStorage } from 'react-haiku'
import { Box, Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material'
import type { WorkspaceKey } from '@shared/types/workspace.ts'
import { Sidebar } from '@shared/components/navigation/Sidebar.tsx'
import { LanguageSwitcher } from '@shared/i18n/LanguageSwitcher.tsx'
import { workspaceDefinitions } from '@shared/config/workspaces.tsx'
import { OverviewWorkspace } from '@features/overview/components/OverviewWorkspace.tsx'
import { PatientWorkspace } from '@features/patient/components/PatientWorkspace.tsx'
import { DoctorWorkspace } from '@features/doctor/components/DoctorWorkspace.tsx'
import { DiscoveryWorkspace } from '@features/discovery/components/DiscoveryWorkspace.tsx'
import { ConsultationWorkspace } from '@features/consultation/components/ConsultationWorkspace.tsx'
import { BillingWorkspace } from '@features/billing/components/BillingWorkspace.tsx'
import { ClinicalWorkspace } from '@features/clinical/components/ClinicalWorkspace.tsx'
import { OperationsWorkspace } from '@features/operations/components/OperationsWorkspace.tsx'
import { usePatientOnboarding } from '@features/patient/hooks/usePatientOnboarding.ts'
import { useDoctorWorkspace } from '@features/doctor/hooks/useDoctorWorkspace.ts'
import { useAppTitle } from '@shared/hooks/useAppTitle.ts'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import { UserMenu, LoginButton } from '@shared/components/auth/UserMenu.tsx'
import { AuthModal } from '@shared/components/auth/AuthModal.tsx'

export function AppShell() {
  const { isAuthenticated } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [storedWorkspace, setStoredWorkspace] = useLocalStorage<WorkspaceKey>('telehealth-active-workspace', 'overview')
  const [selectedWorkspace, setSelectedWorkspaceState] = useState<WorkspaceKey>(
    isWorkspaceKey(storedWorkspace) ? storedWorkspace : 'overview',
  )
  const patientOnboarding = usePatientOnboarding(setSelectedWorkspace)
  const doctorWorkspace = useDoctorWorkspace()

  function setSelectedWorkspace(value: WorkspaceKey | ((previous: WorkspaceKey) => WorkspaceKey)) {
    setSelectedWorkspaceState((previous) => {
      const nextValue = typeof value === 'function' ? value(previous) : value
      setStoredWorkspace(nextValue)
      return nextValue
    })
  }

  const activeWorkspace = useMemo(
    () => workspaceDefinitions.find((workspace) => workspace.key === selectedWorkspace) ?? workspaceDefinitions[0],
    [selectedWorkspace],
  )

  useAppTitle(`Telehealth Platform | ${activeWorkspace.label}`)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(47, 125, 246, 0.12), transparent 20%), radial-gradient(circle at right top, rgba(13, 148, 136, 0.12), transparent 18%), linear-gradient(180deg, #f6f9fc 0%, #eef5f2 100%)',
        py: { xs: 3, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 3 }}>
            <Sidebar activeKey={selectedWorkspace} onSelect={setSelectedWorkspace} statusMessage={patientOnboarding.statusMessage} />
          </Grid>
          <Grid size={{ xs: 12, lg: 9 }}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        Active workspace
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {activeWorkspace.label}
                      </Typography>
                      <Typography color="text.secondary">{activeWorkspace.subtitle}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                      <LanguageSwitcher />
                      <Chip label="Phase 1 implementation design" color="primary" variant="outlined" />
                      {isAuthenticated ? (
                        <UserMenu />
                      ) : (
                        <LoginButton onClick={() => setAuthModalOpen(true)} />
                      )}
                    </Stack>
                  </Stack>
                  {selectedWorkspace === 'overview' ? <OverviewWorkspace /> : null}
                  {selectedWorkspace === 'patient' ? <PatientWorkspace onboarding={patientOnboarding} /> : null}
                  {selectedWorkspace === 'doctor' ? <DoctorWorkspace workspace={doctorWorkspace} /> : null}
                  {selectedWorkspace === 'discovery' ? <DiscoveryWorkspace /> : null}
                  {selectedWorkspace === 'consultation' ? <ConsultationWorkspace /> : null}
                  {selectedWorkspace === 'billing' ? <BillingWorkspace /> : null}
                  {selectedWorkspace === 'clinical' ? <ClinicalWorkspace /> : null}
                  {selectedWorkspace === 'operations' ? <OperationsWorkspace /> : null}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </Box>
  )
}

function isWorkspaceKey(value: unknown): value is WorkspaceKey {
  return typeof value === 'string' && workspaceDefinitions.some((workspace) => workspace.key === value)
}
