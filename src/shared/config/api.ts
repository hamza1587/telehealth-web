// API configuration

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 30000,
  refreshTokenThreshold: 5 * 60 * 1000, // Refresh 5 minutes before expiry
}

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    changePassword: '/auth/change-password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    verifyPhone: '/auth/verify-phone',
    mfaVerify: '/auth/mfa/verify',
    mfaSetup: '/auth/mfa/setup',
    mfaConfirm: '/auth/mfa/confirm',
    mfaDisable: '/auth/mfa/disable',
    mfaRecoveryCodes: '/auth/mfa/recovery-codes',
  },
  patient: {
    profile: '/patient/profile',
    medicalHistory: '/patient/medical-history',
    consultations: '/patient/consultations',
    prescriptions: '/patient/prescriptions',
    wallet: '/patient/wallet',
  },
  doctor: {
    schedule: '/doctor/schedule',
    patients: '/doctor/patients',
    consultations: '/doctor/consultations',
    earnings: '/doctor/earnings',
    availability: '/doctor/availability',
  },
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    doctors: '/admin/doctors',
    consultations: '/admin/consultations',
    billing: '/admin/billing',
  },
  platform: {
    info: '/platform/info',
  },
  health: {
    live: '/health/live',
    ready: '/health/ready',
  },
} as const

export function getAuthHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}
