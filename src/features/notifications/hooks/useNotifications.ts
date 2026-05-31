import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@shared/api/Client.ts'
import type { Notification, NotificationPreferences } from '@shared/types/notification.ts'

interface NotificationListResponse {
  items: Notification[]
  unreadCount: number
}

interface PreferencesResponse {
  preferences: NotificationPreferences
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<NotificationListResponse>(
        `/platform/notifications/my-notifications?page=${page}&pageSize=${pageSize}`
      )
      setNotifications(res.items || [])
      setUnreadCount(res.unreadCount || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await apiClient.get<NotificationPreferences | PreferencesResponse>('/platform/notifications/my-preferences')
      // Handle both direct preferences and wrapped response
      const prefs = (res as PreferencesResponse).preferences ?? (res as NotificationPreferences)
      setPreferences(prefs)
    } catch {
      // Silently fail - preferences are optional
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiClient.post(`/platform/notifications/${notificationId}/read`, {})
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, status: 'sent' as const } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('[Notification] Failed to mark as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.post('/platform/notifications/read-all', {})
      setNotifications(prev => prev.map(n => ({ ...n, status: 'sent' as const })))
      setUnreadCount(0)
    } catch (err) {
      console.error('[Notification] Failed to mark all as read:', err)
    }
  }, [])

  const updatePreferences = useCallback(async (prefs: NotificationPreferences) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.put<PreferencesResponse>('/platform/notifications/my-preferences', prefs)
      setPreferences(res.preferences || prefs)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications()
    fetchPreferences()
  }, [fetchNotifications, fetchPreferences])

  return {
    notifications,
    preferences,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    updatePreferences,
  }
}