import type { OnboardingForm, RegistrationForm } from '@shared/types/patient.ts'

function getPlatformApiUrl(): string {
  const url = import.meta.env.VITE_PLATFORM_API_URL
  if (!url) {
    if (import.meta.env.PROD) {
      throw new Error('VITE_PLATFORM_API_URL is required in production')
    }
    console.warn('[Config] VITE_PLATFORM_API_URL not set — falling back to http://localhost:5131')
    return 'http://localhost:5131'
  }
  return url
}

export const apiBaseUrl = getPlatformApiUrl()
export const consentVersion = '2026.05'
export const patientSteps = ['Register account', 'Capture consents', 'Save medical profile']

export const initialRegistrationForm: RegistrationForm = {
  displayName: '',
  email: '',
  countryCode: 'DE',
  preferredLanguage: 'en',
}

export const initialOnboardingForm: OnboardingForm = {
  consentLanguage: 'en',
  termsAccepted: false,
  privacyAccepted: false,
  teleconsultationAccepted: false,
  healthDataProcessingAccepted: false,
  researchAccepted: false,
  marketingAccepted: false,
  dateOfBirth: '',
  sexAtBirth: 'female',
  phoneNumber: '',
  countryCode: 'DE',
  city: '',
  timeZone: 'Europe/Berlin',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  chiefConcern: '',
  symptoms: '',
  symptomDuration: '',
  currentMedications: '',
  allergies: '',
  knownConditions: '',
  pastSurgeries: '',
  pregnancyStatus: 'not_applicable',
  lifestyleFactors: '',
  preferredConsultationLanguage: 'en',
  urgencyLevel: 'routine',
  emergencySymptoms: false,
  medicalDisclaimerAccepted: false,
}

export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
]

export const sexOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export const urgencyOptions = [
  { value: 'routine', label: 'Routine' },
  { value: 'soon', label: 'Soon' },
  { value: 'urgent', label: 'Urgent' },
]

export const pregnancyOptions = [
  { value: 'not_applicable', label: 'Not applicable' },
  { value: 'not_pregnant', label: 'Not pregnant' },
  { value: 'pregnant', label: 'Pregnant' },
  { value: 'unsure', label: 'Unsure' },
]
