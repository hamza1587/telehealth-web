// Patient onboarding and profile types

export interface MedicalProfile {
  id: string
  patientAccountId: string
  dateOfBirth: string
  sexAtBirth: string
  phoneNumber: string
  countryCode: string
  city: string
  timeZone: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  chiefConcern: string
  symptoms: string
  symptomDuration: string
  currentMedications: string
  allergies: string
  knownConditions: string
  pastSurgeries: string
  pregnancyStatus: string
  lifestyleFactors: string
  preferredConsultationLanguage: string
  urgencyLevel: string
  emergencySymptoms: boolean
  medicalDisclaimerAccepted: boolean
  createdAt: string
  updatedAt: string
}

export interface ConsentRecord {
  id: string
  patientAccountId: string
  consentType: string
  version: string
  textSnapshot: string
  textHash: string
  language: string
  legalBasis: string
  isAccepted: boolean
  ipAddress?: string
  userAgent?: string
  capturedAt: string
  withdrawnAt?: string
}

export interface CreateMedicalProfileRequest {
  dateOfBirth: string
  sexAtBirth: string
  phoneNumber: string
  countryCode: string
  city: string
  timeZone: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  chiefConcern: string
  symptoms: string
  symptomDuration: string
  currentMedications: string
  allergies: string
  knownConditions: string
  pastSurgeries: string
  pregnancyStatus: string
  lifestyleFactors: string
  preferredConsultationLanguage: string
  urgencyLevel: string
  emergencySymptoms: boolean
  medicalDisclaimerAccepted: boolean
}

export interface RecordConsentRequest {
  consentType: string
  version: string
  textSnapshot: string
  textHash: string
  language: string
  legalBasis: string
  isAccepted: boolean
  ipAddress?: string
  userAgent?: string
}

export const ConsentType = {
  TermsOfService: 'TermsOfService',
  PrivacyPolicy: 'PrivacyPolicy',
  Teleconsultation: 'Teleconsultation',
  HealthDataProcessing: 'HealthDataProcessing',
  Research: 'Research',
  Marketing: 'Marketing',
} as const

export type ConsentTypeValue = typeof ConsentType[keyof typeof ConsentType]
