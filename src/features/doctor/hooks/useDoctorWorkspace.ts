import { useState } from 'react'
import { apiBaseUrl } from '@shared/config/patient.ts'
import { initialDoctorAvailabilityForm, initialDoctorForm, initialDoctorVerificationForm } from '@features/doctor/config.ts'
import type { DoctorAvailabilityForm, DoctorForm, DoctorResponse, DoctorVerificationForm } from '@features/doctor/types.ts'

export function useDoctorWorkspace() {
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null)
  const [doctorForm, setDoctorForm] = useState<DoctorForm>(initialDoctorForm)
  const [availabilityForm, setAvailabilityForm] = useState<DoctorAvailabilityForm>(initialDoctorAvailabilityForm)
  const [verificationForm, setVerificationForm] = useState<DoctorVerificationForm>(initialDoctorVerificationForm)
  const [requestError, setRequestError] = useState('')
  const [pendingAction, setPendingAction] = useState('')

  async function submitDoctorProfile() {
    if (!doctorForm.displayName.trim()) {
      setRequestError('Display name is required.')
      return
    }
    if (!doctorForm.email.trim()) {
      setRequestError('Email is required.')
      return
    }
    if (!doctorForm.phoneNumber.trim()) {
      setRequestError('Phone number is required.')
      return
    }

    setPendingAction('profile')
    setRequestError('')

    try {
      const payload = {
        displayName: doctorForm.displayName,
        legalName: doctorForm.legalName,
        email: doctorForm.email,
        phoneNumber: doctorForm.phoneNumber,
        countryCode: doctorForm.countryCode,
        countryOfPractice: doctorForm.countryOfPractice,
        primarySpecialty: doctorForm.primarySpecialty,
        qualifications: doctorForm.qualifications,
        yearsOfExperience: Number(doctorForm.yearsOfExperience || 0),
        biography: doctorForm.biography,
        licenseNumber: doctorForm.licenseNumber,
        licensingAuthority: doctorForm.licensingAuthority,
        insuranceProvider: doctorForm.insuranceProvider,
        insurancePolicyNumber: doctorForm.insurancePolicyNumber,
        licenseExpiryDate: doctorForm.licenseExpiryDate || null,
        defaultPricePerSecondMinor: Number(doctorForm.defaultPricePerSecondMinor || 0),
        currency: doctorForm.currency,
        languages: doctorForm.languagesText
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        availabilityWindows: doctor?.availabilityWindows ?? [],
      }

      const url = doctor
        ? `${apiBaseUrl}/platform/doctors/${doctor.id}/profile`
        : `${apiBaseUrl}/platform/doctors/onboarding`

      const method = doctor ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: {} }))
        console.error('[API Error] Doctor profile submission failed:', {
          statusCode: response.status,
          error: errorData,
          timestamp: new Date().toISOString(),
          endpoint: url
        })
        setRequestError('Doctor profile could not be saved.')
        return
      }

      const result = await response.json()

      setDoctor(result)
      setVerificationForm((current) => ({ ...current, verificationStatus: result.verificationStatus }))
    } catch (error) {
      console.error('[API Error] Doctor profile submission network error:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      })
      setRequestError('Doctor API is unavailable right now. Check that the platform API is running locally.')
    } finally {
      setPendingAction('')
    }
  }

  async function addAvailabilityWindow() {
    if (!doctor) {
      setRequestError('Create the doctor profile before saving availability.')
      return
    }

    setPendingAction('availability')
    setRequestError('')

    try {
      const response = await fetch(`${apiBaseUrl}/platform/doctors/${doctor.id}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availabilityWindows: [
            ...doctor.availabilityWindows.map((window) => ({
              startsAt: window.startsAt,
              endsAt: window.endsAt,
              consultationMode: window.consultationMode,
              isInstantEnabled: window.isInstantEnabled,
            })),
            {
              startsAt: availabilityForm.startsAt,
              endsAt: availabilityForm.endsAt,
              consultationMode: availabilityForm.consultationMode,
              isInstantEnabled: availabilityForm.isInstantEnabled,
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: {} }))
        console.error('[API Error] Availability update failed:', {
          statusCode: response.status,
          error: errorData,
          timestamp: new Date().toISOString()
        })
        setRequestError('Availability could not be updated.')
        return
      }

      const result = await response.json()

      setDoctor(result)
      setAvailabilityForm(initialDoctorAvailabilityForm)
    } catch (error) {
      console.error('[API Error] Availability update network error:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      })
      setRequestError('Doctor API is unavailable right now. Check that the platform API is running locally.')
    } finally {
      setPendingAction('')
    }
  }

  async function updateVerification() {
    if (!doctor) {
      setRequestError('Create the doctor profile before updating verification.')
      return
    }

    setPendingAction('verification')
    setRequestError('')

    try {
      const response = await fetch(`${apiBaseUrl}/platform/doctors/${doctor.id}/verification`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationForm),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: {} }))
        console.error('[API Error] Verification update failed:', {
          statusCode: response.status,
          error: errorData,
          timestamp: new Date().toISOString()
        })
        setRequestError('Verification status could not be updated.')
        return
      }

      const result = await response.json()

      setDoctor(result)
    } catch (error) {
      console.error('[API Error] Verification update network error:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      })
      setRequestError('Doctor API is unavailable right now. Check that the platform API is running locally.')
    } finally {
      setPendingAction('')
    }
  }

  return {
    doctor,
    doctorForm,
    availabilityForm,
    verificationForm,
    requestError,
    pendingAction,
    setDoctorForm,
    setAvailabilityForm,
    setVerificationForm,
    submitDoctorProfile,
    addAvailabilityWindow,
    updateVerification,
  }
}
