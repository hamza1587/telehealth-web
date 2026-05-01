import { useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext.tsx'
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
  Chip,
} from '@mui/material'
import {
  AccountCircle,
  Logout,
  Settings,
  Person,
  LocalHospital,
  AdminPanelSettings,
  SupportAgent,
  Gavel,
  AccountBalance,
} from '@mui/icons-material'
import type { UserType } from '@shared/types/auth.ts'

const userTypeIcons: Record<UserType, typeof Person> = {
  Patient: Person,
  Doctor: LocalHospital,
  Admin: AdminPanelSettings,
  SupportAgent: SupportAgent,
  ComplianceOfficer: Gavel,
  FinanceOperator: AccountBalance,
  ResearchReviewer: Person,
}

const userTypeLabels: Record<UserType, string> = {
  Patient: 'Patient',
  Doctor: 'Doctor',
  Admin: 'Administrator',
  SupportAgent: 'Support Agent',
  ComplianceOfficer: 'Compliance Officer',
  FinanceOperator: 'Finance',
  ResearchReviewer: 'Research Reviewer',
}

interface UserMenuProps {
  onOpenProfile?: () => void
  onOpenSettings?: () => void
}

export function UserMenu({ onOpenProfile, onOpenSettings }: UserMenuProps) {
  const { user, logout, isLoading } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  if (!user) {
    return null
  }

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleClose()
    await logout()
  }

  const Icon = userTypeIcons[user.userType]
  const displayName = user.displayName || user.email.split('@')[0]
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return (
    <Box>
      <Button
        onClick={handleOpen}
        startIcon={
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {initials}
          </Avatar>
        }
        endIcon={<Icon />}
        sx={{ textTransform: 'none', color: 'inherit' }}
      >
        <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {displayName}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: { minWidth: 250, mt: 1 }
          }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip
              icon={<Icon fontSize="small" />}
              label={userTypeLabels[user.userType]}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        <Divider />

        <MenuItem onClick={() => { handleClose(); onOpenProfile?.() }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>

        <MenuItem onClick={() => { handleClose(); onOpenSettings?.() }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} disabled={isLoading}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          {isLoading ? 'Logging out...' : 'Logout'}
        </MenuItem>
      </Menu>
    </Box>
  )
}

// Component to show when user is not authenticated
interface LoginButtonProps {
  onClick: () => void
}

export function LoginButton({ onClick }: LoginButtonProps) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      startIcon={<AccountCircle />}
    >
      Sign In
    </Button>
  )
}
