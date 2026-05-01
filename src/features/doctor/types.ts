export type DoctorResponse = {
  id: string
  displayName: string
  countryCode: string
  primarySpecialty: string
  defaultPricePerSecondMinor: number
  currency: string
  verificationStatus: string
  marketplaceStatus: string
  languages: string[]
  onboarding: {
    legalName: string
    email: string
    phoneNumber: string
    countryOfPractice: string
    licenseNumber: string
    licensingAuthority: string
    qualifications: string
    yearsOfExperience: number
    biography: string
    insuranceProvider: string
    insurancePolicyNumber: string
    licenseExpiryDate: string | null
    reviewerId: string | null
    reviewNotes: string | null
  }
  availabilityWindows: Array<{
    id: string
    startsAt: string
    endsAt: string
    consultationMode: string
    isInstantEnabled: boolean
  }>
}

export type DoctorForm = {
  displayName: string
  legalName: string
  email: string
  phoneNumber: string
  countryCode: string
  countryOfPractice: string
  primarySpecialty: string
  qualifications: string
  yearsOfExperience: string
  biography: string
  licenseNumber: string
  licensingAuthority: string
  insuranceProvider: string
  insurancePolicyNumber: string
  licenseExpiryDate: string
  defaultPricePerSecondMinor: string
  currency: string
  languagesText: string
}

export type DoctorAvailabilityForm = {
  startsAt: string
  endsAt: string
  consultationMode: string
  isInstantEnabled: boolean
}

export type DoctorVerificationForm = {
  verificationStatus: string
  reviewerId: string
  reviewNotes: string
}
