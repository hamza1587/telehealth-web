import { apiClient } from '@shared/api/apiClient'
import type {
  LoginRequest,
  LoginResponse,
  MfaVerificationRequest,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  User,
  MfaSetupResponse,
} from '@shared/types/auth.ts'

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/platform/auth/login', data),

  verifyMfa: (data: MfaVerificationRequest) =>
    apiClient.post<LoginResponse>('/platform/auth/mfa/verify', data),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>('/platform/auth/register', data),

  logout: () =>
    apiClient.post<void>('/platform/auth/logout', {}),

  refreshToken: (data: RefreshTokenRequest) =>
    apiClient.post<LoginResponse>('/platform/auth/refresh-token', data),

  getCurrentUser: () =>
    apiClient.get<User>('/platform/auth/me'),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<void>('/platform/auth/change-password', data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<void>('/platform/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<void>('/platform/auth/reset-password', data),

  verifyEmail: (token: string) =>
    apiClient.post<void>('/platform/auth/verify-email', { token }),

  resendVerification: (email: string) =>
    apiClient.post<void>('/platform/auth/resend-verification', { email }),

  verifyPhone: (code: string) =>
    apiClient.post<void>('/platform/auth/verify-phone', { code }),

  setupMfa: () =>
    apiClient.post<MfaSetupResponse>('/platform/auth/mfa/setup', {}),

  confirmMfaSetup: (code: string) =>
    apiClient.post<void>('/platform/auth/mfa/confirm', { code }),

  disableMfa: (password: string) =>
    apiClient.post<void>('/platform/auth/mfa/disable', { password }),

  generateRecoveryCodes: () =>
    apiClient.post<{ recoveryCodes: string[] }>('/platform/auth/mfa/recovery-codes', {}),
}