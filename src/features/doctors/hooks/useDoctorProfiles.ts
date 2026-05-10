import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@shared/api/Client.ts'
import type { DoctorDetail } from '@shared/types/index.ts'
import type { DoctorSearchResult } from '@shared/types/doctor.ts'

export function useDoctorProfiles() {
  const [doctors, setDoctors] = useState<DoctorSearchResult[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchDoctors = useCallback(async (specialty?: string, country?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (specialty) params.append('specialty', specialty)
      if (country) params.append('country', country)

      const res = await apiClient.get(`/platform/discovery/doctors?${params.toString()}`)
      setDoctors(res.doctors || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search doctors')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDoctorDetail = useCallback(async (doctorId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(`/platform/discovery/doctors/${doctorId}`)
      // Fetch availability separately
      const availRes = await apiClient.get(`/platform/doctors/${doctorId}/availability`)
      setSelectedDoctor({ ...res, availability: availRes.slots || [] })
      return { ...res, availability: availRes.slots || [] }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch doctor details')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    searchDoctors()
  }, [searchDoctors])

  return {
    doctors,
    selectedDoctor,
    loading,
    error,
    searchDoctors,
    fetchDoctorDetail,
  }
}