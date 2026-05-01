import { useMemo, useState } from 'react'
import { useDebounce, useLocalStorage } from 'react-haiku'
import { apiBaseUrl } from '@shared/config/patient.ts'
import type { BookingResponse, DoctorDetail, DoctorSearchItem } from '@features/discovery/types.ts'

export function useDiscoveryWorkspace() {
  const [storedPatientId, setStoredPatientId] = useLocalStorage<string>('telehealth-discovery-patient-id', '')
  const [searchText, setSearchText] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [language, setLanguage] = useState('')
  const [country, setCountry] = useState('')
  const [consultationMode, setConsultationMode] = useState('Video')
  const [patientId, setPatientIdState] = useState(storedPatientId)
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [selectedAvailabilityWindowId, setSelectedAvailabilityWindowId] = useState('')
  const [doctors, setDoctors] = useState<DoctorSearchItem[]>([])
  const [doctorDetail, setDoctorDetail] = useState<DoctorDetail | null>(null)
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [requestError, setRequestError] = useState('')
  const [pendingAction, setPendingAction] = useState('')
  const debouncedSearch = useDebounce(searchText, 350)

  function setPatientId(value: string) {
    setPatientIdState(value)
    setStoredPatientId(value)
  }

  async function searchDoctors() {
    setPendingAction('search')
    setRequestError('')

    try {
      const query = new URLSearchParams()
      if (debouncedSearch) query.set('q', debouncedSearch)
      if (specialty) query.set('specialty', specialty)
      if (language) query.set('language', language)
      if (country) query.set('country', country)
      if (consultationMode) query.set('consultationMode', consultationMode)

      const response = await fetch(`${apiBaseUrl}/platform/discovery/doctors?${query.toString()}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[API Error] Doctor search failed:', {
          statusCode: response.status,
          error: errorData,
          query: query.toString(),
          timestamp: new Date().toISOString()
        })
        setRequestError('Doctor search failed.')
        return
      }

      const result = await response.json()

      setDoctors(result.doctors)
    } catch (error) {
      console.error('[API Error] Discovery search failed:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
      setRequestError('Discovery API is unavailable right now. Check that the platform API is running locally.')
    } finally {
      setPendingAction('')
    }
  }

  async function loadDoctorDetail(doctorId: string) {
    setPendingAction('detail')
    setRequestError('')

    try {
      const response = await fetch(`${apiBaseUrl}/platform/discovery/doctors/${doctorId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[API Error] Doctor detail failed:', {
          statusCode: response.status,
          doctorId,
          error: errorData,
          timestamp: new Date().toISOString()
        })
        setRequestError('Doctor detail could not be loaded.')
        return
      }

      const result = await response.json()

      setSelectedDoctorId(doctorId)
      setDoctorDetail(result)
      // Fixed: Safe array access with bounds check
      const firstWindowId = result?.availabilityWindows?.length > 0
        ? result.availabilityWindows[0].id
        : ''
      setSelectedAvailabilityWindowId(firstWindowId)
    } catch (error) {
      console.error('[API Error] Doctor detail load failed:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
      setRequestError('Discovery API is unavailable right now. Check that the platform API is running locally.')
    } finally {
      setPendingAction('')
    }
  }

  async function createBooking() {
    if (!patientId || !doctorDetail || !selectedAvailabilityWindowId) {
      setRequestError('Patient ID, doctor, and availability window are required for booking.')
      return
    }

    const selectedWindow = doctorDetail.availabilityWindows.find((window) => window.id === selectedAvailabilityWindowId)
    if (!selectedWindow) {
      setRequestError('Selected availability window is invalid.')
      return
    }

    setPendingAction('booking')
    setRequestError('')

    try {
      const response = await fetch(`${apiBaseUrl}/platform/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientAccountId: patientId,
          doctorProfileId: doctorDetail.id,
          availabilityWindowId: selectedWindow.id,
          scheduledStartsAt: selectedWindow.startsAt,
          scheduledEndsAt: selectedWindow.endsAt,
          consultationMode: selectedWindow.consultationMode,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[API Error] Booking creation failed:', {
          statusCode: response.status,
          error: errorData,
          timestamp: new Date().toISOString()
        })
        setRequestError('Booking creation failed.')
        return
      }

      const result = await response.json()

      setBookings((current) => [result, ...current])
    } catch (error) {
      console.error('[API Error] Booking creation failed:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
      setRequestError('Booking API is unavailable right now. Check that the platform API is running locally.')
    } finally {
      setPendingAction('')
    }
  }

  async function loadPatientBookings() {
    if (!patientId) {
      setBookings([])
      return
    }

    setPendingAction('history')
    setRequestError('')

    try {
      const response = await fetch(`${apiBaseUrl}/platform/bookings/patients/${patientId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('[API Error] Patient bookings load failed:', {
          statusCode: response.status,
          patientId,
          error: errorData,
          timestamp: new Date().toISOString()
        })
        setRequestError('Patient bookings could not be loaded.')
        return
      }

      const result = await response.json()

      setBookings(result.bookings)
    } catch (error) {
      console.error('[API Error] Patient bookings load failed:', {
        error: error instanceof Error ? error.message : String(error),
        patientId,
        timestamp: new Date().toISOString()
      })
      setRequestError('Booking API is unavailable right now. Check that the platform API is running locally.')
    } finally {
      setPendingAction('')
    }
  }

  const selectedWindow = useMemo(
    () => doctorDetail?.availabilityWindows.find((window) => window.id === selectedAvailabilityWindowId) ?? null,
    [doctorDetail, selectedAvailabilityWindowId],
  )

  return {
    patientId,
    searchText,
    specialty,
    language,
    country,
    consultationMode,
    doctors,
    doctorDetail,
    bookings,
    selectedDoctorId,
    selectedAvailabilityWindowId,
    selectedWindow,
    requestError,
    pendingAction,
    setPatientId,
    setSearchText,
    setSpecialty,
    setLanguage,
    setCountry,
    setConsultationMode,
    debouncedSearch,
    setSelectedAvailabilityWindowId,
    searchDoctors,
    loadDoctorDetail,
    createBooking,
    loadPatientBookings,
  }
}
