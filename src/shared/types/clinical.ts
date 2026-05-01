export type ClinicalNoteStatus = 'draft' | 'final' | 'amended'

export type ClinicalNote = {
  id: string
  consultationId: string
  patientId: string
  doctorId: string
  status: ClinicalNoteStatus
  chiefComplaint: string
  historyOfPresentIllness: string
  relevantPastHistory: string
  medications: string
  allergies: string
  observations: string
  assessment: string
  plan: string
  adviceGiven: string
  safetyNetInstructions: string
  followUpRecommendation: string
  version: number
  createdAt: string
  updatedAt: string
  editHistory: Array<{
    timestamp: string
    editorId: string
    changes: string
  }>
}

export type ClinicalNoteForm = {
  chiefComplaint: string
  historyOfPresentIllness: string
  relevantPastHistory: string
  medications: string
  allergies: string
  observations: string
  assessment: string
  plan: string
  adviceGiven: string
  safetyNetInstructions: string
  followUpRecommendation: string
}