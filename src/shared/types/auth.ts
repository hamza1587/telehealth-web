// Authentication types matching the .NET API contract

export type UserType = 'Patient' | 'Doctor' | 'Admin' | 'SupportAgent' | 'ComplianceOfficer' | 'FinanceOperator' | 'ResearchReviewer'

export interface User {
  userId: string
  email: string
  displayName?: string
  userType: UserType
  roles: string[]
  twoFactorEnabled: boolean
  emailConfirmed: boolean
  phoneConfirmed: boolean
  countryCode?: string
  preferredLanguage?: string
  lastLoginAt?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface LoginRequest {
  email: string
  password: string
  deviceId?: string
  deviceName?: string
}

export interface LoginResponse {
  userId: string
  email: string
  userType: UserType
  roles: string[]
  accessToken: string
  refreshToken: string
  expiresAt: string
  emailConfirmed: boolean
  phoneConfirmed: boolean
  mfaRequired?: boolean
  mfaToken?: string
}

export interface MfaVerificationRequest {
  mfaToken: string
  code: string
  deviceId?: string
  deviceName?: string
}

export interface RegisterRequest {
  email: string
  password: string
  userType: UserType
  firstName?: string
  lastName?: string
  phoneNumber?: string
  countryCode?: string
  preferredLanguage?: string
}

export interface RegisterResponse {
  userId: string
  email: string
  userType: UserType
  roles: string[]
  emailConfirmed: boolean
  message: string
}

export interface RefreshTokenRequest {
  refreshToken: string
  deviceId?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ApiError {
  error: string
  errorCode?: string
}

export interface MfaSetupResponse {
  secretKey: string
  qrCodeUri: string
  backupCodes: string[]
  message: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
