import type { DoctorAvailabilityForm, DoctorForm, DoctorVerificationForm } from '@features/doctor/types.ts'

export const initialDoctorForm: DoctorForm = {
  displayName: '',
  legalName: '',
  email: '',
  phoneNumber: '',
  countryCode: 'DE',
  countryOfPractice: 'DE',
  primarySpecialty: 'Cardiology',
  qualifications: '',
  yearsOfExperience: '5',
  biography: '',
  licenseNumber: '',
  licensingAuthority: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  licenseExpiryDate: '',
  defaultPricePerSecondMinor: '2',
  currency: 'EUR',
  languagesText: 'en,de',
}

export const initialDoctorAvailabilityForm: DoctorAvailabilityForm = {
  startsAt: '',
  endsAt: '',
  consultationMode: 'Video',
  isInstantEnabled: false,
}

export const initialDoctorVerificationForm: DoctorVerificationForm = {
  verificationStatus: 'Submitted',
  reviewerId: 'compliance-admin',
  reviewNotes: '',
}

export const doctorVerificationOptions = [
  { value: 'Submitted', label: 'Submitted' },
  { value: 'InReview', label: 'In review' },
  { value: 'MoreInformationRequired', label: 'More information required' },
  { value: 'Verified', label: 'Verified' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Suspended', label: 'Suspended' },
]

export const doctorConsultationModeOptions = [
  { value: 'Video', label: 'Video' },
  { value: 'Voice', label: 'Voice' },
]
