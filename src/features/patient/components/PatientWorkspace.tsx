import { Alert, Box, Button, Card, CardContent, Grid, List, Paper, Stack, Step, StepLabel, Stepper } from '@mui/material'
import { languageOptions, patientSteps, pregnancyOptions, sexOptions, urgencyOptions } from '@shared/config/patient.ts'
import { InfoCard } from '@shared/components/common/InfoCard.tsx'
import { MetricRow } from '@shared/components/common/MetricRow.tsx'
import { BulletRow } from '@shared/components/common/BulletRow.tsx'
import { SectionHeader } from '@shared/components/common/SectionHeader.tsx'
import { Field } from '@shared/components/form/Field.tsx'
import { SelectField } from '@shared/components/form/SelectField.tsx'
import { ConsentCard } from '@features/patient/components/ConsentCard.tsx'
import { ConsentToggle } from '@features/patient/components/ConsentToggle.tsx'
import type { usePatientOnboarding } from '@features/patient/hooks/usePatientOnboarding.ts'

export function PatientWorkspace({
  onboarding,
}: {
  onboarding: ReturnType<typeof usePatientOnboarding>
}) {
  const {
    patient,
    patientStep,
    registrationForm,
    onboardingForm,
    registrationErrors,
    onboardingErrors,
    registrationPending,
    onboardingPending,
    requestError,
    requiredConsentsAccepted,
    setRegistrationForm,
    setOnboardingForm,
    handleRegistrationSubmit,
    handleOnboardingSubmit,
  } = onboarding

  return (
    <Stack spacing={3}>
      {requestError ? <Alert severity="error">{requestError}</Alert> : null}
      {patient?.emergencySymptoms ? (
        <Alert severity="warning">
          Emergency symptoms detected in patient intake. Booking flow should force manual review or emergency guidance.
        </Alert>
      ) : null}

      <Paper elevation={0} sx={{ p: 3, borderRadius: 5, border: '1px solid', borderColor: 'divider' }}>
        <Stepper activeStep={patientStep} alternativeLabel>
          {patientSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        <Grid  ={}  ={} >
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 5 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <SectionHeader eyebrow="Step 1" title="Patient registration" status={patient ? 'Created' : 'Pending'} statusColor={patient ? 'success' : 'default'} />
                <Box component="form" onSubmit={handleRegistrationSubmit} sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid  ={}  ={} >
                      <Field label="Display name" value={registrationForm.displayName} onChange={(value) => setRegistrationForm((current) => ({ ...current, displayName: value }))} error={registrationErrors.displayName?.[0]} placeholder="Ana Kovacs" />
                    </Grid>
                    <Grid  ={}  ={} >
                      <Field label="Email" type="email" value={registrationForm.email} onChange={(value) => setRegistrationForm((current) => ({ ...current, email: value }))} error={registrationErrors.email?.[0]} placeholder="ana@example.com" />
                    </Grid>
                    <Grid  ={}  ={} >
                      <Field label="Country" value={registrationForm.countryCode} onChange={(value) => setRegistrationForm((current) => ({ ...current, countryCode: value.toUpperCase() }))} error={registrationErrors.countryCode?.[0]} placeholder="DE" />
                    </Grid>
                    <Grid  ={}  ={} >
                      <SelectField label="Preferred language" value={registrationForm.preferredLanguage} onChange={(value) => setRegistrationForm((current) => ({ ...current, preferredLanguage: value }))} error={registrationErrors.preferredLanguage?.[0]} options={languageOptions} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <Button type="submit" variant="contained" fullWidth size="large" disabled={registrationPending} sx={{ minHeight: 56 }}>
                        {registrationPending ? 'Creating account...' : 'Create patient account'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 5 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <SectionHeader eyebrow="Step 2" title="Consent capture and medical intake" status={patient?.hasMedicalProfile ? 'Complete' : 'In progress'} statusColor={patient?.hasMedicalProfile ? 'success' : 'warning'} />
                <Box component="form" onSubmit={handleOnboardingSubmit} sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid  ={}  ={} >
                      <SelectField label="Consent language" value={onboardingForm.consentLanguage} onChange={(value) => setOnboardingForm((current) => ({ ...current, consentLanguage: value }))} error={onboardingErrors.consentLanguage?.[0]} options={languageOptions} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <Field label="Date of birth" type="date" value={onboardingForm.dateOfBirth} onChange={(value) => setOnboardingForm((current) => ({ ...current, dateOfBirth: value }))} error={onboardingErrors.dateOfBirth?.[0]} shrink />
                    </Grid>
                    <Grid  ={}  ={} >
                      <SelectField label="Sex at birth" value={onboardingForm.sexAtBirth} onChange={(value) => setOnboardingForm((current) => ({ ...current, sexAtBirth: value }))} options={sexOptions} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <Field label="Phone number" value={onboardingForm.phoneNumber} onChange={(value) => setOnboardingForm((current) => ({ ...current, phoneNumber: value }))} error={onboardingErrors.phoneNumber?.[0]} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <Field label="City" value={onboardingForm.city} onChange={(value) => setOnboardingForm((current) => ({ ...current, city: value }))} error={onboardingErrors.city?.[0]} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <Field label="Time zone" value={onboardingForm.timeZone} onChange={(value) => setOnboardingForm((current) => ({ ...current, timeZone: value }))} error={onboardingErrors.timeZone?.[0]} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <Field label="Emergency contact name" value={onboardingForm.emergencyContactName} onChange={(value) => setOnboardingForm((current) => ({ ...current, emergencyContactName: value }))} error={onboardingErrors.emergencyContactName?.[0]} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <Field label="Emergency contact phone" value={onboardingForm.emergencyContactPhone} onChange={(value) => setOnboardingForm((current) => ({ ...current, emergencyContactPhone: value }))} error={onboardingErrors.emergencyContactPhone?.[0]} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <Field label="Relationship" value={onboardingForm.emergencyContactRelationship} onChange={(value) => setOnboardingForm((current) => ({ ...current, emergencyContactRelationship: value }))} error={onboardingErrors.emergencyContactRelationship?.[0]} />
                    </Grid>
                    <Grid  ={} >
                      <Field label="Chief concern" value={onboardingForm.chiefConcern} onChange={(value) => setOnboardingForm((current) => ({ ...current, chiefConcern: value }))} error={onboardingErrors.chiefConcern?.[0]} multiline minRows={3} />
                    </Grid>
                    <Grid  ={} >
                      <Field label="Symptoms" value={onboardingForm.symptoms} onChange={(value) => setOnboardingForm((current) => ({ ...current, symptoms: value }))} error={onboardingErrors.symptoms?.[0]} multiline minRows={3} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <Field label="Symptom duration" value={onboardingForm.symptomDuration} onChange={(value) => setOnboardingForm((current) => ({ ...current, symptomDuration: value }))} error={onboardingErrors.symptomDuration?.[0]} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <SelectField label="Urgency level" value={onboardingForm.urgencyLevel} onChange={(value) => setOnboardingForm((current) => ({ ...current, urgencyLevel: value }))} error={onboardingErrors.urgencyLevel?.[0]} options={urgencyOptions} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <SelectField label="Consultation language" value={onboardingForm.preferredConsultationLanguage} onChange={(value) => setOnboardingForm((current) => ({ ...current, preferredConsultationLanguage: value }))} error={onboardingErrors.preferredConsultationLanguage?.[0]} options={languageOptions} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <SelectField label="Pregnancy status" value={onboardingForm.pregnancyStatus} onChange={(value) => setOnboardingForm((current) => ({ ...current, pregnancyStatus: value }))} options={pregnancyOptions} />
                    </Grid>
                    <Grid  ={}  ={} >
                      <ConsentCard title="Required and optional consents">
                        <ConsentToggle checked={onboardingForm.termsAccepted} onChange={(checked) => setOnboardingForm((current) => ({ ...current, termsAccepted: checked }))} label="I accept the platform terms of service." error={onboardingErrors.termsAccepted?.[0]} />
                        <ConsentToggle checked={onboardingForm.privacyAccepted} onChange={(checked) => setOnboardingForm((current) => ({ ...current, privacyAccepted: checked }))} label="I acknowledge the privacy policy and data rights notice." error={onboardingErrors.privacyAccepted?.[0]} />
                        <ConsentToggle checked={onboardingForm.teleconsultationAccepted} onChange={(checked) => setOnboardingForm((current) => ({ ...current, teleconsultationAccepted: checked }))} label="I consent to teleconsultation care." error={onboardingErrors.teleconsultationAccepted?.[0]} />
                        <ConsentToggle checked={onboardingForm.healthDataProcessingAccepted} onChange={(checked) => setOnboardingForm((current) => ({ ...current, healthDataProcessingAccepted: checked }))} label="I explicitly consent to health data processing." error={onboardingErrors.healthDataProcessingAccepted?.[0]} />
                        <ConsentToggle checked={onboardingForm.researchAccepted} onChange={(checked) => setOnboardingForm((current) => ({ ...current, researchAccepted: checked }))} label="I optionally allow approved research reuse." />
                        <ConsentToggle checked={onboardingForm.marketingAccepted} onChange={(checked) => setOnboardingForm((current) => ({ ...current, marketingAccepted: checked }))} label="I optionally allow marketing communications." />
                      </ConsentCard>
                    </Grid>
                    <Grid  ={}  ={} >
                      <ConsentCard title="Emergency safeguards">
                        <ConsentToggle checked={onboardingForm.emergencySymptoms} onChange={(checked) => setOnboardingForm((current) => ({ ...current, emergencySymptoms: checked }))} label="These symptoms may be emergency-related." />
                        <ConsentToggle checked={onboardingForm.medicalDisclaimerAccepted} onChange={(checked) => setOnboardingForm((current) => ({ ...current, medicalDisclaimerAccepted: checked }))} label="I understand teleconsultation is not for emergencies." error={onboardingErrors.medicalDisclaimerAccepted?.[0]} />
                        <Alert severity="info">Emergency warning state ko booking and support workflows ke sath later join kiya ja sakta hai.</Alert>
                      </ConsentCard>
                    </Grid>
                    <Grid  ={} >
                      <Button type="submit" variant="contained" size="large" disabled={!patient || onboardingPending}>
                        {onboardingPending ? 'Saving onboarding...' : 'Save consents and medical profile'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
        <Grid  ={}  ={} >
          <Stack spacing={3}>
            <InfoCard title="Patient summary" eyebrow="Live progression">
              <MetricRow label="Patient ID" value={patient?.id ?? 'Pending creation'} />
              <MetricRow label="Required consents" value={`${requiredConsentsAccepted}/4 captured`} />
              <MetricRow label="Medical profile" value={patient?.hasMedicalProfile ? 'Complete' : 'Incomplete'} />
              <MetricRow label="Emergency flag" value={patient?.emergencySymptoms ? 'Raised' : 'Clear'} />
            </InfoCard>
            <InfoCard title="Patient portal next" eyebrow="Design direction">
              <List disablePadding>
                <BulletRow text="Upcoming consultations card with join CTA" />
                <BulletRow text="Medical history timeline and prescriptions view" />
                <BulletRow text="Wallet balance, privacy center, and support tickets" />
              </List>
            </InfoCard>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}
