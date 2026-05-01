import type { ReactNode } from 'react'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import NoteAltRoundedIcon from '@mui/icons-material/NoteAltRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import type { WorkspaceKey } from '@shared/types/workspace.ts'

export type WorkspaceDefinition = {
  key: WorkspaceKey
  label: string
  subtitle: string
  icon: ReactNode
  accent: string
}

export const workspaceDefinitions: WorkspaceDefinition[] = [
  { key: 'overview', label: 'Platform Map', subtitle: 'All Phase 1 modules', icon: <DashboardRoundedIcon />, accent: '#0a3d91' },
  { key: 'patient', label: 'Patient', subtitle: 'Registration and profile', icon: <PersonAddAlt1RoundedIcon />, accent: '#1565c0' },
  { key: 'doctor', label: 'Doctor', subtitle: 'Verification and schedule', icon: <MedicalServicesRoundedIcon />, accent: '#7b1fa2' },
  { key: 'discovery', label: 'Discovery', subtitle: 'Search and booking', icon: <SearchRoundedIcon />, accent: '#00695c' },
  { key: 'consultation', label: 'Consultation', subtitle: 'Voice and video care', icon: <VideocamRoundedIcon />, accent: '#00838f' },
  { key: 'billing', label: 'Billing', subtitle: 'Wallet and metering', icon: <AccountBalanceWalletRoundedIcon />, accent: '#ef6c00' },
  { key: 'clinical', label: 'Clinical', subtitle: 'Notes and prescriptions', icon: <NoteAltRoundedIcon />, accent: '#2e7d32' },
  { key: 'operations', label: 'Operations', subtitle: 'Admin and compliance', icon: <ShieldRoundedIcon />, accent: '#5d4037' },
]

export const launchTracks = [
  { title: 'Patient side', description: 'Registration, onboarding, consent capture, and medical profile.', readiness: 45, status: 'In design' },
  { title: 'Doctor side', description: 'Onboarding, manual verification, profile, and availability.', readiness: 25, status: 'Wireframe ready' },
  { title: 'Discovery and booking', description: 'Specialist search and scheduled consultations.', readiness: 20, status: 'Conceptual layout' },
  { title: 'Consultation flow', description: 'Voice and video consultation room only.', readiness: 15, status: 'Session shell' },
  { title: 'Billing and payments', description: 'Credit wallet, purchase flow, and per-second billing.', readiness: 20, status: 'Ledger UI' },
  { title: 'Clinical workflow', description: 'Clinical notes and prescription scaffold.', readiness: 18, status: 'Structured capture' },
  { title: 'Operations and compliance', description: 'Admin portal, support, GDPR intake, and audit logging.', readiness: 22, status: 'Ops dashboard' },
]
