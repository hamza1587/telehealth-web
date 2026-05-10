export type DoctorSearchResult = {
  id: string
  displayName: string
  primarySpecialty: string
  countryCode: string
  pricePerSecondMinor: number
  currency: string
  verificationStatus: string
  rating?: number
  totalReviews?: number
}

export type DoctorAvailabilityWindow = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

export type AppointmentSearchFilters = {
  status?: string
  from?: string
  to?: string
  doctorSpecialty?: string
}

export type PaginationMeta = {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}