export type BillingStatus = 'reserved' | 'active' | 'completed' | 'refunded' | 'disputed'

export type BillingSession = {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  status: BillingStatus
  pricePerSecond: number
  currency: string
  reservedCredits: number
  billableSeconds: number
  grossCharge: number
  platformFee: number
  doctorEarning: number
  taxAmount: number
  gracePeriodSeconds: number
  minimumChargeSeconds: number
  maximumChargeSeconds: number
  startTime: string | null
  endTime: string | null
  createdAt: string
  updatedAt: string
}

export type Wallet = {
  id: string
  patientId: string
  balance: number
  reservedBalance: number
  currency: string
  createdAt: string
  updatedAt: string
}

export type WalletLedgerEntry = {
  id: string
  walletId: string
  type: 'credit' | 'debit' | 'refund' | 'adjustment'
  amount: number
  currency: string
  referenceId: string | null
  referenceType: 'purchase' | 'consultation' | 'refund' | 'adjustment'
  description: string
  createdAt: string
}

export type BillingEvent = {
  id: string
  billingSessionId: string
  eventType: 'credits_reserved' | 'session_started' | 'timer_started' | 'session_ended' | 'credits_debited' | 'credits_released' | 'doctor_earnings_created' | 'refund_issued'
  timestamp: string
  metadata: Record<string, unknown>
}