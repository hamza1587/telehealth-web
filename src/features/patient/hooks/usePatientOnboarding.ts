import { useMemo, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { apiBaseUrl, consentVersion, initialOnboardingForm, initialRegistrationForm } from '@shared/config/patient.ts'
import type { ApiValidationErrors, OnboardingForm, PatientResponse, RegistrationForm } from '@shared/types/patient.ts'
import type { WorkspaceKey } from '@shared/types/workspace.ts'

export function usePatientOnboarding(setWorkspace: Dispatch<SetStateAction<WorkspaceKey>>) {
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>(initialRegistrationForm)
  const [onboardingForm, setOnboardingForm] = useState<OnboardingForm>(initialOnboardingForm)
  const [patient, setPatient] = useState<PatientResponse | null>(null)
  const [registrationErrors, setRegistrationErrors] = useState<ApiValidationErrors>({})
  const [onboardingErrors, setOnboardingErrors] = useState<ApiValidationErrors>({})
  const [registrationPending, setRegistrationPending] = useState(false)
  const [onboardingPending, setOnboardingPending] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Product design shell is ready for the MVP rollout.')
  const [requestError, setRequestError] = useState('')

  const patientStep = patient?.hasMedicalProfile ? 3 : patient ? 1 : 0
  const requiredConsentsAccepted = useMemo(
    () =>
      patient
        ? patient.consents.filter(
            (consent) =>
              consent.isAccepted &&
              ['TermsOfService', 'PrivacyPolicy', 'Teleconsultation', 'HealthDataProcessing'].includes(
                consent.consentType,
              ),
          ).length
        : 0,
    [patient],
  )

  async function handleRegistrationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRegistrationPending(true)
    setRegistrationErrors({})
    setRequestError('')

    try {
      const response = await fetch(`${apiBaseUrl}/platform/patients/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationForm),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ errors: {} }))
        setRegistrationErrors(errorData.errors ?? {})
        setRequestError('Registration could not be completed.')
        return
      }

      const payload = await response.json()

      setPatient(payload)
      setOnboardingForm((current) => ({
        ...current,
        countryCode: payload.countryCode,
        preferredConsultationLanguage: payload.preferredLanguage,
        consentLanguage: payload.preferredLanguage,
      }))
      setWorkspace('patient')
      setStatusMessage('Patient account created. Continue with consent capture and medical onboarding.')
    } catch (error) {
      console.error('[API Error] Patient registration failed:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        endpoint: '/platform/patients/register'
      })
      setRequestError('The patient API is unavailable right now. Check that the platform API is running locally.')
    } finally {
      setRegistrationPending(false)
    }
  }

  async function handleOnboardingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!patient) {
      return
    }

    setOnboardingPending(true)
    setOnboardingErrors({})
    setRequestError('')

    try {
      const response = await fetch(`${apiBaseUrl}/platform/patients/${patient.id}/onboarding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consentVersion,
          ...onboardingForm,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ errors: {} }))
        setOnboardingErrors(errorData.errors ?? {})
        setRequestError('Onboarding could not be completed.')
        return
      }

      const payload = await response.json()

      setPatient(payload)
      setStatusMessage(
        payload.emergencySymptoms
          ? 'Patient onboarding completed with emergency warning flag raised for follow-up.'
          : 'Patient onboarding completed and ready for search, booking, and consultation flows.',
      )
    } catch (error) {
      console.error('[API Error] Patient onboarding failed:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/patients/${patient?.id}/onboarding`
      })
      setRequestError('The patient API is unavailable right now. Check that the platform API is running locally.')
    } finally {
      setOnboardingPending(false)
    }
  }

  return {
    patient,
    registrationForm,
    onboardingForm,
    registrationErrors,
    onboardingErrors,
    registrationPending,
    onboardingPending,
    statusMessage,
    requestError,
    patientStep,
    requiredConsentsAccepted,
    setRegistrationForm,
    setOnboardingForm,
    handleRegistrationSubmit,
    handleOnboardingSubmit,
  }
}
