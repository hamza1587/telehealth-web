export type NotificationType = 
  | 'account_verification'
  | 'appointment_confirmation'
  | 'appointment_reminder'
  | 'doctor_late'
  | 'patient_waiting'
  | 'consultation_completed'
  | 'low_credit'
  | 'payment_success'
  | 'payment_failure'
  | 'refund_update'
  | 'prescription_available'
  | 'data_rights_update'
  | 'consent_update'
  | 'security_alert'

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app'

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed'

export type Notification = {
  id: string
  recipientId: string
  recipientRole: 'patient' | 'doctor' | 'admin'
  type: NotificationType
  channel: NotificationChannel
  title: string
  message: string
  status: NotificationStatus
  relatedId: string | null
  relatedType: string | null
  sentAt: string | null
  deliveredAt: string | null
  failureReason: string | null
  createdAt: string
}

export type NotificationPreferences = {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
  types: Record<NotificationType, boolean>
}