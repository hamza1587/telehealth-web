import { useState, useEffect } from 'react'
import { apiBaseUrl } from '@shared/config/patient.ts'
import type { Prescription, PrescriptionForm } from '@shared/types/prescription.ts'

export function usePrescription(consultationId: string | null) {
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Fetch prescription
  useEffect(() => {
    if (!consultationId) return

    const fetchPrescription = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiBaseUrl}/prescriptions/consultation/${consultationId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setPrescription(null)
            return
          }
          throw new Error('Failed to fetch prescription')
        }
        const data = await response.json()
        setPrescription(data.prescription)
      } catch (err) {
        console.error('[API Error] Failed to fetch prescription:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          endpoint: `/platform/consultations/${consultationId}/prescription`
        })
        setError(err instanceof Error ? err.message : 'Failed to load prescription')
      } finally {
        setLoading(false)
      }
    }

    fetchPrescription()
  }, [consultationId])

  // Create prescription
  const createPrescription = async (form: PrescriptionForm) => {
    if (!consultationId) return null

    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/prescriptions/consultation/${consultationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          ...form,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create prescription')
      }

      const data = await response.json()
      setPrescription(data.prescription)
      return data.prescription
    } catch (err) {
      console.error('[API Error] Failed to create prescription:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: '/platform/prescriptions'
      })
      setError(err instanceof Error ? err.message : 'Failed to create prescription')
      return null
    } finally {
      setSaving(false)
    }
  }

  // Finalize prescription
  const finalizePrescription = async () => {
    if (!prescription) return null

    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/prescriptions/${prescription.id}/issue`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to finalize prescription')
      }

      const data = await response.json()
      setPrescription(data.prescription)
      return data.prescription
    } catch (err) {
      console.error('[API Error] Failed to finalize prescription:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/prescriptions/${prescription.id}/finalize`
      })
      setError(err instanceof Error ? err.message : 'Failed to finalize prescription')
      return null
    } finally {
      setSaving(false)
    }
  }

  return {
    prescription,
    loading,
    error,
    saving,
    createPrescription,
    finalizePrescription,
  }
}