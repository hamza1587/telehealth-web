import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@shared/api/Client.ts'
import type { Appointment, AppointmentDetail } from '@shared/types/appointment.ts'

interface AppointmentListResponse {
  items: Appointment[]
}

interface AppointmentBookResponse {
  Appointment: AppointmentDetail
}

interface RescheduleResponse {
  appointment: AppointmentDetail
}

export function useAppointments(patientId: string | null) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<AppointmentListResponse>('/platform/appointments/my-appointments')
      setAppointments(res.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const fetchAppointmentDetail = async (appointmentId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get<AppointmentDetail>(`/platform/appointments/${appointmentId}`)
      setSelectedAppointment(res)
      return res
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointment details')
      return null
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.post(`/platform/appointments/${appointmentId}/cancel`, {
        reason: 'Patient requested',
      })
      setAppointments(prev =>
        prev.map(a => a.id === appointmentId
          ? { ...a, status: 'cancelled_patient' as const }
          : a
        )
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment')
      return false
    } finally {
      setLoading(false)
    }
  }

  const rescheduleAppointment = async (appointmentId: string, newStart: string, newEnd: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.post<RescheduleResponse>(
        `/platform/appointments/${appointmentId}/reschedule`,
        { newStartTime: newStart, newEndTime: newEnd }
      )
      return res.appointment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule appointment')
      return null
    } finally {
      setLoading(false)
    }
  }

  const bookAppointment = async (doctorId: string, scheduledStart: Date, scheduledEnd: Date, notes: string) => {
    if (!patientId) return null
    setLoading(true)
    setError(null)
    try {
      const startIso = scheduledStart.toISOString()
      const endIso = scheduledEnd.toISOString()

      const res = await apiClient.post<AppointmentBookResponse>('/platform/appointments/book', {
        doctorProfileId: doctorId,
        specialtyCode: 'GP',
        consultationMode: 'Video',
        scheduledStartsAt: startIso,
        scheduledEndsAt: endIso,
        notes,
      })
      return res.Appointment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment')
      return null
    } finally {
      setLoading(false)
      await fetchAppointments()
    }
  }

  return {
    appointments,
    selectedAppointment,
    loading,
    error,
    fetchAppointments,
    fetchAppointmentDetail,
    cancelAppointment,
    rescheduleAppointment,
    bookAppointment,
  }
}