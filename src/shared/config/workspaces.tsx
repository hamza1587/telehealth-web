import type { ReactNode } from 'react'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import NoteAltRoundedIcon from '@mui/icons-material/NoteAltRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarToday'
import NotificationsRoundedIcon from '@mui/icons-material/Notifications'
import SettingsRoundedIcon from '@mui/icons-material/Settings'
import LockRoundedIcon from '@mui/icons-material/Lock'
import ScienceRoundedIcon from '@mui/icons-material/Science'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded'
import type { WorkspaceKey } from '@shared/types/workspace.ts'

export type WorkspaceDefinition = {
  key: WorkspaceKey
  label: string
  subtitle: string
  icon: ReactNode
  accent: string
}

export const workspaceDefinitions: WorkspaceDefinition[] = [
  { key: 'overview', label: 'Platform Map', subtitle: 'Dashboard & system overview', icon: <DashboardRoundedIcon />, accent: '#0a3d91' },
  { key: 'patient', label: 'Patient', subtitle: 'Registration and profile', icon: <PersonAddAlt1RoundedIcon />, accent: '#1565c0' },
  { key: 'doctor', label: 'Doctor', subtitle: 'Verification and schedule', icon: <MedicalServicesRoundedIcon />, accent: '#7b1fa2' },
  { key: 'discovery', label: 'Discovery', subtitle: 'Search specialists & book', icon: <SearchRoundedIcon />, accent: '#00695c' },
  { key: 'consultation', label: 'Consultation', subtitle: 'Voice and video care', icon: <VideocamRoundedIcon />, accent: '#00838f' },
  { key: 'appointments', label: 'My Appointments', subtitle: 'Schedule and history', icon: <CalendarTodayRoundedIcon />, accent: '#5c6bc0' },
  { key: 'billing', label: 'Billing', subtitle: 'Wallet and metering', icon: <AccountBalanceWalletRoundedIcon />, accent: '#ef6c00' },
  { key: 'clinical', label: 'Clinical', subtitle: 'Notes and prescriptions', icon: <NoteAltRoundedIcon />, accent: '#2e7d32' },
  { key: 'notifications', label: 'Notifications', subtitle: 'Alerts and preferences', icon: <NotificationsRoundedIcon />, accent: '#e65100' },
  { key: 'operations', label: 'Operations', subtitle: 'Admin and compliance', icon: <ShieldRoundedIcon />, accent: '#5d4037' },
  { key: 'settings', label: 'Settings', subtitle: 'Profile and security', icon: <SettingsRoundedIcon />, accent: '#455a64' },
  { key: 'gdpr', label: 'Data Rights', subtitle: 'GDPR & EHDS compliance', icon: <LockRoundedIcon />, accent: '#37474f' },
  { key: 'research', label: 'Research', subtitle: 'Clinical studies', icon: <ScienceRoundedIcon />, accent: '#6a1b9a' },
  { key: 'analytics', label: 'Analytics', subtitle: 'Platform KPI dashboard', icon: <QueryStatsRoundedIcon />, accent: '#1565c0' },
  { key: 'support', label: 'Support', subtitle: 'Tickets and help centre', icon: <SupportAgentRoundedIcon />, accent: '#00838f' },
]

export const launchTracks = [
  { title: 'Patient side', description: 'Registration, onboarding, consent capture, and medical profile.', readiness: 45, status: 'In design' },
  { title: 'Doctor side', description: 'Onboarding, manual verification, profile, and availability.', readiness: 25, status: 'Wireframe ready' },
  { title: 'Discovery and booking', description: 'Specialist search and scheduled consultations.', readiness: 20, status: 'Conceptual layout' },
  { title: 'Consultation flow', description: 'Voice and video consultation room only.', readiness: 15, status: 'Session shell' },
  { title: 'Billing and payments', description: 'Credit wallet, purchase flow, and per-second billing.', readiness: 20, status: 'Ledger UI' },
  { title: 'Clinical workflow', description: 'Clinical notes and prescription scaffold.', readiness: 18, status: 'Structured capture' },
  { title: 'Operations and compliance', description: 'Admin portal, support, GDPR intake, and audit logging.', readiness: 22, status: 'Ops dashboard' },
  { title: 'Appointments & scheduling', description: 'Full appointment lifecycle — book, reschedule, cancel, history.', readiness: 30, status: 'In build' },
  { title: 'Notifications center', description: 'Multi-channel notification preferences and history.', readiness: 25, status: 'In build' },
  { title: 'Profile & settings', description: 'User profile, security, MFA, and device management.', readiness: 20, status: 'In build' },
  { title: 'GDPR & data rights', description: 'Data export, deletion, and consent management.', readiness: 15, status: 'In build' },
  { title: 'Research studies', description: 'Clinical study discovery, enrollment, and data sharing.', readiness: 10, status: 'In build' },
]