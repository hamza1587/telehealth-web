export type PrescriptionStatus = 'draft' | 'final' | 'cancelled'

export type MedicationItem = {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  route: string
  quantity: string
  refills: number
  instructions: string
  warnings: string[]
}

export type Prescription = {
  id: string
  consultationId: string
  patientId: string
  doctorId: string
  status: PrescriptionStatus
  country: string
  medications: MedicationItem[]
  doctorSignature: {
    name: string
    licenseNumber: string
    licenseAuthority: string
  }
  pdfUrl: string | null
  createdAt: string
  updatedAt: string
}

export type PrescriptionForm = {
  country: string
  medications: Omit<MedicationItem, 'id'>[]
}