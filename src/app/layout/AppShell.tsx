import { lazy, Suspense, useMemo, useState } from 'react'
import { useLocalStorage } from 'react-haiku'
import { Box, Chip, CircularProgress, Container, Drawer, Grid, IconButton, Paper, Stack, Typography } from '@mui/material'
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material'
import type { WorkspaceKey } from '@shared/types/workspace.ts'
import { Sidebar } from '@shared/components/navigation/Sidebar.tsx'
import { MobileNav } from '@shared/components/navigation/MobileNav.tsx'
import { LanguageSwitcher } from '@shared/i18n/LanguageSwitcher.tsx'
import { workspaceDefinitions } from '@shared/config/workspaces.tsx'
import { usePatientOnboarding } from '@features/patient/hooks/usePatientOnboarding.ts'
import { useDoctorWorkspace } from '@features/doctor/hooks/useDoctorWorkspace.ts'
import { useAppTitle } from '@shared/hooks/useAppTitle.ts'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import { UserMenu, LoginButton } from '@shared/components/auth/UserMenu.tsx'
import { AuthModal } from '@shared/components/auth/AuthModal.tsx'

// 6.1 — Route-level code splitting: each workspace is a separate JS chunk loaded on demand
const OverviewWorkspace = lazy(() => import('@features/overview/components/OverviewWorkspace.tsx').then(m => ({ default: m.OverviewWorkspace })))
const PatientWorkspace = lazy(() => import('@features/patient/components/PatientWorkspace.tsx').then(m => ({ default: m.PatientWorkspace })))
const DoctorWorkspace = lazy(() => import('@features/doctor/components/DoctorWorkspace.tsx').then(m => ({ default: m.DoctorWorkspace })))
const DiscoveryWorkspace = lazy(() => import('@features/discovery/DiscoveryWorkspace.tsx').then(m => ({ default: m.DiscoveryWorkspace })))
const ConsultationWorkspace = lazy(() => import('@features/consultation/ConsultationWorkspace.tsx').then(m => ({ default: m.ConsultationWorkspace })))
const BillingWorkspace = lazy(() => import('@features/billing/components/BillingWorkspace.tsx').then(m => ({ default: m.BillingWorkspace })))
const ClinicalWorkspace = lazy(() => import('@features/clinical/components/ClinicalWorkspace.tsx').then(m => ({ default: m.ClinicalWorkspace })))
const OperationsWorkspace = lazy(() => import('@features/operations/components/OperationsWorkspace.tsx').then(m => ({ default: m.OperationsWorkspace })))
const AppointmentsWorkspace = lazy(() => import('@features/appointments/AppointmentsWorkspace.tsx').then(m => ({ default: m.AppointmentsWorkspace })))
const ProfileWorkspace = lazy(() => import('@features/profile/ProfileWorkspace.tsx').then(m => ({ default: m.ProfileWorkspace })))
const GDPRWorkspace = lazy(() => import('@features/gdpr/GDPRWorkspace.tsx').then(m => ({ default: m.GDPRWorkspace })))
const ResearchWorkspace = lazy(() => import('@features/research/ResearchWorkspace.tsx').then(m => ({ default: m.ResearchWorkspace })))
const AdminWorkspace = lazy(() => import('@features/admin/AdminWorkspace.tsx').then(m => ({ default: m.AdminWorkspace })))
const AnalyticsDashboard = lazy(() => import('@features/analytics/AnalyticsDashboard.tsx').then(m => ({ default: m.AnalyticsDashboard })))

const WorkspaceLoader = (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
    <CircularProgress size={36} />
  </Box>
)

export function AppShell() {
  const { isAuthenticated } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
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
    <Box sx={{
      minHeight: '100vh',
      background:
        'radial-gradient(circle at top left, rgba(47, 125, 246, 0.12), transparent 20%), radial-gradient(circle at right top, rgba(13, 148, 136, 0.12), transparent 18%), linear-gradient(180deg, #f6f9fc 0%, #eef5f2 100%)',
      pt: { xs: 3, md: 4 },
      pb: { xs: 10, md: 4 },
    }}
    >
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <Box role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {`${activeWorkspace.label} workspace`}
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid xs={12} lg={3} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Box component="nav" aria-label="Main navigation">
              <Sidebar activeKey={selectedWorkspace} onSelect={setSelectedWorkspace} statusMessage={patientOnboarding.statusMessage} />
            </Box>
          </Grid>

          <Grid sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box component="main" id="main-content" tabIndex={-1} sx={{ outline: 'none' }}>
              <Stack spacing={3}>
                <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
                      <Stack direction="row" alignItems="flex-start" spacing={1}>
                        <IconButton
                          onClick={() => setDrawerOpen(true)}
                          aria-label="Open navigation menu"
                          sx={{ display: { lg: 'none' }, mt: 0.5 }}
                        >
                          <MenuIcon />
                        </IconButton>
                        <Box>
                          <Typography variant="overline" color="text.secondary">
                            Active workspace
                          </Typography>
                          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
                            {activeWorkspace.label}
                          </Typography>
                          <Typography color="text.secondary">{activeWorkspace.subtitle}</Typography>
                        </Box>
                      </Stack>
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

                    {/* 6.1 — Suspense boundary: shows spinner while workspace chunk loads */}
                    <Suspense fallback={WorkspaceLoader}>
                      {selectedWorkspace === 'overview' && <OverviewWorkspace />}
                      {selectedWorkspace === 'patient' && <PatientWorkspace onboarding={patientOnboarding} />}
                      {selectedWorkspace === 'doctor' && <DoctorWorkspace workspace={doctorWorkspace} />}
                      {selectedWorkspace === 'discovery' && (
                        <DiscoveryWorkspace onBookDoctor={() => { setSelectedWorkspace('consultation') }} />
                      )}
                      {selectedWorkspace === 'consultation' && <ConsultationWorkspace />}
                      {selectedWorkspace === 'appointments' && <AppointmentsWorkspace />}
                      {selectedWorkspace === 'billing' && <BillingWorkspace />}
                      {selectedWorkspace === 'clinical' && <ClinicalWorkspace />}
                      {selectedWorkspace === 'operations' && <OperationsWorkspace />}
                      {selectedWorkspace === 'settings' && <ProfileWorkspace />}
                      {selectedWorkspace === 'gdpr' && <GDPRWorkspace />}
                      {selectedWorkspace === 'research' && <ResearchWorkspace />}
                      {selectedWorkspace === 'admin' && <AdminWorkspace />}
                      {selectedWorkspace === 'analytics' && <AnalyticsDashboard />}
                    </Suspense>
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { lg: 'none' },
          '& .MuiDrawer-paper': { width: 304, maxWidth: '85vw', pt: 1, pb: 2 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, mb: 1 }}>
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close navigation">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="nav" aria-label="Main navigation">
          <Sidebar
            activeKey={selectedWorkspace}
            onSelect={(key) => {
              setSelectedWorkspace(key)
              setDrawerOpen(false)
            }}
            statusMessage={patientOnboarding.statusMessage}
          />
        </Box>
      </Drawer>

      <MobileNav activeKey={selectedWorkspace} onSelect={setSelectedWorkspace} />

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </Box>
  )
}

function isWorkspaceKey(value: unknown): value is WorkspaceKey {
  return typeof value === 'string' && workspaceDefinitions.some((workspace) => workspace.key === value)
}
