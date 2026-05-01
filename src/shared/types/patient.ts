export type PatientResponse = {
  id: string
  displayName: string
  email: string
  countryCode: string
  preferredLanguage: string
  status: string
  hasMedicalProfile: boolean
  emergencySymptoms: boolean
  consents: Array<{
    consentType: string
    isAccepted: boolean
    legalBasis: string
  }>
  medicalProfile: null | {
    dateOfBirth: string
    sexAtBirth: string
    phoneNumber: string
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
}

export type ApiValidationErrors = Record<string, string[]>

export type RegistrationForm = {
  displayName: string
  email: string
  countryCode: string
  preferredLanguage: string
}

export type OnboardingForm = {
  consentLanguage: string
  termsAccepted: boolean
  privacyAccepted: boolean
  teleconsultationAccepted: boolean
  healthDataProcessingAccepted: boolean
  researchAccepted: boolean
  marketingAccepted: boolean
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
