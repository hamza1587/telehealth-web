import { useMemo, useState } from 'react'
import { useLocalStorage } from 'react-haiku'
import { Box, Chip, Container, Drawer, Grid, IconButton, Paper, Stack, Typography } from '@mui/material'
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material'
import type { WorkspaceKey } from '@shared/types/workspace.ts'
import { Sidebar } from '@shared/components/navigation/Sidebar.tsx'
import { MobileNav } from '@shared/components/navigation/MobileNav.tsx'
import { LanguageSwitcher } from '@shared/i18n/LanguageSwitcher.tsx'
import { workspaceDefinitions } from '@shared/config/workspaces.tsx'
import { OverviewWorkspace } from '@features/overview/components/OverviewWorkspace.tsx'
import { PatientWorkspace } from '@features/patient/components/PatientWorkspace.tsx'
import { DoctorWorkspace } from '@features/doctor/components/DoctorWorkspace.tsx'
import { DiscoveryWorkspace } from '@features/discovery/DiscoveryWorkspace.tsx'
import { ConsultationWorkspace } from '@features/consultation/ConsultationWorkspace.tsx'
import { BillingWorkspace } from '@features/billing/components/BillingWorkspace.tsx'
import { ClinicalWorkspace } from '@features/clinical/components/ClinicalWorkspace.tsx'
import { OperationsWorkspace } from '@features/operations/components/OperationsWorkspace.tsx'
import { AppointmentsWorkspace } from '@features/appointments/AppointmentsWorkspace.tsx'
import { ProfileWorkspace } from '@features/profile/ProfileWorkspace.tsx'
import { GDPRWorkspace } from '@features/gdpr/GDPRWorkspace.tsx'
import { ResearchWorkspace } from '@features/research/ResearchWorkspace.tsx'
import { AdminWorkspace } from '@features/admin/AdminWorkspace.tsx'
import { AnalyticsDashboard } from '@features/analytics/AnalyticsDashboard.tsx'
import { usePatientOnboarding } from '@features/patient/hooks/usePatientOnboarding.ts'
import { useDoctorWorkspace } from '@features/doctor/hooks/useDoctorWorkspace.ts'
import { useAppTitle } from '@shared/hooks/useAppTitle.ts'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import { UserMenu, LoginButton } from '@shared/components/auth/UserMenu.tsx'
import { AuthModal } from '@shared/components/auth/AuthModal.tsx'

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
      {/* 4.1 — Skip-navigation link; .skip-link CSS shows it on :focus */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* 4.5 — Polite live region: announces active workspace to screen readers on change */}
      <Box role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {`${activeWorkspace.label} workspace`}
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* 4.2 — <nav> landmark wraps the sidebar; hidden on mobile (Drawer handles it) */}
          <Grid xs={12} lg={3} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Box component="nav" aria-label="Main navigation">
              <Sidebar activeKey={selectedWorkspace} onSelect={setSelectedWorkspace} statusMessage={patientOnboarding.statusMessage} />
            </Box>
          </Grid>

          {/* 4.2 — <main> landmark; tabIndex={-1} so the skip link can focus it */}
          <Grid sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box component="main" id="main-content" tabIndex={-1} sx={{ outline: 'none' }}>
              <Stack spacing={3}>
                <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
                      <Stack direction="row" alignItems="flex-start" spacing={1}>
                        {/* 5.3 — Hamburger trigger: visible only on mobile (lg+ uses persistent sidebar) */}
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
                          {/* h1 — unique page title; screen readers announce active context on navigation */}
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

                    {/* === WORKSPACE ROUTING === */}
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
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* 5.3 — Mobile nav drawer: replaces persistent sidebar on xs/sm/md */}
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

      {/* 5.9 — Bottom navigation bar: quick access to 5 core workspaces on mobile */}
      <MobileNav activeKey={selectedWorkspace} onSelect={setSelectedWorkspace} />

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </Box>
  )
}

function isWorkspaceKey(value: unknown): value is WorkspaceKey {
  return typeof value === 'string' && workspaceDefinitions.some((workspace) => workspace.key === value)
}
