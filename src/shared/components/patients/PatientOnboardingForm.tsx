import { useState } from 'react'
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Warning, Info } from '@mui/icons-material'
import type { CreateMedicalProfileRequest } from '@shared/types/patients.ts'

const steps = ['Personal Info', 'Medical Profile', 'Consents', 'Review']

interface PatientOnboardingFormProps {
  onSubmit: (data: CreateMedicalProfileRequest & { consents: Record<string, boolean> }) => Promise<void>
  onCancel: () => void
}

export function PatientOnboardingForm({ onSubmit, onCancel }: PatientOnboardingFormProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Personal Info
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [sexAtBirth, setSexAtBirth] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [countryCode, setCountryCode] = useState('DE')
  const [city, setCity] = useState('')
  const [timeZone, setTimeZone] = useState('Europe/Berlin')

  // Step 2: Medical Profile
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('')
  const [chiefConcern, setChiefConcern] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [symptomDuration, setSymptomDuration] = useState('')
  const [currentMedications, setCurrentMedications] = useState('')
  const [allergies, setAllergies] = useState('')
  const [knownConditions, setKnownConditions] = useState('')
  const [pastSurgeries, setPastSurgeries] = useState('')
  const [pregnancyStatus, setPregnancyStatus] = useState('Not applicable')
  const [lifestyleFactors, setLifestyleFactors] = useState('')
  const [preferredConsultationLanguage, setPreferredConsultationLanguage] = useState('en')
  const [urgencyLevel, setUrgencyLevel] = useState('Routine')
  const [emergencySymptoms, setEmergencySymptoms] = useState(false)

  // Step 3: Consents
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [teleconsultationAccepted, setTeleconsultationAccepted] = useState(false)
  const [healthDataProcessingAccepted, setHealthDataProcessingAccepted] = useState(false)
  const [researchAccepted, setResearchAccepted] = useState(false)
  const [marketingAccepted, setMarketingAccepted] = useState(false)
  const [medicalDisclaimerAccepted, setMedicalDisclaimerAccepted] = useState(false)

  const handleNext = () => {
    setError(null)
    if (activeStep === 0) {
      if (!dateOfBirth || !sexAtBirth || !phoneNumber || !city) {
        setError('Please fill in all required fields')
        return
      }
    }
    if (activeStep === 1) {
      if (!emergencyContactName || !emergencyContactPhone || !chiefConcern || !symptoms) {
        setError('Please fill in all required fields')
        return
      }
      if (emergencySymptoms) {
        setError('Emergency symptoms detected. Please contact emergency services instead of using teleconsultation.')
        return
      }
    }
    if (activeStep === 2) {
      if (!termsAccepted || !privacyAccepted || !teleconsultationAccepted || !healthDataProcessingAccepted || !medicalDisclaimerAccepted) {
        setError('Please accept all required consents')
        return
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const data: CreateMedicalProfileRequest & { consents: Record<string, boolean> } = {
        dateOfBirth,
        sexAtBirth,
        phoneNumber,
        countryCode,
        city,
        timeZone,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
        chiefConcern,
        symptoms,
        symptomDuration,
        currentMedications,
        allergies,
        knownConditions,
        pastSurgeries,
        pregnancyStatus,
        lifestyleFactors,
        preferredConsultationLanguage,
        urgencyLevel,
        emergencySymptoms,
        medicalDisclaimerAccepted,
        consents: {
          termsAccepted,
          privacyAccepted,
          teleconsultationAccepted,
          healthDataProcessingAccepted,
          researchAccepted,
          marketingAccepted,
        },
      }

      await onSubmit(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
      InputLabelProps={{ shrink: true }}
      required
                disabled={loading}
              />
              <FormControl fullWidth required>
                <InputLabel>Sex at Birth</InputLabel>
                <Select
                  value={sexAtBirth}
                  onChange={(e) => setSexAtBirth(e.target.value)}
                  label="Sex at Birth"
                  disabled={loading}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Intersex">Intersex</MenuItem>
                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
              />
              <FormControl fullWidth required>
                <InputLabel>Country</InputLabel>
                <Select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  label="Country"
                  disabled={loading}
                >
                  <MenuItem value="DE">Germany</MenuItem>
                  <MenuItem value="FR">France</MenuItem>
                  <MenuItem value="IT">Italy</MenuItem>
                  <MenuItem value="ES">Spain</MenuItem>
                  <MenuItem value="NL">Netherlands</MenuItem>
                  <MenuItem value="BE">Belgium</MenuItem>
                  <MenuItem value="AT">Austria</MenuItem>
                  <MenuItem value="CH">Switzerland</MenuItem>
                  <MenuItem value="GB">United Kingdom</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                disabled={loading}
              />
              <FormControl fullWidth>
                <InputLabel>Time Zone</InputLabel>
                <Select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  label="Time Zone"
                  disabled={loading}
                >
                  <MenuItem value="Europe/Berlin">Europe/Berlin</MenuItem>
                  <MenuItem value="Europe/Paris">Europe/Paris</MenuItem>
                  <MenuItem value="Europe/Rome">Europe/Rome</MenuItem>
                  <MenuItem value="Europe/Madrid">Europe/Madrid</MenuItem>
                  <MenuItem value="Europe/Amsterdam">Europe/Amsterdam</MenuItem>
                  <MenuItem value="Europe/Vienna">Europe/Vienna</MenuItem>
                  <MenuItem value="Europe/Zurich">Europe/Zurich</MenuItem>
                  <MenuItem value="Europe/London">Europe/London</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        )

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Medical Profile
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Emergency Contact Name"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Emergency Contact Phone"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Emergency Contact Relationship"
                value={emergencyContactRelationship}
                onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Pregnancy Status</InputLabel>
                <Select
                  value={pregnancyStatus}
                  onChange={(e) => setPregnancyStatus(e.target.value)}
                  label="Pregnancy Status"
                >
                  <MenuItem value="Not applicable">Not applicable</MenuItem>
                  <MenuItem value="Not pregnant">Not pregnant</MenuItem>
                  <MenuItem value="Pregnant">Pregnant</MenuItem>
                  <MenuItem value="Postpartum">Postpartum</MenuItem>
                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              label="Chief Concern"
              value={chiefConcern}
              onChange={(e) => setChiefConcern(e.target.value)}
              multiline
              rows={2}
              sx={{ mt: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              multiline
              rows={3}
              sx={{ mt: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Symptom Duration"
              value={symptomDuration}
              onChange={(e) => setSymptomDuration(e.target.value)}
              sx={{ mt: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Current Medications"
              value={currentMedications}
              onChange={(e) => setCurrentMedications(e.target.value)}
              multiline
              rows={2}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              multiline
              rows={2}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Known Conditions"
              value={knownConditions}
              onChange={(e) => setKnownConditions(e.target.value)}
              multiline
              rows={2}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Past Surgeries"
              value={pastSurgeries}
              onChange={(e) => setPastSurgeries(e.target.value)}
              multiline
              rows={2}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Lifestyle Factors"
              value={lifestyleFactors}
              onChange={(e) => setLifestyleFactors(e.target.value)}
              multiline
              rows={2}
              sx={{ mt: 2 }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Preferred Consultation Language</InputLabel>
                <Select
                  value={preferredConsultationLanguage}
                  onChange={(e) => setPreferredConsultationLanguage(e.target.value)}
                  label="Preferred Consultation Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="it">Italian</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="nl">Dutch</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Urgency Level</InputLabel>
                <Select
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value)}
                  label="Urgency Level"
                >
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                  <MenuItem value="Routine">Routine</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={emergencySymptoms}
                  onChange={(e) => setEmergencySymptoms(e.target.checked)}
                  color="error"
                />
              }
              label="I have emergency symptoms (chest pain, difficulty breathing, severe bleeding, etc.)"
              sx={{ mt: 2 }}
            />
            {emergencySymptoms && (
              <Alert severity="error" icon={<Warning />} sx={{ mt: 2 }}>
                <strong>Emergency Warning:</strong> If you are experiencing emergency symptoms, please contact your local emergency services immediately. Teleconsultation is not appropriate for emergencies.
              </Alert>
            )}
          </Box>
        )

      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Consents
            </Typography>
            <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
              Please review and accept the following consents to proceed.
            </Alert>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                  />
                }
                label="I accept the Terms of Service"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    required
                  />
                }
                label="I acknowledge the Privacy Policy and Data Rights Notice"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={teleconsultationAccepted}
                    onChange={(e) => setTeleconsultationAccepted(e.target.checked)}
                    required
                  />
                }
                label="I consent to remote teleconsultation care delivery"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={healthDataProcessingAccepted}
                    onChange={(e) => setHealthDataProcessingAccepted(e.target.checked)}
                    required
                  />
                }
                label="I consent to processing of my health data for care delivery"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={researchAccepted}
                    onChange={(e) => setResearchAccepted(e.target.checked)}
                  />
                }
                label="(Optional) I grant consent for my anonymized data to be used for approved research"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={marketingAccepted}
                    onChange={(e) => setMarketingAccepted(e.target.checked)}
                  />
                }
                label="(Optional) I consent to receive marketing communications"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={medicalDisclaimerAccepted}
                    onChange={(e) => setMedicalDisclaimerAccepted(e.target.checked)}
                    required
                  />
                }
                label="I understand that teleconsultation is not appropriate for emergencies and I will contact emergency services if needed"
              />
            </Box>
          </Box>
        )

      case 3:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please review your information before submitting.
            </Alert>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Typography><strong>Date of Birth:</strong> {dateOfBirth}</Typography>
              <Typography><strong>Phone:</strong> {phoneNumber}</Typography>
              <Typography><strong>City:</strong> {city}, {countryCode}</Typography>
              <Typography><strong>Chief Concern:</strong> {chiefConcern}</Typography>
              <Typography><strong>Symptoms:</strong> {symptoms}</Typography>
              <Typography><strong>Emergency Contact:</strong> {emergencyContactName} ({emergencyContactPhone})</Typography>
              <Typography><strong>Consents Accepted:</strong></Typography>
              <ul>
                {termsAccepted && <li>Terms of Service</li>}
                {privacyAccepted && <li>Privacy Policy</li>}
                {teleconsultationAccepted && <li>Teleconsultation</li>}
                {healthDataProcessingAccepted && <li>Health Data Processing</li>}
                {researchAccepted && <li>Research (Optional)</li>}
                {marketingAccepted && <li>Marketing (Optional)</li>}
              </ul>
            </Box>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Patient Onboarding
      </Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext} disabled={loading}>
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Complete Onboarding'}
          </Button>
        )}
        <Button onClick={onCancel} disabled={loading} color="error">
          Cancel
        </Button>
      </Box>
    </Box>
  )
}
