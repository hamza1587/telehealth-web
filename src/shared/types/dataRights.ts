export type DataRightType =
  | 'access'
  | 'rectification'
  | 'erasure'
  | 'restriction'
  | 'portability'
  | 'objection'

export type DataRightStatus =
  | 'submitted'
  | 'identity_verification_required'
  | 'in_review'
  | 'waiting_user'
  | 'approved'
  | 'partially_approved'
  | 'rejected'
  | 'completed'

export type DataRightRequest = {
  id: string
  userId: string
  type: DataRightType
  status: DataRightStatus
  description: string
  legalBasis: string
  identityVerified: boolean
  reviewerId: string | null
  reviewerName: string | null
  decision: string | null
  completionEvidence: string | null
  createdAt: string
  updatedAt: string
  dueDate: string
  completedAt: string | null
}

export type DataRightForm = {
  type: DataRightType
  description: string
}