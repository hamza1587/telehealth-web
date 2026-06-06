import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarToday'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded'
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded'
import SettingsRoundedIcon from '@mui/icons-material/Settings'
import type { WorkspaceKey } from '@shared/types/workspace.ts'

interface MobileNavProps {
  activeKey: WorkspaceKey
  onSelect: (key: WorkspaceKey) => void
}

const NAV_ITEMS: Array<{ key: WorkspaceKey; label: string; icon: React.ReactNode }> = [
  { key: 'overview', label: 'Dashboard', icon: <DashboardRoundedIcon /> },
  { key: 'appointments', label: 'Appointments', icon: <CalendarTodayRoundedIcon /> },
  { key: 'consultation', label: 'Consult', icon: <VideocamRoundedIcon /> },
  { key: 'billing', label: 'Billing', icon: <AccountBalanceWalletRoundedIcon /> },
  { key: 'settings', label: 'Settings', icon: <SettingsRoundedIcon /> },
]

export function MobileNav({ activeKey, onSelect }: MobileNavProps) {
  const activeIndex = NAV_ITEMS.findIndex(item => item.key === activeKey)

  return (
    <Paper
      elevation={3}
      component="nav"
      aria-label="Quick navigation"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        display: { xs: 'block', lg: 'none' },
        borderTop: '1px solid',
        borderColor: 'divider',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        value={activeIndex === -1 ? false : activeIndex}
        onChange={(_, newIndex: number) => onSelect(NAV_ITEMS[newIndex].key)}
      >
        {NAV_ITEMS.map(item => (
          <BottomNavigationAction
            key={item.key}
            label={item.label}
            icon={item.icon}
            aria-label={item.label}
          />
        ))}
      </BottomNavigation>
    </Paper>
  )
}
