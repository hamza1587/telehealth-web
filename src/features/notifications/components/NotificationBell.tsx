import { useState } from 'react'
import { Badge, IconButton, Menu, MenuItem, Typography, Box } from '@mui/material'
import { NotificationsIcon } from '@mui/icons-material'
import type { Notification } from '@shared/types/notification.ts'

interface NotificationBellProps {
  unreadCount: number
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
}

export function NotificationBell({ unreadCount, notifications, onMarkAsRead }: NotificationBellProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const recentNotifications = notifications.slice(0, 5)

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 350, maxHeight: 500 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        {recentNotifications.length === 0 ? (
          <MenuItem disabled>
            <Typography color="text.secondary">No notifications</Typography>
          </MenuItem>
        ) : (
          recentNotifications.map(notification => (
            <MenuItem
              key={notification.id}
              onClick={() => {
                onMarkAsRead(notification.id)
                handleClose()
              }}
              sx={{
                borderLeft: notification.status !== 'delivered' ? '3px solid' : 'none',
                borderColor: 'primary.main',
              }}
            >
              <Box>
                <Typography variant="subtitle2">{notification.title}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {notification.message}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  )
}