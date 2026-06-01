import { useState, useCallback } from 'react'

interface PrescriptionItem {
  id: string
  medicationCode: string
  medicationName: string
  dosage: string
  frequency: string
  durationDays: number
  instructions: string
  quantity: number
  refills: number
  isControlledSubstance: boolean
}

interface Prescription {
  id: string
  consultationId: string
  doctorId: string
  patientId: string
  countryCode: string
  status: 'draft' | 'pending' | 'sent' | 'delivered' | 'cancelled'
  items: PrescriptionItem[]
  digitalSignature: string | null
  isControlledSubstance: boolean
  deaNumber: string | null
  nationalPrescriptionId: string | null
  createdAt: string
  updatedAt: string
}

interface DrugInteraction {
  medication1: string
  medication2: string
  severity: 'Low' | 'Moderate' | 'High'
  description: string
  recommendation: string
}

interface Pharmacy {
  id: string
  name: string
  address: string
  city: string
  countryCode: string
  isOnline: boolean
  acceptsEPrescriptions: boolean
}

const PRESCRIPTION_API_BASE = 'http://localhost:5001/api' // Update with actual Prescription Service URL

export const usePrescriptionService = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPrescription = useCallback(async (consultationId: string, doctorId: string, patientId: string, countryCode: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${PRESCRIPTION_API_BASE}/prescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId, doctorId, patientId, countryCode }),
      })
      if (!response.ok) throw new Error('Failed to create prescription')
      return await response.json() as Prescription
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prescription')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getPrescription = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${PRESCRIPTION_API_BASE}/prescription/${id}`)
      if (!response.ok) throw new Error('Failed to get prescription')
      return await response.json() as Prescription
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prescription')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const addItem = useCallback(async (prescriptionId: string, item: Omit<PrescriptionItem, 'id'>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${PRESCRIPTION_API_BASE}/prescription/${prescriptionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      if (!response.ok) throw new Error('Failed to add item')
      return await response.json() as Prescription
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const finalizePrescription = useCallback(async (id: string, digitalSignature: string, deaNumber?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${PRESCRIPTION_API_BASE}/prescription/${id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digitalSignature, deaNumber }),
      })
      if (!response.ok) throw new Error('Failed to finalize prescription')
      return await response.json() as Prescription
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize prescription')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const sendToNationalGateway = useCallback(async (id: string, pharmacyId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${PRESCRIPTION_API_BASE}/prescription/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pharmacyId }),
      })
      if (!response.ok) throw new Error('Failed to send prescription')
      const data = await response.json()
      return data.nationalPrescriptionId as string
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send prescription')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const checkDrugInteractions = useCallback(async (existingMedications: string[], newMedications: string[]) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${PRESCRIPTION_API_BASE}/drug-interactions/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ existingMedications, newMedications }),
      })
      if (!response.ok) throw new Error('Failed to check interactions')
      return await response.json() as DrugInteraction[]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check interactions')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getNearbyPharmacies = useCallback(async (countryCode: string, city?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ countryCode })
      if (city) params.append('city', city)
      const response = await fetch(`${PRESCRIPTION_API_BASE}/pharmacies/nearby?${params}`)
      if (!response.ok) throw new Error('Failed to get pharmacies')
      return await response.json() as Pharmacy[]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get pharmacies')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const sendToPharmacy = useCallback(async (prescriptionId: string, pharmacyId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${PRESCRIPTION_API_BASE}/pharmacies/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId, pharmacyId }),
      })
      if (!response.ok) throw new Error('Failed to send to pharmacy')
      return await response.json() as boolean
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send to pharmacy')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createPrescription,
    getPrescription,
    addItem,
    finalizePrescription,
    sendToNationalGateway,
    checkDrugInteractions,
    getNearbyPharmacies,
    sendToPharmacy,
  }
}
