import { apiClient } from './apiClient'
import type { MedicalProfile, ConsentRecord, CreateMedicalProfileRequest, RecordConsentRequest } from '@shared/types/patients.ts'

export class PatientApi {
  private baseUrl = '/platform/patients'

  async createMedicalProfile(patientAccountId: string, data: CreateMedicalProfileRequest): Promise<MedicalProfile> {
    return apiClient.post(`${this.baseUrl}/${patientAccountId}/onboarding`, data)
  }

  async getMedicalProfile(patientAccountId: string): Promise<MedicalProfile> {
    return apiClient.get(`${this.baseUrl}/${patientAccountId}`)
  }

  async recordConsent(patientAccountId: string, data: RecordConsentRequest): Promise<void> {
    return apiClient.post(`${this.baseUrl}/${patientAccountId}/consents`, data)
  }

  async getConsentRecords(patientAccountId: string): Promise<ConsentRecord[]> {
    return apiClient.get(`${this.baseUrl}/${patientAccountId}/consents`)
  }

  async withdrawConsent(patientAccountId: string, consentType: string): Promise<void> {
    return apiClient.get(`${this.baseUrl}/${patientAccountId}/consents/${consentType}/withdraw`)
  }
}

export const patientApi = new PatientApi()