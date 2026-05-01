export type TicketCategory = 
  | 'payment_issue'
  | 'credit_issue'
  | 'call_quality_issue'
  | 'doctor_no_show'
  | 'patient_no_show'
  | 'prescription_issue'
  | 'clinical_complaint'
  | 'privacy_request'
  | 'account_issue'

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TicketStatus = 'submitted' | 'in_review' | 'waiting_user' | 'resolved' | 'escalated'

export type SupportTicket = {
  id: string
  userId: string
  userRole: 'patient' | 'doctor'
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  subject: string
  description: string
  attachments: Array<{
    id: string
    filename: string
    url: string
  }>
  assignedAgentId: string | null
  assignedAgentName: string | null
  slaDueDate: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

export type TicketMessage = {
  id: string
  ticketId: string
  senderId: string
  senderRole: 'user' | 'agent' | 'admin'
  message: string
  attachments: Array<{
    id: string
    filename: string
    url: string
  }>
  createdAt: string
}

export type TicketForm = {
  category: TicketCategory
  subject: string
  description: string
}