import { useState, useEffect } from 'react'
import { apiBaseUrl } from '@shared/config/patient.ts'
import type { Appointment, AppointmentForm, TimeSlot } from '@shared/types/appointment.ts'

export function useScheduling(patientId: string | null) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)

  // Fetch patient appointments
  useEffect(() => {
    if (!patientId) return

    const fetchAppointments = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiBaseUrl}/appointments/my-appointments`)
        if (!response.ok) {
          throw new Error('Failed to fetch appointments')
        }
        const data = await response.json()
        setAppointments(data.appointments || [])
      } catch (err) {
        console.error('[API Error] Failed to fetch appointments:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          endpoint: `/platform/patients/${patientId}/appointments`
        })
        setError(err instanceof Error ? err.message : 'Failed to load appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [patientId])

  // Fetch available slots for a doctor
  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${apiBaseUrl}/appointments/doctor/availability?date=${date}`
      )
      if (!response.ok) {
        throw new Error('Failed to fetch availability')
      }
      const data = await response.json()
      setAvailableSlots(data.slots || [])
    } catch (err) {
      console.error('[API Error] Failed to fetch availability:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/doctors/${doctorId}/availability`
      })
      setError(err instanceof Error ? err.message : 'Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  // Book an appointment
  const bookAppointment = async (form: AppointmentForm) => {
    if (!patientId) return null

    setBooking(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/appointments/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          ...form,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Booking failed' }))
        throw new Error(errorData.error || 'Booking failed')
      }

      const data = await response.json()
      setAppointments(prev => [data.appointment, ...prev])
      return data.appointment
    } catch (err) {
      console.error('[API Error] Failed to book appointment:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: '/platform/appointments'
      })
      setError(err instanceof Error ? err.message : 'Failed to book appointment')
      return null
    } finally {
      setBooking(false)
    }
  }

  // Cancel an appointment
  const cancelAppointment = async (appointmentId: string) => {
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/appointments/${appointmentId}/cancel`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel appointment')
      }

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId
            ? { ...apt, status: 'cancelled_patient' as const }
            : apt
        )
      )
      return true
    } catch (err) {
      console.error('[API Error] Failed to cancel appointment:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/appointments/${appointmentId}`
      })
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment')
      return false
    }
  }

  return {
    appointments,
    availableSlots,
    loading,
    error,
    booking,
    fetchAvailableSlots,
    bookAppointment,
    cancelAppointment,
  }
}