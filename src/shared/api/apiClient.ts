import { API_CONFIG } from '@shared/config/api.ts'
import type { AuthTokens, RefreshTokenRequest, LoginResponse, ApiError } from '@shared/types/auth.ts'
import type { RetryConfig } from './errors'
import { classifyError, shouldRetry, withExponentialBackoff, getUserFriendlyMessage } from './errors'

const DEFAULT_RETRY: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryOn: ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE'],
}

class ApiClient {
  private baseUrl: string
  private timeout: number
  private tokens: AuthTokens | null = null
  private refreshPromise: Promise<string | null> | null = null
  private retryConfig: RetryConfig

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl
    this.timeout = API_CONFIG.timeout
    this.retryConfig = DEFAULT_RETRY
  }

  setTokens(tokens: AuthTokens | null) {
    this.tokens = tokens
  }

  setRetryConfig(config: Partial<RetryConfig>) {
    this.retryConfig = { ...this.retryConfig, ...config }
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 0
  ): Promise<T> {
    try {
      return await this.request<T>(endpoint, options)
    } catch (error) {
      const appError = classifyError(error, endpoint)

      if (shouldRetry(appError, attempt, this.retryConfig.maxAttempts)) {
        const delay = withExponentialBackoff(
          attempt,
          this.retryConfig.baseDelayMs,
          this.retryConfig.maxDelayMs
        )
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.requestWithRetry<T>(endpoint, options, attempt + 1)
      }

      const friendlyMessage = getUserFriendlyMessage(appError)
      const err = new Error(friendlyMessage)
        ; (err as unknown as Record<string, unknown>).code = appError.code
        ; (err as unknown as Record<string, unknown>).statusCode = appError.statusCode
        ; (err as unknown as Record<string, unknown>).details = appError.details
        ; (err as unknown as Record<string, unknown>).endpoint = appError.endpoint
      throw err
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string> | undefined) || {}),
    }

    if (this.tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${this.tokens.accessToken}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.status === 401 && this.tokens?.refreshToken) {
        const newToken = await this.refreshAccessToken()
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          })
          return this.handleResponse<T>(retryResponse)
        }
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out')
        }
        throw error
      }
      throw new Error('Network error')
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error', errorCode: undefined }))
      const message = errorData.error || `HTTP ${response.status}`
      const err = new ApiRequestError(message, response.status, errorData.errorCode)
        ; (err as unknown as Record<string, unknown>).details = errorData.errorCode ? { errorCode: [errorData.errorCode] } : undefined
      throw err
    }

    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise
    this.refreshPromise = this.performRefresh()
    try {
      return await this.refreshPromise
    } finally {
      this.refreshPromise = null
    }
  }

  private async performRefresh(): Promise<string | null> {
    if (!this.tokens?.refreshToken) return null
    try {
      const refreshPath = '/platform/auth/refresh-token'
      const deviceId = localStorage.getItem('deviceId')
      const response = await fetch(`${this.baseUrl}${refreshPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: this.tokens.refreshToken,
          deviceId,
        } as RefreshTokenRequest),
      })

      if (!response.ok) throw new Error('Refresh failed')
      const data: LoginResponse = await response.json()

      const newTokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      }

      this.tokens = newTokens
      localStorage.setItem('authTokens', JSON.stringify(newTokens))
      window.dispatchEvent(new CustomEvent('auth:tokensRefreshed', { detail: newTokens }))
      return data.accessToken
    } catch (err) {
      console.error('[API Error] Token refresh failed:', err)
      this.clearTokens()
      window.dispatchEvent(new CustomEvent('auth:sessionExpired'))
      return null
    }
  }

  private clearTokens() {
    this.tokens = null
    localStorage.removeItem('authTokens')
    localStorage.removeItem('deviceId')
  }

  get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.requestWithRetry<T>(endpoint, { method: 'GET', headers })
  }

  post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    })
  }

  put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    })
  }

  patch<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.requestWithRetry<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers,
    })
  }

  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.requestWithRetry<T>(endpoint, { method: 'DELETE', headers })
  }
}

export class ApiRequestError extends Error {
  statusCode: number
  errorCode?: string

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.statusCode = statusCode
    this.errorCode = errorCode
  }
}

export const apiClient = new ApiClient()