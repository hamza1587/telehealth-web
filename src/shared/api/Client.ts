// Lightweight API client used by feature hooks.
// Real-time socket support is deferred until socket.io-client is added as a
// project dependency. All HTTP calls go through standard fetch.

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: 'Patient' | 'Doctor' | 'Admin'
  phoneNumber?: string
  profileImage?: string
}

export class ApiClient {
  private baseURL: string
  private tokens: AuthTokens | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setTokens(tokens: AuthTokens | null) {
    this.tokens = tokens
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (this.tokens?.accessToken) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.tokens.accessToken}`
    }
    return headers
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json() as T
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
)
