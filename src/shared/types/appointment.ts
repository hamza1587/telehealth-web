export type AppointmentStatus =
  | 'draft'
  | 'pending_payment'
  | 'confirmed'
  | 'patient_waiting'
  | 'doctor_waiting'
  | 'in_progress'
  | 'completed'
  | 'cancelled_patient'
  | 'cancelled_doctor'
  | 'no_show_patient'
  | 'no_show_doctor'
  | 'failed_technical'
  | 'refunded'

export type Appointment = {
  id: string
  patientId: string
  doctorId: string
  doctorName: string
  doctorSpecialty: string
  scheduledStart: string
  scheduledEnd: string
  status: AppointmentStatus
  pricePerSecond: number
  currency: string
  creditsReserved: number
  creditsUsed: number
  meetingUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type TimeSlot = {
  start: string
  end: string
  available: boolean
}

export type DoctorAvailability = {
  doctorId: string
  date: string
  slots: TimeSlot[]
}

export type AppointmentForm = {
  doctorId: string
  scheduledStart: string
  scheduledEnd: string
  notes: string
}

export type AppointmentDetail = Appointment & {
  cancellationReason?: string
}

export type ApiValidationErrors = Record<string, string[]>