import { useState, useEffect } from 'react'
import { apiBaseUrl } from '@shared/config/patient.ts'
import type { BillingSession, Wallet, WalletLedgerEntry } from '@shared/types/billing.ts'

export function useBilling(patientId: string | null) {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [ledger, setLedger] = useState<WalletLedgerEntry[]>([])
  const [activeBillingSession, setActiveBillingSession] = useState<BillingSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch wallet
  useEffect(() => {
    if (!patientId) return

    const fetchWallet = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiBaseUrl}/wallets/my-wallet`)
        if (!response.ok) {
          throw new Error('Failed to fetch wallet')
        }
        const data = await response.json()
        setWallet(data.wallet)
      } catch (err) {
        console.error('[API Error] Failed to fetch wallet:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          endpoint: `/platform/patients/${patientId}/wallet`
        })
        setError(err instanceof Error ? err.message : 'Failed to load wallet')
      } finally {
        setLoading(false)
      }
    }

    fetchWallet()
  }, [patientId])

  // Fetch ledger
  useEffect(() => {
    if (!wallet) return

    const fetchLedger = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/wallets/my-wallet/ledger`)
        if (!response.ok) {
          throw new Error('Failed to fetch ledger')
        }
        const data = await response.json()
        setLedger(data.entries || [])
      } catch (err) {
        console.error('[API Error] Failed to fetch ledger:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          endpoint: `/platform/wallets/${wallet.id}/ledger`
        })
      }
    }

    fetchLedger()
  }, [wallet])

  // Reserve credits for appointment
  const reserveCredits = async (appointmentId: string, estimatedSeconds: number, pricePerSecond: number) => {
    if (!wallet) return null

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/wallets/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          estimatedSeconds,
          pricePerSecond,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reserve credits')
      }

      const data = await response.json()
      setWallet(data.wallet)
      setActiveBillingSession(data.billingSession)
      return data.billingSession
    } catch (err) {
      console.error('[API Error] Failed to reserve credits:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/wallets/${wallet.id}/reserve`
      })
      setError(err instanceof Error ? err.message : 'Failed to reserve credits')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Finalize billing
  const finalizeBilling = async (billingSessionId: string, actualSeconds: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/billing/${billingSessionId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualSeconds }),
      })

      if (!response.ok) {
        throw new Error('Failed to finalize billing')
      }

      const data = await response.json()
      setWallet(data.wallet)
      setActiveBillingSession(null)
      setLedger(prev => [data.ledgerEntry, ...prev])
      return data
    } catch (err) {
      console.error('[API Error] Failed to finalize billing:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/billing/${billingSessionId}/finalize`
      })
      setError(err instanceof Error ? err.message : 'Failed to finalize billing')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    wallet,
    ledger,
    activeBillingSession,
    loading,
    error,
    reserveCredits,
    finalizeBilling,
  }
}