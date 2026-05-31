import {
  Badge, IconButton, Popover, Typography, ListItem,
  ListItemText, Box, Chip, Stack, Avatar,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { useState, useEffect, useRef } from 'react'
import type { Notification } from '@shared/types/notification.ts'
import { useNotifications } from '../hooks/useNotifications.ts'

interface NotificationBellProps {
  onOpen?: () => void
}

export function NotificationBell({ onOpen }: NotificationBellProps) {
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [localUnread, setLocalUnread] = useState(unreadCount)
  const prevUnreadRef = useRef(unreadCount)

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setLocalUnread(unreadCount)
    }
    prevUnreadRef.current = unreadCount
  }, [unreadCount])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    fetchNotifications()
    if (onOpen) onOpen()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMarkRead = (notificationId: string) => {
    markAsRead(notificationId)
    setLocalUnread(prev => Math.max(0, prev - 1))
  }

  const open = Boolean(anchorEl)
  const id = open ? 'notification-popover' : undefined

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{ position: 'relative' }}
        size="large"
      >
        <NotificationsIcon />
        {localUnread > 0 && (
          <Badge
            badgeContent={localUnread > 99 ? '99+' : localUnread}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: 11,
                height: 18,
                minWidth: 18,
              },
            }}
          />
        )}
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 480,
            mt: 1,
            borderRadius: 3,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Notifications</Typography>
            {localUnread > 0 && (
              <Chip
                label={`${localUnread} new`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        <Box sx={{ maxHeight: 380, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification: Notification) => (
              <ListItem
                key={notification.id}
                divider
                sx={{
                  px: 2,
                  py: 1.5,
                  cursor: 'pointer',
                  bgcolor: notification.status !== 'read' ? 'action.hover' : 'transparent',
                }}
                onClick={() => handleMarkRead(notification.id)}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: notification.status !== 'read'
                      ? 'primary.light'
                      : 'action.disabledBackground',
                    mr: 1.5,
                  }}
                >
                  <CheckIcon fontSize="small" />
                </Avatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={notification.status !== 'read' ? 700 : 400}
                      noWrap
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" noWrap>
                      {notification.message.length > 60
                        ? notification.message.substring(0, 60) + '...'
                        : notification.message}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </Box>

        {notifications.length > 0 && (
          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography
              variant="body2"
              color="primary"
              align="center"
              sx={{ cursor: 'pointer', py: 0.5 }}
              onClick={() => {
                handleClose()
                if (onOpen) onOpen()
              }}
            >
              View all notifications
            </Typography>
          </Box>
        )}
      </Popover>
    </>
  )
}