import { useState, useCallback } from 'react'
import { apiBaseUrl } from '@shared/config/patient.ts'

const GATEWAY_BASE = `${apiBaseUrl}/gateway`

interface GatewayMedication {
  name: string;
  dosage: string;
  quantity: string;
  daysSupply: number;
  refills: number;
  instructions: string;
  isControlledSubstance?: boolean;
}

interface GatewayPrescriptionResult {
  gateway: string;
  results: {
    gatewayPrescriptionId: string;
    status: string;
    nationalPrescriptionId?: string;
  }[];
}

interface DrugInteraction {
  medication1: string;
  medication2: string;
  severity: 'Low' | 'Moderate' | 'High';
  description: string;
  recommendation: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  acceptsEPrescriptions: boolean;
  isOnline: boolean;
}

interface LabOrder {
  id: string;
  status: string;
  testCode: string;
  testDisplay: string;
  createdAt: string;
}

interface LabResult {
  id: string;
  orderId: string;
  status: string;
  conclusion?: string;
  results: { code: string; display: string; value: string; unit: string; referenceRange?: string; interpretation?: string }[];
  issuedAt?: string;
}

export const usePrescriptionService = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitPrescription = useCallback(async (
    patientId: string,
    doctorId: string,
    countryCode: string,
    medications: GatewayMedication[],
    deaNumber?: string,
  ): Promise<GatewayPrescriptionResult> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${GATEWAY_BASE}/prescription/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, doctorId, countryCode, medications, deaNumber }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string; detail?: string }
        throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`)
      }
      return await res.json() as GatewayPrescriptionResult
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const getPrescriptionStatus = useCallback(async (gateway: string, gatewayId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${GATEWAY_BASE}/prescription/${gateway}/${gatewayId}/status`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json() as { status: string; nationalId?: string }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Status check failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const checkDrugInteractions = useCallback(async (
    existingMedications: string[],
    newMedications: string[],
    countryCode = 'DE',
  ): Promise<DrugInteraction[]> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${GATEWAY_BASE}/drug-interactions/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ existingMedications, newMedications, countryCode }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json() as DrugInteraction[]
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Interaction check failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const getNearbyPharmacies = useCallback(async (countryCode: string, city: string): Promise<Pharmacy[]> => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ countryCode, city })
      const res = await fetch(`${GATEWAY_BASE}/pharmacies/nearby?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json() as Pharmacy[]
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Pharmacy search failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const submitLabOrder = useCallback(async (
    patientId: string,
    testCode: string,
    testDisplay: string,
    priority: 'routine' | 'urgent' | 'asap',
    countryCode = 'DE',
    notes?: string,
  ): Promise<LabOrder> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${GATEWAY_BASE}/lab-orders/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, testCode, testDisplay, priority, countryCode, notes }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string; detail?: string }
        throw new Error(data.detail ?? data.error ?? `HTTP ${res.status}`)
      }
      return await res.json() as LabOrder
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lab order failed'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const getLabResults = useCallback(async (orderId: string, countryCode = 'DE'): Promise<LabResult | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${GATEWAY_BASE}/lab-orders/${orderId}/results?countryCode=${countryCode}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json() as LabResult | null
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch results'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    submitPrescription,
    getPrescriptionStatus,
    checkDrugInteractions,
    getNearbyPharmacies,
    submitLabOrder,
    getLabResults,
  }
}
