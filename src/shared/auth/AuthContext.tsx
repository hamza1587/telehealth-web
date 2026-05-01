import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiClient } from '@shared/api/apiClient.ts'
import { authApi } from '@shared/api/authApi.ts'
import type {
  User,
  AuthTokens,
  AuthState,
  LoginRequest,
  RegisterRequest,
  MfaVerificationRequest,
  ChangePasswordRequest,
} from '@shared/types/auth.ts'

interface AuthContextValue extends AuthState {
  // Authentication
  login: (credentials: LoginRequest) => Promise<{ success: boolean; mfaRequired?: boolean; error?: string }>
  verifyMfa: (data: MfaVerificationRequest) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>

  // Password
  changePassword: (data: ChangePasswordRequest) => Promise<{ success: boolean; error?: string }>

  // User management
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Generate a stable device ID
function getOrCreateDeviceId(): string {
  const stored = localStorage.getItem('deviceId')
  if (stored) return stored

  const newId = `web-${crypto.randomUUID()}`
  localStorage.setItem('deviceId', newId)
  return newId
}

function getDeviceName(): string {
  const userAgent = navigator.userAgent
  const platform = navigator.platform

  if (userAgent.includes('Chrome')) return `Chrome on ${platform}`
  if (userAgent.includes('Firefox')) return `Firefox on ${platform}`
  if (userAgent.includes('Safari')) return `Safari on ${platform}`
  if (userAgent.includes('Edge')) return `Edge on ${platform}`
  return `Browser on ${platform}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens')

        if (storedTokens) {
          const tokens: AuthTokens = JSON.parse(storedTokens)

          // Check if token is expired
          const expiresAt = new Date(tokens.expiresAt).getTime()
          const now = Date.now()

          if (expiresAt > now) {
            // Token still valid, set it and fetch user
            apiClient.setTokens(tokens)

            try {
              const user = await authApi.getCurrentUser()
              setState({
                user,
                tokens,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
            } catch (err) {
              console.error('[Auth Error] Failed to get user during init:', {
                error: err instanceof Error ? err.message : String(err),
                timestamp: new Date().toISOString()
              })
              // Failed to get user, clear tokens
              localStorage.removeItem('auth_tokens')
              apiClient.setTokens(null)
              setState({
                user: null,
                tokens: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              })
            }
          } else {
            // Token expired, try to refresh
            const deviceId = localStorage.getItem('deviceId')
            try {
              const response = await authApi.refreshToken({
                refreshToken: tokens.refreshToken,
                deviceId: deviceId || undefined,
              })

              const newTokens: AuthTokens = {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresAt: response.expiresAt,
              }

              localStorage.setItem('auth_tokens', JSON.stringify(newTokens))
              apiClient.setTokens(newTokens)

              const user = await authApi.getCurrentUser()

              setState({
                user,
                tokens: newTokens,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
            } catch (err) {
              console.error('[Auth Error] Token refresh failed:', {
                error: err instanceof Error ? err.message : String(err),
                timestamp: new Date().toISOString()
              })
              // Refresh failed
              localStorage.removeItem('auth_tokens')
              apiClient.setTokens(null)
              setState({
                user: null,
                tokens: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              })
            }
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (err) {
        console.error('[Auth Error] Auth initialization failed:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString()
        })
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initAuth()
  }, [])

  // Listen for token refresh events from apiClient
  useEffect(() => {
    const handleTokensRefreshed = (event: CustomEvent<AuthTokens>) => {
      setState(prev => ({
        ...prev,
        tokens: event.detail,
      }))
    }

    const handleSessionExpired = () => {
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired. Please login again.',
      })
    }

    window.addEventListener('auth:tokensRefreshed', handleTokensRefreshed as EventListener)
    window.addEventListener('auth:sessionExpired', handleSessionExpired)

    return () => {
      window.removeEventListener('auth:tokensRefreshed', handleTokensRefreshed as EventListener)
      window.removeEventListener('auth:sessionExpired', handleSessionExpired)
    }
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const deviceId = getOrCreateDeviceId()
      const deviceName = getDeviceName()

      const response = await authApi.login({
        ...credentials,
        deviceId,
        deviceName,
      })

      // Check if MFA is required
      if (response.mfaRequired && response.mfaToken) {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }))
        return { success: true, mfaRequired: true }
      }

      // Login successful
      const tokens: AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt,
      }

      localStorage.setItem('auth_tokens', JSON.stringify(tokens))
      apiClient.setTokens(tokens)

      const user: User = {
        userId: response.userId,
        email: response.email,
        userType: response.userType,
        roles: response.roles,
        twoFactorEnabled: false,
        emailConfirmed: response.emailConfirmed,
        phoneConfirmed: response.phoneConfirmed,
      }

      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      return { success: false, error: message }
    }
  }, [])

  const verifyMfa = useCallback(async (data: MfaVerificationRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const deviceId = getOrCreateDeviceId()
      const deviceName = getDeviceName()

      const response = await authApi.verifyMfa({
        ...data,
        deviceId,
        deviceName,
      })

      const tokens: AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt,
      }

      localStorage.setItem('auth_tokens', JSON.stringify(tokens))
      apiClient.setTokens(tokens)

      const user: User = {
        userId: response.userId,
        email: response.email,
        userType: response.userType,
        roles: response.roles,
        twoFactorEnabled: false,
        emailConfirmed: response.emailConfirmed,
        phoneConfirmed: response.phoneConfirmed,
      }

      setState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'MFA verification failed'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      return { success: false, error: message }
    }
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      await authApi.register(data)

      setState(prev => ({
        ...prev,
        isLoading: false,
      }))

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      return { success: false, error: message }
    }
  }, [])

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      await authApi.logout()
    } catch (err) {
      console.error('[Auth Error] Logout failed:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString()
      })
      // Continue with logout cleanup even if API fails
      setState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  }, [])

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      await authApi.changePassword(data)

      setState(prev => ({
        ...prev,
        isLoading: false,
      }))

      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password change failed'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      return { success: false, error: message }
    }
  }, [])

  const refreshUser = useCallback(async () => {
    if (!state.tokens) return

    try {
      const user = await authApi.getCurrentUser()
      setState(prev => ({ ...prev, user }))
    } catch {
      // Failed to refresh user, but don't logout
    }
  }, [state.tokens])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const value: AuthContextValue = {
    ...state,
    login,
    verifyMfa,
    register,
    logout,
    changePassword,
    refreshUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for checking if user has specific role
export function useHasRole(role: string): boolean {
  const { user } = useAuth()
  return user?.roles.includes(role) ?? false
}

// Hook for checking if user is specific type
export function useIsUserType(type: string): boolean {
  const { user } = useAuth()
  return user?.userType === type
}