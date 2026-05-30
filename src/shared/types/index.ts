export { AppointmentStatus } from './appointment.ts'
export type { AppointmentDetail } from './appointment.ts'
export type AppointmentDetail = {
  id: string
  patientId: string
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  doctorAvatar?: string
  scheduledStart: string
  scheduledEnd: string
  status: AppointmentStatus
  pricePerSecond: number
  currency: string
  creditsReserved: number
  creditsUsed: number
  meetingUrl?: string
  notes?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

export type DoctorDetail = {
  id: string
  displayName: string
  primarySpecialty: string
  countryCode: string
  pricePerSecondMinor: number
  currency: string
  verificationStatus: 'Draft' | 'Pending' | 'Verified' | 'Rejected'
  marketplaceStatus: 'Available' | 'Hidden' | 'Suspended'
  education: string[]
  languages: string[]
  about: string
  avatar?: string
  availability: {
    dayOfWeek: number
    startTime: string
    endTime: string
    isAvailable: boolean
  }[]
  rating: number
  totalReviews: number
  totalConsultations: number
  createdAt: string
  updatedAt: string
}

export type NotificationPreferencesForm = {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
  types: Record<string, boolean>
}

export type ProfileForm = {
  displayName: string
  email: string
  phoneNumber: string
  countryCode: string
  preferredLanguage: string
  city: string
  timeZone: string
}

export type SecuritySettingsForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type MfaSettingsForm = {
  enabled: boolean
  code: string
}

export type GDPRRequestForm = {
  type: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection'
  description: string
  dataCategories: string[]
}

export type ResearchStudy = {
  id: string
  title: string
  description: string
  organization: string
  status: 'recruiting' | 'active' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  eligibilityCriteria: string
  compensation: string | null
  dataTypes: string[]
  consentFormUrl: string
  isEnrolled: boolean
}

export type ResearchEnrollmentForm = {
  studyId: string
  consentGiven: boolean
  dataSharingPreferences: string[]
  demographicData: {
    ageRange: string
    gender: string
    countryCode: string
    conditions: string[]
  }
}