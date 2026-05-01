import { useState, useEffect } from 'react'
import { apiBaseUrl } from '@shared/config/patient.ts'
import type { Notification, NotificationPreferences } from '@shared/types/notification.ts'

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications
  useEffect(() => {
    if (!userId) return

    const fetchNotifications = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiBaseUrl}/notifications/my-notifications`)
        if (!response.ok) {
          throw new Error('Failed to fetch notifications')
        }
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.notifications?.filter((n: Notification) => n.status !== 'delivered').length || 0)
      } catch (err) {
        console.error('[API Error] Failed to fetch notifications:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          endpoint: `/platform/users/${userId}/notifications`
        })
        setError(err instanceof Error ? err.message : 'Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [userId])

  // Fetch preferences
  useEffect(() => {
    if (!userId) return

    const fetchPreferences = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/notifications/my-preferences`)
        if (!response.ok) {
          throw new Error('Failed to fetch preferences')
        }
        const data = await response.json()
        setPreferences(data.preferences)
      } catch (err) {
        console.error('[API Error] Failed to fetch notification preferences:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          endpoint: `/platform/users/${userId}/notification-preferences`
        })
      }
    }

    fetchPreferences()
  }, [userId])

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/notifications/${notificationId}/read`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to mark as read')
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status: 'delivered' as const } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('[API Error] Failed to mark notification as read:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/notifications/${notificationId}/read`
      })
    }
  }

  // Update preferences
  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    if (!userId) return

    try {
      const response = await fetch(`${apiBaseUrl}/notifications/my-preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences),
      })

      if (!response.ok) {
        throw new Error('Failed to update preferences')
      }

      setPreferences(newPreferences)
    } catch (err) {
      console.error('[API Error] Failed to update notification preferences:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/users/${userId}/notification-preferences`
      })
    }
  }

  return {
    notifications,
    preferences,
    loading,
    error,
    unreadCount,
    markAsRead,
    updatePreferences,
  }
}