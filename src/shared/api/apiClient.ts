import { API_CONFIG, API_ENDPOINTS } from '@shared/config/api.ts'
import type { AuthTokens, RefreshTokenRequest, LoginResponse, ApiError } from '@shared/types/auth.ts'

class ApiClient {
  private baseUrl: string
  private timeout: number
  private tokens: AuthTokens | null = null
  private refreshPromise: Promise<string | null> | null = null

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl
    this.timeout = API_CONFIG.timeout
  }

  setTokens(tokens: AuthTokens | null) {
    this.tokens = tokens
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    // Add auth header if we have a token
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

      // Handle 401 - try to refresh token
      if (response.status === 401 && this.tokens?.refreshToken) {
        const newToken = await this.refreshAccessToken()
        if (newToken) {
          // Retry the request with new token
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
          throw new Error('Request timeout')
        }
        throw error
      }
      throw new Error('Network error')
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new ApiRequestError(errorData.error, response.status, errorData.errorCode)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    return response.json()
  }

  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple concurrent refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.refreshPromise = null
    }
  }

  private async performRefresh(): Promise<string | null> {
    if (!this.tokens?.refreshToken) {
      return null
    }

    try {
      const deviceId = localStorage.getItem('deviceId')
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.auth.refresh}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: this.tokens.refreshToken,
          deviceId,
        } as RefreshTokenRequest),
      })

      if (!response.ok) {
        throw new Error('Refresh failed')
      }

      const data: LoginResponse = await response.json()

      // Update stored tokens
      const newTokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      }

      this.tokens = newTokens
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens))

      // Dispatch event to notify auth context
      window.dispatchEvent(new CustomEvent('auth:tokensRefreshed', { detail: newTokens }))

      return data.accessToken
    } catch (err) {
      console.error('[API Error] Token refresh failed:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString()
      })
      // Refresh failed - clear tokens
      this.clearTokens()
      window.dispatchEvent(new CustomEvent('auth:sessionExpired'))
      return null
    }
  }

  private clearTokens() {
    this.tokens = null
    localStorage.removeItem('auth_tokens')
    localStorage.removeItem('deviceId')
  }

  // HTTP methods
  get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers })
  }

  post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    })
  }

  put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    })
  }

  patch<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers,
    })
  }

  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers })
  }
}

export class ApiRequestError extends Error {
  statusCode: number
  errorCode?: string

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.statusCode = statusCode
    this.errorCode = errorCode
  }
}

export const apiClient = new ApiClient()