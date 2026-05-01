export type DoctorSearchItem = {
  id: string
  displayName: string
  primarySpecialty: string
  countryCode: string
  defaultPricePerSecondMinor: number
  currency: string
  verificationStatus: string
  languages: string[]
  nextAvailableAt: string | null
  availabilityWindows: Array<{
    id: string
    startsAt: string
    endsAt: string
    consultationMode: string
  }>
}

export type DoctorDetail = {
  id: string
  displayName: string
  primarySpecialty: string
  countryCode: string
  defaultPricePerSecondMinor: number
  currency: string
  verificationStatus: string
  languages: string[]
  biography: string
  qualifications: string
  availabilityWindows: Array<{
    id: string
    startsAt: string
    endsAt: string
    consultationMode: string
  }>
}

export type BookingResponse = {
  id: string
  patientAccountId: string
  doctorProfileId: string
  doctorDisplayName: string
  specialtyCode: string
  consultationMode: string
  status: string
  scheduledStartsAt: string | null
  scheduledEndsAt: string | null
  pricePerSecondMinor: number
  currency: string
  reservedSeconds: number
}
