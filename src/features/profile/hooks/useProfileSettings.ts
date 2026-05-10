import { useState, useCallback } from 'react'
import { apiClient } from '@shared/api/Client.ts'
import type { User, AuthState, MfaSetupResponse, AuthTokens } from '@shared/types/auth.ts'
import type { ProfileForm, SecuritySettingsForm, MfaSettingsForm } from '@shared/types/index.ts'

export function useProfileSettings() {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get('/platform/auth/me')
      setProfile(res)
      return res
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (form: ProfileForm) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.put('/platform/auth/me/update', form)
      const updated = await fetchProfile()
      return { success: true, user: updated }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [fetchProfile])

  const changePassword = useCallback(async (form: SecuritySettingsForm) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.put('/platform/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [])

  const setupMfa = useCallback(async (): Promise<MfaSetupResponse | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.post('/platform/auth/mfa/setup', {})
      return res
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup MFA')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmMfa = useCallback(async (form: MfaSettingsForm) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.post('/platform/auth/mfa/confirm', { code: form.code })
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm MFA')
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [])

  const disableMfa = useCallback(async (password: string) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.post('/platform/auth/mfa/disable', { password })
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable MFA')
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [])

  const manageDevice = useCallback(async (deviceId: string, action: 'trust' | 'block' | 'remove') => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.post(`/platform/devices/${deviceId}/${action}`, {})
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} device`)
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
    setupMfa,
    confirmMfa,
    disableMfa,
    manageDevice,
  }
}