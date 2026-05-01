import { apiClient } from './apiClient.ts'
import { API_ENDPOINTS } from '@shared/config/api.ts'
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
  // Authentication
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, data),

  verifyMfa: (data: MfaVerificationRequest) =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.auth.mfaVerify, data),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>(API_ENDPOINTS.auth.register, data),

  logout: () =>
    apiClient.post<void>(API_ENDPOINTS.auth.logout, {}),

  refreshToken: (data: RefreshTokenRequest) =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.auth.refresh, data),

  // Current user
  getCurrentUser: () =>
    apiClient.get<User>(API_ENDPOINTS.auth.me),

  // Password management
  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<void>(API_ENDPOINTS.auth.changePassword, data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<void>(API_ENDPOINTS.auth.forgotPassword, data),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<void>(API_ENDPOINTS.auth.resetPassword, data),

  // Email verification
  verifyEmail: (token: string) =>
    apiClient.post<void>(API_ENDPOINTS.auth.verifyEmail, { token }),

  resendVerification: (email: string) =>
    apiClient.post<void>(API_ENDPOINTS.auth.resendVerification, { email }),

  // Phone verification
  verifyPhone: (code: string) =>
    apiClient.post<void>(API_ENDPOINTS.auth.verifyPhone, { code }),

  // MFA management
  setupMfa: () =>
    apiClient.post<MfaSetupResponse>(API_ENDPOINTS.auth.mfaSetup, {}),

  confirmMfaSetup: (code: string) =>
    apiClient.post<void>(API_ENDPOINTS.auth.mfaConfirm, { code }),

  disableMfa: (password: string) =>
    apiClient.post<void>(API_ENDPOINTS.auth.mfaDisable, { password }),

  generateRecoveryCodes: () =>
    apiClient.post<{ recoveryCodes: string[] }>(API_ENDPOINTS.auth.mfaRecoveryCodes, {}),
}
